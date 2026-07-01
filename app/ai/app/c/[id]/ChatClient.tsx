"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AGENTS,
  AgentAvatar,
  ModelAvatar,
  ModeratorOrb,
  type AgentKey,
  IconArrowRight,
  IconSend,
  IconCopy,
  IconCheck,
  IconBolt,
  IconSpark,
  IconSeal,
} from "../../../icons";
import {
  getModel,
  modelName,
  DEFAULT_COUNCIL,
} from "@/lib/aiModels";
import ModelPicker from "../../../ModelPicker";

type Mode = "quick" | "brainstorm" | "critique";

interface AgentResponse {
  agent_role: string;
  content: string;
  order_index: number;
}

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  responses?: AgentResponse[];
}

const MODES: { id: Mode; label: string; Icon: typeof IconBolt }[] = [
  { id: "quick",      label: "پاسخ سریع",  Icon: IconBolt },
  { id: "brainstorm", label: "شورای هم‌فکری", Icon: IconSpark },
  { id: "critique",   label: "نقد و اصلاح", Icon: IconSeal },
];

/* Convert markdown headings into emoji bullets so raw ## doesn't show up */
function formatAIContent(text: string): string {
  if (!text) return text;
  return text
    .replace(/^###### (.*)$/gm, "▪️ $1")
    .replace(/^##### (.*)$/gm, "▫️ $1")
    .replace(/^#### (.*)$/gm, "🔸 $1")
    .replace(/^### (.*)$/gm, "🔹 $1")
    .replace(/^## (.*)$/gm, "🔷 $1")
    .replace(/^# (.*)$/gm, "🔶 $1");
}

// Which council members participate in each mode (shown in the composer)
const MODE_MEMBERS: Record<Mode, AgentKey[]> = {
  quick:      ["quick"],
  brainstorm: ["logical_analyst", "exec_advisor", "risk_critic", "creative"],
  critique:   ["initial", "accuracy_critic", "logic_critic", "practical_critic"],
};

const LOADING_MESSAGES: Record<Mode, string[]> = {
  quick: ["در حال آماده‌سازی پاسخ"],
  brainstorm: [
    "هوش‌های مصنوعی در حال پاسخ‌اند",
    "دیدگاه‌ها جمع‌آوری می‌شود",
    "هماهنگ‌کننده شورا در حال جمع‌بندی است",
  ],
  critique: [
    "پاسخ اولیه در حال تدوین است",
    "منتقدان در حال بررسی هستند",
    "نسخه نهایی بازنویسی می‌شود",
  ],
};

/* A single agent (persona) turn — used for critique */
function CouncilTurn({
  agentKey,
  content,
}: {
  agentKey: AgentKey;
  content: string;
}) {
  const meta = AGENTS[agentKey] ?? AGENTS.initial;
  return (
    <div className="ai-council-turn">
      <div className="ai-turn-head">
        <AgentAvatar agent={agentKey} />
        <div className="ai-turn-name">{meta.label}</div>
      </div>
      <div className="ai-turn-body">{formatAIContent(content)}</div>
    </div>
  );
}

/* A single AI-model turn — brand mark + model name + body */
function ModelTurn({ modelId, content }: { modelId: string; content: string }) {
  const m = getModel(modelId);
  return (
    <div className="ai-council-turn">
      <div className="ai-turn-head">
        <ModelAvatar modelId={modelId} />
        <div>
          <div className="ai-turn-name">{m?.name ?? modelName(modelId)}</div>
          {m?.blurb && <div className="ai-turn-sub">{m.blurb}</div>}
        </div>
      </div>
      <div className="ai-turn-body">{formatAIContent(content)}</div>
    </div>
  );
}

function ResponseView({ msg, mode }: { msg: Message; mode: Mode }) {
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (!msg.responses || msg.responses.length === 0) return null;

  const sorted = [...msg.responses].sort((a, b) => a.order_index - b.order_index);

  const copyBtn = (text: string, key: string, label = "کپی") => (
    <button
      className={`ai-action-btn${copied === key ? " copied" : ""}`}
      onClick={() => copyText(text, key)}
    >
      {copied === key ? <IconCheck size={14} /> : <IconCopy size={14} />}
      {copied === key ? "کپی شد" : label}
    </button>
  );

  if (mode === "quick") {
    const r = sorted[0];
    return (
      <div className="ai-response-section">
        <div className="ai-quick-card">
          <div className="ai-quick-body">{formatAIContent(r.content)}</div>
        </div>
        <div className="ai-action-bar" style={{ paddingInlineStart: 0 }}>
          {copyBtn(r.content, "q")}
        </div>
      </div>
    );
  }

  if (mode === "brainstorm") {
    const agents = sorted.filter((r) => r.agent_role !== "synthesizer");
    const synth = sorted.find((r) => r.agent_role === "synthesizer");

    return (
      <div className="ai-response-section">
        <div className="ai-council">
          {agents.map((r, i) => (
            <ModelTurn key={i} modelId={r.agent_role} content={r.content} />
          ))}
        </div>

        {synth && (
          <div className="ai-council-turn moderator">
            <div className="ai-turn-head">
              <ModeratorOrb />
              <div>
                <div className="ai-turn-name">هماهنگ‌کننده شورا</div>
                <div className="ai-turn-sub">جمع‌بندی دیدگاه‌ها و قدم بعدی</div>
              </div>
            </div>
            <div className="ai-turn-body">{formatAIContent(synth.content)}</div>
            <div className="ai-action-bar">{copyBtn(synth.content, "s", "کپی جمع‌بندی")}</div>
          </div>
        )}
      </div>
    );
  }

  // critique
  const initial = sorted.find((r) => r.agent_role === "initial");
  const critics = sorted.filter(
    (r) => r.agent_role !== "initial" && r.agent_role !== "final_improved"
  );
  const final = sorted.find((r) => r.agent_role === "final_improved");

  return (
    <div className="ai-response-section">
      <div className="ai-council">
        {initial && <CouncilTurn agentKey="initial" content={initial.content} />}
        {critics.map((r, i) => (
          <CouncilTurn key={i} agentKey={r.agent_role as AgentKey} content={r.content} />
        ))}
      </div>

      {final && (
        <div className="ai-council-turn moderator">
          <div className="ai-turn-head">
            <ModeratorOrb />
            <div>
              <div className="ai-turn-name">نسخه نهایی اصلاح‌شده</div>
              <div className="ai-turn-sub">پس از اعمال نقدها</div>
            </div>
          </div>
          <div className="ai-turn-body">{formatAIContent(final.content)}</div>
          <div className="ai-action-bar">{copyBtn(final.content, "f", "کپی نسخه نهایی")}</div>
        </div>
      )}
    </div>
  );
}

interface ChatClientProps {
  conversationId?: string;
  initialMessages?: Message[];
  initialMode?: Mode;
  initialTitle?: string;
}

export default function ChatClient({
  conversationId: initConvId,
  initialMessages = [],
  initialMode = "quick",
  initialTitle,
}: ChatClientProps) {
  const router = useRouter();
  const [convId, setConvId] = useState<string | null>(initConvId ?? null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [council, setCouncil] = useState<string[]>(DEFAULT_COUNCIL);
  const [quickModel, setQuickModel] = useState<string>(DEFAULT_COUNCIL[0]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"single" | "multi">("multi");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  useEffect(() => {
    fetch("/api/ai/auth")
      .then((r) => r.json())
      .then((d) => {
        if (d.authed && d.user) {
          setPlan(d.user.plan as string);
          if (credits === null) setCredits(d.user.credits as number);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startLoadingAnimation = useCallback((m: Mode) => {
    const steps = LOADING_MESSAGES[m];
    setLoadingStep(0);
    let i = 0;
    loadingTimer.current = setInterval(() => {
      i = (i + 1) % steps.length;
      setLoadingStep(i);
    }, 2000);
  }, []);

  const stopLoadingAnimation = useCallback(() => {
    if (loadingTimer.current) {
      clearInterval(loadingTimer.current);
      loadingTimer.current = null;
    }
  }, []);

  async function sendMessage() {
    const q = input.trim();
    if (!q || loading) return;

    setInput("");
    setError("");
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    startLoadingAnimation(mode);

    try {
      if (mode === "quick") {
        // Streaming path for quick mode
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: convId,
            mode,
            content: q,
            model: quickModel,
            stream: true,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          if (errData.error === "insufficient_credits") {
            setError("کردیت کافی نداری. برای ادامه اعتبار بخر.");
          } else if (errData.error === "plan_upgrade_required") {
            setError("برای این حالت باید پلن خود را ارتقاء دهی.");
          } else {
            setError("خطایی رخ داد. دوباره تلاش کن.");
          }
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        const newConvId = res.headers.get("X-Conversation-Id");
        if (newConvId && !convId) {
          setConvId(newConvId);
          router.replace(`/ai/app/c/${newConvId}`, { scroll: false });
          if (!title && q) setTitle(q.slice(0, 60));
        }

        const creditsRemaining = res.headers.get("X-Credits-Remaining");
        if (creditsRemaining) setCredits(Number(creditsRemaining));

        // Start with empty streaming message
        const streamMsg: Message = {
          role: "assistant",
          content: "[structured]",
          responses: [{ agent_role: quickModel, content: "", order_index: 0 }],
        };
        setMessages((prev) => [...prev, streamMsg]);
        stopLoadingAnimation();

        // Read stream and update content live
        const reader = res.body?.getReader();
        if (!reader) throw new Error("No stream body");
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          // Update the last message's content in real-time
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.role === "assistant" && last.responses && last.responses[0]) {
              copy[copy.length - 1] = {
                ...last,
                responses: [{ ...last.responses[0], content: accumulated }],
              };
            }
            return copy;
          });
        }

        if (!accumulated.trim()) {
          setError("پاسخی دریافت نشد. دوباره تلاش کن.");
          setMessages((prev) => prev.slice(0, -1));
        }
      } else {
        // Non-streaming path for brainstorm / critique
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: convId,
            mode,
            content: q,
            ...(mode === "brainstorm" ? { models: council } : {}),
          }),
        });
        const data = await res.json();

        if (!data.ok) {
          if (data.error === "plan_upgrade_required" || data.error === "brainstorm_demo_exhausted") {
            setError("برای این حالت باید پلن خود را ارتقاء دهی.");
          } else if (data.error === "insufficient_credits") {
            setError("کردیت کافی نداری. برای ادامه اعتبار بخر.");
          } else {
            setError("خطایی رخ داد. دوباره تلاش کن.");
          }
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        if (!convId) {
          setConvId(data.conversation_id as string);
          router.replace(`/ai/app/c/${data.conversation_id}`, { scroll: false });
          if (!title && q) setTitle(q.slice(0, 60));
        }

        setCredits(data.credits_remaining as number);

        const aiMsg: Message = {
          role: "assistant",
          content: "[structured]",
          responses: data.responses as AgentResponse[],
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch {
      setError("خطا در اتصال. دوباره تلاش کن.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
      stopLoadingAnimation();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const currentLoadingMsg =
    LOADING_MESSAGES[mode][loadingStep] ?? LOADING_MESSAGES[mode][0];

  const emptyHint =
    mode === "quick"
      ? "یک هوش مصنوعی پاسخ می‌دهد"
      : mode === "brainstorm"
      ? "گفت‌وگوی چند AI برای جمع‌بندی بهتر"
      : "پاسخ اولیه نقد و سپس بهبود می‌یابد";

  return (
    <div className="ai-chat-shell">
      <header className="ai-chat-header">
        <div className="ai-container ai-chat-header-inner">
          <Link href="/ai/app" className="ai-back-btn" aria-label="بازگشت">
            <IconArrowRight size={18} />
          </Link>
          <div className="ai-chat-title">{title || "گفتگوی جدید"}</div>
          {credits !== null && (
            <div className="ai-credits-chip" style={{ flexShrink: 0 }}>
              <span>کردیت</span>
              <span className="num">{credits}</span>
            </div>
          )}
        </div>
      </header>

      <div className="ai-messages-area">
        <div className="ai-container">
          {messages.length === 0 && !loading && (
            <div className="ai-chat-empty">
              <ModeratorOrb size={52} />
              <div className="ai-chat-empty-title">سؤالت را بنویس</div>
              <div className="ai-chat-empty-sub">{emptyHint}</div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="ai-msg-wrap">
              {msg.role === "user" ? (
                <div className="ai-msg-user">
                  <div className="ai-msg-user-bubble">{msg.content}</div>
                </div>
              ) : (
                <ResponseView msg={msg} mode={mode} />
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-loading-wrap">
              <div className="ai-loading-row">
                <span className="ai-loading-orb" />
                <span className="ai-loading-text">{currentLoadingMsg}…</span>
              </div>
              {mode !== "quick" && (
                <div className="ai-council-skeleton">
                  {[0, 1, 2].map((r) => (
                    <div key={r} className="ai-skeleton-turn">
                      <div className="ai-skeleton-turn-head">
                        <div className="ai-skeleton ai-skeleton-dot" />
                        <div className="ai-skeleton" style={{ height: 14, width: 120 }} />
                      </div>
                      <div className="ai-skeleton" style={{ height: 48, marginInlineStart: 50 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="ai-limit-notice">
              {error} <Link href="/ai/pricing">مقایسه پلن‌ها</Link>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="ai-input-area">
        <div className="ai-container">
          {plan === "free" && (
            <div className="ai-gopro-banner">
              <span className="ai-gopro-text">
                به Pro ارتقا بده تا به همه‌ی حالت‌ها و کردیت بیشتر دسترسی داشته باشی.
              </span>
              <Link href="/ai/pricing" className="ai-gopro-btn">
                ارتقا به Pro
              </Link>
            </div>
          )}

          <div className="ai-mode-pills-wrap">
            {MODES.map((m) => {
              const Icon = m.Icon;
              return (
                <button
                  key={m.id}
                  className={`ai-mode-pill${mode === m.id ? " active" : ""}`}
                  onClick={() => setMode(m.id)}
                  disabled={loading}
                >
                  <Icon size={14} /> {m.label}
                </button>
              );
            })}
          </div>

          <div className="ai-textarea-row">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              placeholder="سؤالت را اینجا بنویس…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <div className="ai-composer-toolbar">
              {mode === "brainstorm" || mode === "quick" ? (
                <button
                  type="button"
                  className="ai-council-trigger"
                  onClick={() => {
                    setPickerMode(mode === "quick" ? "single" : "multi");
                    setShowPicker(true);
                  }}
                  disabled={loading}
                  title="انتخاب هوش‌ها"
                >
                  <div className="ai-members-stack">
                    {mode === "quick" ? (
                      <ModelAvatar modelId={quickModel} size={28} className="ai-mini-avatar" />
                    ) : (
                      council.map((id) => (
                        <ModelAvatar key={id} modelId={id} size={28} className="ai-mini-avatar" />
                      ))
                    )}
                    {mode !== "quick" && <ModeratorOrb size={28} className="ai-mini-orb" />}
                  </div>
                  <span className="ai-council-trigger-label">
                    {mode === "quick" ? "یک هوش مصنوعی" : "چند AI"}
                  </span>
                </button>
              ) : (
                <div
                  className="ai-members"
                  title="اعضای شورا و هماهنگ‌کننده"
                >
                  <div className="ai-members-stack">
                    {MODE_MEMBERS[mode].map((a) => (
                      <AgentAvatar key={a} agent={a} size={28} className="ai-mini-avatar" />
                    ))}
                    <ModeratorOrb size={28} className="ai-mini-orb" />
                  </div>
                </div>
              )}
              <button
                className="ai-send-btn"
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                aria-label="ارسال"
              >
                <IconSend className="ai-send-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ModelPicker
        open={showPicker}
        plan={plan ?? "free"}
        mode={pickerMode}
        initial={pickerMode === "single" ? [quickModel] : council}
        onClose={() => setShowPicker(false)}
        onSave={(ids) => {
          if (pickerMode === "single" && ids[0]) {
            setQuickModel(ids[0]);
          } else {
            setCouncil(ids);
          }
          setShowPicker(false);
        }}
      />
    </div>
  );
}
