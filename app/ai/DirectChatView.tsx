"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import {
  IconCopy,
  IconShare,
  IconRefresh,
  IconThumbUp,
  IconThumbDown,
  UserAvatar,
} from "./icons";
import ModelSelect from "./ModelSelect";
import { getModel } from "@/lib/aiModels";
import { wrapPromptWithModes } from "./composerHelpers";
import MarkdownMessage from "./MarkdownMessage";
import ArenaComposer from "./ArenaComposer";
import { useArenaAuth } from "./ArenaAuthContext";
import {
  startRunStream,
  stopRunStream,
  classifyRunStreamError,
  runStreamErrorMessage,
} from "@/lib/ai/client/runStream";
import { buildRunMessages } from "@/lib/ai/client/buildMessages";
import type { RunSSEEvent } from "@/lib/ai/streaming/sse";

export type ChatTurn = {
  id: string;
  prompt: string;
  response: string;
  streaming?: boolean;
  imageUrl?: string;
  attachmentUrls?: string[];
  isImageGen?: boolean;
};

type Vote = "up" | "down";

type PendingAttachment = { url: string; mime: string; preview: string };

export default function DirectChatView({
  modelId,
  threadId: initialThreadId = null,
  initialTurns = [],
  bootstrapPrompt = null,
  bootstrapAttachments = [],
  initialCodeMode = false,
  initialWebMode = false,
  onCreditsChange,
  onModelChange,
  hideModelBar = false,
  plan = "free",
  guestMode = false,
}: {
  modelId: string;
  threadId?: string | null;
  initialTurns?: ChatTurn[];
  bootstrapPrompt?: string | null;
  bootstrapAttachments?: PendingAttachment[];
  initialCodeMode?: boolean;
  initialWebMode?: boolean;
  onCreditsChange?: (n: number) => void;
  onModelChange?: (id: string) => void;
  hideModelBar?: boolean;
  plan?: string;
  guestMode?: boolean;
}) {
  const router = useRouter();
  const { plan: authPlan, setCredits: authSetCredits } = useArenaAuth();
  const effectivePlan = guestMode ? plan : authPlan || plan;
  const applyCredits = onCreditsChange ?? authSetCredits;

  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [turns, setTurns] = useState<ChatTurn[]>(initialTurns);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatModel, setChatModel] = useState(modelId);
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [codeMode, setCodeMode] = useState(initialCodeMode);
  const [webMode, setWebMode] = useState(initialWebMode);
  const [err, setErr] = useState<
    | ""
    | "credits_out"
    | "ai_error"
    | "network_error"
    | "server_error"
    | "unauthorized"
    | "no_vision"
    | "guest_direct_limit"
    | "cancelled"
    | "rate_limited"
    | "plan_locked"
  >("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const bootRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string | null>(null);
  const streamAbortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setChatModel(modelId);
  }, [modelId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [turns]);

  async function uploadFile(file: File) {
    if (attachments.length >= 2) return;
    setUploading(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ai/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setErr("server_error");
        setUploading(false);
        return;
      }
      setAttachments((a) => [
        ...a,
        { url: data.url, mime: data.mime, preview: data.url },
      ]);
    } catch {
      setErr("server_error");
    }
    setUploading(false);
  }

  async function streamMessage(
    q: string,
    activeThreadId: string | null,
    opts?: { replaceTurnId?: string; attach?: PendingAttachment[]; code?: boolean; web?: boolean }
  ) {
    if (guestMode) {
      window.dispatchEvent(new Event("ai:open-login"));
      return;
    }
    if (streaming) return;
    const attach = opts?.attach || attachments;
    const useCode = opts?.code ?? codeMode;
    const useWeb = opts?.web ?? webMode;
    const apiPrompt = wrapPromptWithModes(q, { codeMode: useCode });
    if (!apiPrompt.trim() && attach.length === 0) return;
    if (attach.length > 0 && !getModel(chatModel)?.capabilities?.vision) {
      setErr("no_vision");
      return;
    }

    setStreaming(true);
    setErr("");
    setAttachments([]);

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    runIdRef.current = null;
    streamAbortRef.current = null;

    const tmpId = opts?.replaceTurnId || `tmp-${Date.now()}`;
    const attachUrls = attach.map((a) => a.url);

    if (opts?.replaceTurnId) {
      setTurns((t) =>
        t.map((x) =>
          x.id === opts.replaceTurnId
            ? { ...x, response: "", streaming: true, attachmentUrls: attachUrls }
            : x
        )
      );
    } else {
      setTurns((t) => [
        ...t,
        {
          id: tmpId,
          prompt: q,
          response: "",
          streaming: true,
          attachmentUrls: attachUrls.length ? attachUrls : undefined,
        },
      ]);
    }

    try {
      if (guestMode) {
        const chatUrl = "/api/ai/chat/guest";
        const res = await fetch(chatUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            prompt: apiPrompt,
            threadId: activeThreadId,
          }),
        });

        if (res.status === 401) {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          const errBody = await res.text().catch(() => "");
          if (errBody.includes("guest_direct_limit")) setErr("guest_direct_limit");
          else setErr("unauthorized");
          setStreaming(false);
          window.dispatchEvent(new Event("ai:open-login"));
          return;
        }
        if (!res.ok || !res.body) {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("server_error");
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";

        while (true) {
          if (ac.signal.aborted) break;
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() || "";
          for (const chunk of chunks) {
            const line = chunk.trim();
            if (!line.startsWith("data:")) continue;
            let data: Record<string, unknown>;
            try {
              data = JSON.parse(line.slice(5).trim());
            } catch {
              continue;
            }
            if (data.type === "delta" && typeof data.text === "string") {
              full += data.text;
              setTurns((t) => t.map((x) => (x.id === tmpId ? { ...x, response: full } : x)));
            } else if (data.type === "done") {
              finishTurn(
                tmpId,
                q,
                String(data.id),
                String(data.threadId),
                String(data.responseA ?? full),
                attachUrls,
                !!data.isNewThread,
                data.creditsRemaining
              );
              setStreaming(false);
              return;
            }
          }
        }
        setStreaming(false);
        return;
      }

      const priorTurns = opts?.replaceTurnId
        ? turns.filter((t) => t.id !== opts.replaceTurnId)
        : turns;
      const useServerHistory = !!activeThreadId && !opts?.replaceTurnId;

      let full = "";
      const result = await startRunStream(
        {
          mode: "direct",
          model: chatModel,
          ...(useServerHistory ? {} : { messages: buildRunMessages(priorTurns, q) }),
          prompt: apiPrompt,
          conversationId: activeThreadId,
          webSearch: useWeb,
          attachments: attach.map((a) => ({ url: a.url, mime: a.mime })),
        },
        {
          onRunId: (id) => {
            runIdRef.current = id;
          },
          onEvent: (ev: RunSSEEvent) => {
            if (ev.type === "model_delta") {
              full += ev.text;
              setTurns((t) =>
                t.map((x) => (x.id === tmpId ? { ...x, response: full } : x))
              );
            } else if (ev.type === "usage_update") {
              applyCredits(ev.creditsRemaining);
            }
          },
        },
        ac.signal
      );

      streamAbortRef.current = result.abort;

      if (result.lastErrorCode) {
        const code = classifyRunStreamError(result.lastErrorCode);
        if (code === "unauthorized") {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("unauthorized");
          window.dispatchEvent(new Event("ai:open-login"));
        } else if (code === "insufficient_credits") {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          else setTurns((t) => t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x)));
          setErr("credits_out");
        } else if (code === "invalid_model") {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("no_vision");
        } else if (code === "plan_upgrade_required") {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("plan_locked");
        } else if (code === "rate_limited" || code === "too_many_concurrent") {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("rate_limited");
        } else if (code === "cancelled" || result.status === "cancelled") {
          setTurns((t) =>
            t.map((x) =>
              x.id === tmpId ? { ...x, response: full || x.response, streaming: false } : x
            )
          );
          setErr("cancelled");
        } else if (code === "provider_error") {
          setTurns((t) =>
            t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
          );
          setErr("ai_error");
        } else {
          if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("server_error");
        }
        setStreaming(false);
        return;
      }

      if (result.status === "cancelled" || ac.signal.aborted) {
        setTurns((t) =>
          t.map((x) =>
            x.id === tmpId ? { ...x, response: full || x.response, streaming: false } : x
          )
        );
        setErr("cancelled");
        setStreaming(false);
        return;
      }

      if (result.status === "completed") {
        const runId = result.runId ?? runIdRef.current ?? tmpId;
        const conversationId = activeThreadId ?? runId;
        finishTurn(
          tmpId,
          q,
          runId,
          conversationId,
          full,
          attachUrls,
          !activeThreadId,
          undefined
        );
      } else {
        setTurns((t) =>
          t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
        );
        setErr("ai_error");
      }
    } catch (e) {
      if (ac.signal.aborted) {
        setTurns((t) =>
          t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
        );
        setErr("cancelled");
        setStreaming(false);
        if (abortRef.current === ac) abortRef.current = null;
        return;
      }
      if (!opts?.replaceTurnId) setTurns((t) => t.filter((x) => x.id !== tmpId));
      setErr("server_error");
    }
    setStreaming(false);
    if (abortRef.current === ac) abortRef.current = null;
    runIdRef.current = null;
    streamAbortRef.current = null;
  }

  async function stopStream() {
    const runId = runIdRef.current;
    const abort = streamAbortRef.current;
    abortRef.current?.abort();
    if (abort) abort();
    if (runId) await stopRunStream(runId, () => undefined);
  }

  function finishTurn(
    tmpId: string,
    q: string,
    id: string,
    tid: string,
    responseA: string,
    attachUrls: string[],
    isNewThread: boolean,
    creditsRemaining: unknown
  ) {
    setTurns((t) =>
      t.map((x) =>
        x.id === tmpId
          ? {
              id,
              prompt: q,
              response: responseA,
              streaming: false,
              attachmentUrls: attachUrls.length ? attachUrls : undefined,
            }
          : x
      )
    );

    if (isNewThread && !guestMode) {
      setThreadId(tid);
      window.dispatchEvent(
        new CustomEvent("ai:thread-created", {
          detail: {
            id: tid,
            latestRunId: id,
            title: q.slice(0, 80),
            tier: "direct",
            createdAt: new Date().toISOString(),
            source: "run",
          },
        })
      );
    } else if (isNewThread && guestMode) {
      setThreadId(tid);
    }

    if (!guestMode) {
      replaceThreadUrl(`/ai/runs/${id}`);
    }

    if (typeof creditsRemaining === "number") applyCredits(creditsRemaining);
    window.setTimeout(() => window.dispatchEvent(new Event("ai:refresh")), 400);
  }

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current) return;
    bootRef.current = true;
    streamMessage(bootstrapPrompt, initialThreadId, {
      attach: bootstrapAttachments,
      code: initialCodeMode,
      web: initialWebMode,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  function send() {
    const q = input.trim();
    if ((!q && attachments.length === 0) || streaming) return;
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
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        /* cancelled */
      }
    }
    await copyText("share", text);
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
    if (!isLast || streaming || turn.streaming || turn.isImageGen) return;
    streamMessage(turn.prompt, threadId, {
      replaceTurnId: turn.id,
      attach: turn.attachmentUrls?.map((url) => ({ url, mime: "image/jpeg", preview: url })),
    });
  }

  const lastTurnId = turns[turns.length - 1]?.id;
  const activeInfo = getModel(chatModel);

  return (
    <div className="ar-chat-wrap">
      <div
        className="ar-sr-only"
        aria-live="polite"
        aria-atomic="false"
      >
        {streaming && turns.length > 0 && turns[turns.length - 1]?.response
          ? turns[turns.length - 1].response.slice(-120)
          : ""}
      </div>
      <div className="ar-chat-scroll">
        {turns.map((t) => {
          const isLast = t.id === lastTurnId;
          return (
            <div key={t.id} className="ar-turn">
              <div className="ar-msg-user-row">
                <UserAvatar initial="ش" size={34} />
                <div className="ar-msg-user-bubble">
                  {t.attachmentUrls?.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={url} src={url} alt="" className="ar-msg-attach-thumb" />
                  ))}
                  {t.prompt}
                </div>
              </div>

              <div className="ar-msg-ai-block">
                {t.isImageGen && t.streaming && (
                  <div className="ar-img-skeleton">در حال ساخت تصویر…</div>
                )}
                {t.imageUrl && (
                  <div className="ar-msg-gen-image">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.imageUrl} alt={t.prompt} />
                    <a href={t.imageUrl} download target="_blank" rel="noopener noreferrer">
                      دانلود
                    </a>
                  </div>
                )}
                <MarkdownMessage
                  text={t.response}
                  className="ar-msg-ai-text"
                  streaming={!!t.streaming && !t.isImageGen}
                />
                {!t.response && !t.streaming && !t.isImageGen && (
                  <div className="ar-msg-ai-text">…</div>
                )}

                {!t.streaming && (t.response || t.imageUrl) && (
                  <div className="ar-msg-actions">
                    <button
                      type="button"
                      className="ar-msg-action-btn"
                      aria-label="اشتراک‌گذاری"
                      onClick={() => shareText(t.response || t.imageUrl || "")}
                    >
                      <IconShare size={15} />
                    </button>
                    {!t.isImageGen && (
                      <>
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
                      </>
                    )}
                    <button
                      type="button"
                      className={`ar-msg-action-btn${copiedId === t.id ? " active" : ""}`}
                      aria-label="کپی"
                      onClick={() => copyText(t.id, t.response || t.imageUrl || "")}
                    >
                      <IconCopy size={15} />
                    </button>
                    {isLast && (
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
        {!hideModelBar && (
          <div className="ar-chat-model-bar">
            <ModelSelect
              value={chatModel}
              onChange={(id) => {
                setChatModel(id);
                onModelChange?.(id);
              }}
              plan={effectivePlan}
              picker="direct"
              variant="bar"
              visionOnly={attachments.length > 0}
              sheetOnMobile
            />
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) uploadFile(f);
            e.target.value = "";
          }}
        />

        <ArenaComposer
          input={input}
          onInputChange={setInput}
          onSubmit={handleComposerAction}
          onStop={stopStream}
          streaming={streaming}
          uploading={uploading}
          attachments={attachments}
          onRemoveAttachment={(url) => setAttachments((x) => x.filter((y) => y.url !== url))}
          onAttachClick={() => fileRef.current?.click()}
          codeMode={codeMode}
          onToggleCode={() => setCodeMode((v) => !v)}
          webMode={webMode}
          onToggleWeb={() => setWebMode((v) => !v)}
          guestMode={guestMode}
          onNeedAuth={() => setErr("unauthorized")}
          textareaRef={taRef}
        />
        {activeInfo && (
          <div className="ar-chat-footnote">
            پاسخ با {activeInfo.name}
            <span className="powered-by"> · {activeInfo.poweredBy}</span>
            {attachments.length > 0 ? " (+۱ کردیت vision)" : ""} · ممکن است نادرست باشد
          </div>
        )}
        {err === "no_vision" && (
          <div className="ar-chat-err">این مدل از تصویر پشتیبانی نمی‌کند — مدل vision انتخاب کن.</div>
        )}
        {err === "credits_out" && (
          <div className="ar-chat-err">
            کردیت‌هایت تمام شده —{" "}
            <Link href="/ai/content-sales">Content & Sales Bundle</Link>
            {" · "}
            <Link href="/ai/pricing">خرید کردیت</Link>
          </div>
        )}
        {err === "network_error" && (
          <div className="ar-chat-err">اتصال به سرور AI برقرار نشد — چند ثانیه بعد دوباره تلاش کن.</div>
        )}
        {err === "ai_error" && <div className="ar-chat-err">{runStreamErrorMessage("provider_error")}</div>}
        {err === "cancelled" && (
          <div className="ar-chat-err">{runStreamErrorMessage("cancelled")}</div>
        )}
        {err === "rate_limited" && (
          <div className="ar-chat-err">{runStreamErrorMessage("rate_limited")}</div>
        )}
        {err === "plan_locked" && (
          <div className="ar-chat-err">{runStreamErrorMessage("plan_upgrade_required")}</div>
        )}
        {err === "server_error" && <div className="ar-chat-err">{runStreamErrorMessage("server_error")}</div>}
      </div>
    </div>
  );
}
