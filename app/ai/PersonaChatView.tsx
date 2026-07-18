"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import {
  IconSend,
  IconStop,
  IconCopy,
  IconShare,
  IconRefresh,
  IconThumbUp,
  IconThumbDown,
  IconArrowLeft,
  UserAvatar,
} from "./icons";
import ModelSelect from "./ModelSelect";
import { getModel } from "@/lib/aiModels";
import type { AiPersona } from "@/lib/aiPersonas";
import { PERSONA_DISCLAIMER_FA } from "@/lib/aiPersonas";
import PersonaImage from "./PersonaImage";
import MarkdownMessage from "./MarkdownMessage";
import type { ChatTurn } from "./DirectChatView";
import {
  classifyRunStreamError,
  startRunStream,
  type RunSSEEvent,
} from "@/lib/ai/client/runStream";

type Vote = "up" | "down";

const GREETING_ID = "persona-greeting";

function promptPersonaLogin() {
  window.dispatchEvent(
    new CustomEvent("ai:open-login", {
      detail: { hint: "برای گفتگو با این شخصیت، با شماره موبایل وارد شو یا ثبت‌نام کن." },
    })
  );
}

function PersonaAvatar({ persona, size = 34 }: { persona: AiPersona; size?: number }) {
  return (
    <PersonaImage
      persona={persona}
      variant="thumb"
      className="ar-persona-avatar"
      style={{ width: size, height: size }}
    />
  );
}

export default function PersonaChatView({
  persona,
  modelId,
  threadId: initialThreadId = null,
  initialTurns = [],
  bootstrapPrompt = null,
  onCreditsChange,
  plan = "free",
  guestMode = false,
}: {
  persona: AiPersona;
  modelId: string;
  threadId?: string | null;
  initialTurns?: ChatTurn[];
  bootstrapPrompt?: string | null;
  onCreditsChange?: (n: number) => void;
  plan?: string;
  guestMode?: boolean;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [turns, setTurns] = useState<ChatTurn[]>(() => {
    if (initialTurns.length > 0) return initialTurns;
    return [
      {
        id: GREETING_ID,
        prompt: "",
        response: persona.greetingFa,
        streaming: false,
      },
    ];
  });
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatModel, setChatModel] = useState(modelId);
  const [err, setErr] = useState<
    "" | "credits_out" | "ai_error" | "network_error" | "server_error" | "unauthorized"
  >("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const bootRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setChatModel(modelId);
  }, [modelId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  async function streamMessage(
    q: string,
    activeThreadId: string | null,
    opts?: { replaceTurnId?: string }
  ) {
    if (guestMode) {
      promptPersonaLogin();
      return;
    }
    if (streaming) return;
    if (!q.trim()) return;

    setStreaming(true);
    setErr("");

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const tmpId = opts?.replaceTurnId || `tmp-${Date.now()}`;

    if (opts?.replaceTurnId) {
      setTurns((t) =>
        t.map((x) =>
          x.id === opts.replaceTurnId ? { ...x, response: "", streaming: true } : x
        )
      );
    } else {
      setTurns((t) => [
        ...t.filter((x) => x.id !== GREETING_ID),
        {
          id: tmpId,
          prompt: q,
          response: "",
          streaming: true,
        },
      ]);
    }

    try {
      let full = "";
      let creditsRemaining: number | undefined;
      const result = await startRunStream(
        {
          mode: "direct",
          model: chatModel,
          prompt: q,
          conversationId: activeThreadId,
          personaKey: persona.id,
        },
        {
          onEvent: (ev: RunSSEEvent) => {
            if (ev.type === "model_delta") {
              full += ev.text;
              setTurns((t) =>
                t.map((x) => (x.id === tmpId ? { ...x, response: full } : x))
              );
            } else if (ev.type === "usage_update") {
              creditsRemaining = ev.creditsRemaining;
            }
          },
        },
        ac.signal
      );

      if (result.status === "completed" && result.runId) {
        finishTurn(
          tmpId,
          q,
          result.runId,
          activeThreadId ?? result.runId,
          full,
          !activeThreadId,
          creditsRemaining
        );
        setStreaming(false);
        return;
      }

      if (result.status === "aborted" || result.status === "cancelled") {
        setTurns((t) =>
          t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
        );
        setStreaming(false);
        return;
      }

      const code = classifyRunStreamError(result.lastErrorCode ?? "server_error");
      if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
      if (code === "unauthorized") setErr("unauthorized");
      else if (code === "insufficient_credits") setErr("credits_out");
      else if (code === "network_error") setErr("network_error");
      else if (code === "provider_error") setErr("ai_error");
      else setErr("server_error");
    } catch (e) {
      if (ac.signal.aborted) {
        setTurns((t) =>
          t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
        );
        setStreaming(false);
        if (abortRef.current === ac) abortRef.current = null;
        return;
      }
      if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
      setErr("server_error");
    }
    setStreaming(false);
    if (abortRef.current === ac) abortRef.current = null;
  }

  function stopStream() {
    abortRef.current?.abort();
  }

  function finishTurn(
    tmpId: string,
    q: string,
    id: string,
    tid: string,
    responseA: string,
    isNewThread: boolean,
    creditsRemaining: unknown
  ) {
    setTurns((t) =>
      t.map((x) =>
        x.id === tmpId
          ? { id, prompt: q, response: responseA, streaming: false }
          : x
      )
    );

    if (isNewThread && !guestMode) {
      setThreadId(tid);
      window.dispatchEvent(
        new CustomEvent("ai:thread-created", {
          detail: {
            id: tid,
            title: `${persona.nameFa}: ${q.slice(0, 60)}`,
            tier: "persona",
            personaKey: persona.id,
            createdAt: new Date().toISOString(),
          } satisfies import("@/lib/aiHistory").HistoryItem,
        })
      );
      replaceThreadUrl(`/ai/personas/${persona.id}?thread=${tid}`);
    } else if (isNewThread && guestMode) {
      setThreadId(tid);
      replaceThreadUrl(`/ai/personas/${persona.id}?thread=${tid}`);
    }

    if (typeof creditsRemaining === "number") onCreditsChange?.(creditsRemaining);
    window.setTimeout(() => window.dispatchEvent(new Event("ai:refresh")), 400);
  }

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current) return;
    bootRef.current = true;
    setTurns((t) => t.filter((x) => x.id !== GREETING_ID));
    streamMessage(bootstrapPrompt, initialThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  function send() {
    const q = input.trim();
    if (!q || streaming) return;
    setInput("");
    if (taRef.current) taRef.current.style.height = "auto";
    streamMessage(q, threadId);
  }

  function handleComposerAction() {
    if (streaming) {
      stopStream();
      return;
    }
    send();
  }

  async function copyText(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800);
    } catch {
      /* ignore */
    }
  }

  async function shareText(text: string) {
    const snippet = `با ${persona.nameFa} در آرایه AI حرف زدم 🎭\n${text.slice(0, 120)}${text.length > 120 ? "…" : ""}\nhttps://araaye.com/ai/personas/${persona.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: snippet, title: `گفتگو با ${persona.nameFa}` });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copyText("share", snippet);
  }

  function toggleVote(id: string, v: Vote) {
    setVotes((prev) => {
      if (prev[id] === v) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: v };
    });
  }

  function regenerate(turn: ChatTurn, isLast: boolean) {
    if (!isLast || streaming || turn.streaming || !turn.prompt) return;
    streamMessage(turn.prompt, threadId, { replaceTurnId: turn.id });
  }

  function useSample(text: string) {
    if (streaming) return;
    setInput(text);
    taRef.current?.focus();
  }

  const lastTurnId = turns[turns.length - 1]?.id;
  const activeInfo = getModel(chatModel);
  const hasUserTurns = turns.some((t) => t.id !== GREETING_ID && !!t.prompt);

  return (
    <div className="ar-persona-chat">
      <header className="ar-persona-header">
        <Link href="/ai/personas" className="ar-persona-back" aria-label="بازگشت به گالری">
          <IconArrowLeft size={18} />
        </Link>
        <PersonaAvatar persona={persona} size={44} />
        <div className="ar-persona-header-text">
          <h1>{persona.nameFa}</h1>
          <p>{persona.taglineFa}</p>
          <span className="ar-persona-sim-badge">شبیه‌سازی AI</span>
        </div>
      </header>

      <p className="ar-persona-disclaimer">{PERSONA_DISCLAIMER_FA}</p>

      {!hasUserTurns && (
        <div className="ar-persona-samples">
          {persona.samplePrompts.map((s) => (
            <button key={s} type="button" className="ar-persona-sample-chip" onClick={() => useSample(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="ar-chat-wrap ar-persona-chat-wrap">
        <div className="ar-chat-scroll">
          {turns.map((t) => {
            const isLast = t.id === lastTurnId;
            const isGreeting = t.id === GREETING_ID && !t.prompt;
            return (
              <div key={t.id} className="ar-turn">
                {t.prompt ? (
                  <div className="ar-msg-user-row">
                    <UserAvatar initial="ش" size={34} />
                    <div className="ar-msg-user-bubble">{t.prompt}</div>
                  </div>
                ) : null}

                <div className="ar-msg-ai-block ar-msg-ai-block--persona">
                  <div className="ar-persona-msg-head">
                    <PersonaAvatar persona={persona} size={28} />
                    <span>{persona.nameFa}</span>
                  </div>
                  <MarkdownMessage
                    text={t.response}
                    className="ar-msg-ai-text"
                    streaming={!!t.streaming}
                  />
                  {!t.response && !t.streaming && <div className="ar-msg-ai-text">…</div>}

                  {!t.streaming && t.response && !isGreeting && (
                    <div className="ar-msg-actions">
                      <button
                        type="button"
                        className="ar-msg-action-btn"
                        aria-label="اشتراک‌گذاری"
                        onClick={() => shareText(t.response)}
                      >
                        <IconShare size={15} />
                      </button>
                      <button
                        type="button"
                        className={`ar-msg-action-btn${votes[t.id] === "down" ? " active" : ""}`}
                        aria-label="بد بود"
                        onClick={() => toggleVote(t.id, "down")}
                      >
                        <IconThumbDown size={15} />
                      </button>
                      <button
                        type="button"
                        className={`ar-msg-action-btn${votes[t.id] === "up" ? " active" : ""}`}
                        aria-label="خوب بود"
                        onClick={() => toggleVote(t.id, "up")}
                      >
                        <IconThumbUp size={15} />
                      </button>
                      <button
                        type="button"
                        className={`ar-msg-action-btn${copiedId === t.id ? " active" : ""}`}
                        aria-label="کپی"
                        onClick={() => copyText(t.id, t.response)}
                      >
                        <IconCopy size={15} />
                      </button>
                      {isLast && t.prompt && (
                        <button
                          type="button"
                          className="ar-msg-action-btn"
                          aria-label="تولید دوباره"
                          disabled={streaming}
                          onClick={() => regenerate(t, isLast)}
                        >
                          <IconRefresh size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="ar-chat-composer">
          <div className="ar-chat-model-bar">
            <ModelSelect
              value={chatModel}
              onChange={setChatModel}
              plan={plan}
              picker="direct"
              sheetOnMobile
            />
          </div>

          <div className="ar-composer ar-composer--dock">
            <div className="ar-composer-box">
              <textarea
                ref={taRef}
                rows={2}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleComposerAction();
                  }
                }}
                placeholder={`پیام به ${persona.nameFa}…`}
                maxLength={4000}
              />
              <div className="ar-composer-foot">
                <div className="ar-composer-actions">
                  <button
                    type="button"
                    className={`ar-send-btn ar-send-btn--dock${streaming ? " ar-send-btn--stop" : ""}`}
                    onClick={handleComposerAction}
                    disabled={!streaming && !input.trim()}
                    aria-label={streaming ? "توقف" : "ارسال"}
                  >
                    {streaming ? <IconStop size={16} /> : <IconSend size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {activeInfo && (
            <div className="ar-chat-footnote">
              پاسخ با {activeInfo.name}
              {activeInfo.poweredBy !== activeInfo.name && (
                <span className="powered-by"> · {activeInfo.poweredBy}</span>
              )}{" "}
              · ممکن است نادرست باشد
            </div>
          )}
          {err === "credits_out" && (
            <div className="ar-chat-err">
              کردیت‌هایت تمام شده — <Link href="/ai/pricing">خرید کردیت</Link>
            </div>
          )}
          {err === "unauthorized" && (
            <div className="ar-chat-err">
              برای گفتگو{" "}
              <button type="button" className="ar-link-btn" onClick={promptPersonaLogin}>
                وارد حساب
              </button>{" "}
              شو.
            </div>
          )}
          {err === "network_error" && (
            <div className="ar-chat-err">اتصال به سرور AI برقرار نشد — چند ثانیه بعد دوباره تلاش کن.</div>
          )}
          {err === "ai_error" && <div className="ar-chat-err">مدل پاسخ نداد. دوباره تلاش کن.</div>}
          {err === "server_error" && <div className="ar-chat-err">خطایی پیش آمد. دوباره تلاش کن.</div>}
        </div>
      </div>
    </div>
  );
}
