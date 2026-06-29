"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const AGENT_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: string }
> = {
  quick:           { label: "جواب سریع",        badgeClass: "synth",     icon: "⚡" },
  logical_analyst: { label: "تحلیل‌گر منطقی",   badgeClass: "logical",   icon: "📊" },
  exec_advisor:    { label: "مشاور اجرایی",      badgeClass: "exec",      icon: "💼" },
  risk_critic:     { label: "منتقد ریسک",        badgeClass: "risk",      icon: "⚠️" },
  creative:        { label: "متفکر خلاق",        badgeClass: "creative",  icon: "💡" },
  synthesizer:     { label: "جمع‌بندی نهایی",   badgeClass: "synth",     icon: "✦" },
  initial:         { label: "جواب اولیه",        badgeClass: "initial",   icon: "📝" },
  accuracy_critic: { label: "نقد دقت اطلاعات",  badgeClass: "acc",       icon: "🔍" },
  logic_critic:    { label: "نقد منطق",          badgeClass: "logic",     icon: "🔗" },
  practical_critic:{ label: "نقد اجرایی",        badgeClass: "practical", icon: "⚙️" },
  final_improved:  { label: "نسخه بهتر",         badgeClass: "final",     icon: "✅" },
};

const MODES: { id: Mode; label: string; icon: string; cost: string }[] = [
  { id: "quick",      label: "جواب سریع",  icon: "⚡", cost: "۱" },
  { id: "brainstorm", label: "همفکری",     icon: "🧠", cost: "۲" },
  { id: "critique",   label: "نقد و اصلاح", icon: "🔬", cost: "۳" },
];

const LOADING_MESSAGES: Record<Mode, string[]> = {
  quick:      ["در حال تولید جواب..."],
  brainstorm: [
    "تحلیل‌گر منطقی در حال بررسی است...",
    "مشاور اجرایی نظر می‌دهد...",
    "منتقد ریسک در حال ارزیابی است...",
    "متفکر خلاق ایده می‌دهد...",
    "در حال جمع‌بندی...",
  ],
  critique: [
    "در حال تولید جواب اولیه...",
    "منتقدان در حال بررسی...",
    "در حال بهبود نسخه نهایی...",
  ],
};

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

  if (mode === "quick") {
    const r = sorted[0];
    return (
      <div className="ai-response-section">
        <div className="ai-quick-card">
          <div className="ai-quick-body">{r.content}</div>
        </div>
        <div className="ai-action-bar">
          <button
            className={`ai-action-btn${copied === "q" ? " copied" : ""}`}
            onClick={() => copyText(r.content, "q")}
          >
            {copied === "q" ? "✓ کپی شد" : "📋 کپی"}
          </button>
        </div>
      </div>
    );
  }

  if (mode === "brainstorm") {
    const agents = sorted.filter((r) => r.agent_role !== "synthesizer");
    const synth = sorted.find((r) => r.agent_role === "synthesizer");

    return (
      <div className="ai-response-section">
        {/* Agent cards */}
        <div className="ai-agent-cards-grid">
          {agents.map((r, i) => {
            const cfg = AGENT_CONFIG[r.agent_role] || {
              label: r.agent_role,
              badgeClass: "initial",
              icon: "●",
            };
            return (
              <div key={i} className="ai-agent-card">
                <div className="ai-agent-card-head">
                  <span className={`ai-badge ai-badge-${cfg.badgeClass}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <div className="ai-agent-card-body">{r.content}</div>
              </div>
            );
          })}
        </div>

        {/* Synthesis */}
        {synth && (
          <div className="ai-synthesis-card">
            <div className="ai-synthesis-head">
              <span>✦</span>
              جمع‌بندی نهایی
            </div>
            <div className="ai-synthesis-body">{synth.content}</div>
            <div className="ai-action-bar" style={{ marginTop: 12 }}>
              <button
                className={`ai-action-btn${copied === "s" ? " copied" : ""}`}
                onClick={() => copyText(synth.content, "s")}
              >
                {copied === "s" ? "✓ کپی شد" : "📋 کپی جمع‌بندی"}
              </button>
            </div>
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
      {/* Initial */}
      {initial && (
        <div className="ai-agent-card" style={{ marginBottom: 12 }}>
          <div className="ai-agent-card-head">
            <span className="ai-badge ai-badge-initial">📝 جواب اولیه</span>
          </div>
          <div className="ai-agent-card-body">{initial.content}</div>
        </div>
      )}

      {/* Critics */}
      <div className="ai-agent-cards-grid" style={{ marginBottom: 12 }}>
        {critics.map((r, i) => {
          const cfg = AGENT_CONFIG[r.agent_role] || {
            label: r.agent_role,
            badgeClass: "initial",
            icon: "●",
          };
          return (
            <div key={i} className="ai-agent-card">
              <div className="ai-agent-card-head">
                <span className={`ai-badge ai-badge-${cfg.badgeClass}`}>
                  {cfg.icon} {cfg.label}
                </span>
              </div>
              <div className="ai-agent-card-body">{r.content}</div>
            </div>
          );
        })}
      </div>

      {/* Final improved */}
      {final && (
        <div className="ai-synthesis-card">
          <div className="ai-synthesis-head">
            <span>✅</span>
            نسخه بهتر و اصلاح‌شده
          </div>
          <div className="ai-synthesis-body">{final.content}</div>
          <div className="ai-action-bar" style={{ marginTop: 12 }}>
            <button
              className={`ai-action-btn${copied === "f" ? " copied" : ""}`}
              onClick={() => copyText(final.content, "f")}
            >
              {copied === "f" ? "✓ کپی شد" : "📋 کپی نسخه بهتر"}
            </button>
          </div>
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
  const [error, setError] = useState("");
  const [title, setTitle] = useState(initialTitle ?? "");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loadingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

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
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: convId,
          mode,
          content: q,
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

      // Update conversation ID and redirect if new
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

  const currentLoadingMsg = LOADING_MESSAGES[mode][loadingStep] ?? LOADING_MESSAGES[mode][0];

  return (
    <div className="ai-chat-shell">
      {/* Header */}
      <header className="ai-chat-header">
        <div className="ai-container ai-chat-header-inner">
          <Link href="/ai/app" className="ai-back-btn">
            ←
          </Link>
          <div className="ai-chat-title">
            {title || "چت جدید"}
          </div>
          {credits !== null && (
            <div className="ai-credits-chip" style={{ flexShrink: 0 }}>
              <span>کردیت:</span>
              <span className="num">{credits}</span>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="ai-messages-area">
        <div className="ai-container">
          {messages.length === 0 && !loading && (
            <div className="ai-empty-state" style={{ marginTop: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
              <div>سؤالت را بنویس</div>
              <div style={{ fontSize: 12, marginTop: 6, color: "var(--ai-text3)" }}>
                {mode === "quick" && "یک جواب سریع و مستقیم می‌گیری"}
                {mode === "brainstorm" && "۴ متخصص AI از زوایای مختلف نظر می‌دهند"}
                {mode === "critique" && "جواب اولیه نقد و بهبود داده می‌شود"}
              </div>
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

          {/* Loading */}
          {loading && (
            <div className="ai-loading-wrap">
              <div className="ai-loading-row">
                <div className="ai-loading-spinner" />
                <span className="ai-loading-text">{currentLoadingMsg}</span>
              </div>
              {mode === "brainstorm" && (
                <div className="ai-agent-cards-grid">
                  {["logical", "exec", "risk", "creative"].map((r) => (
                    <div key={r} className="ai-agent-card">
                      <div className="ai-skeleton" style={{ height: 14, width: 100, marginBottom: 10 }} />
                      <div className="ai-skeleton" style={{ height: 60 }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="ai-limit-notice">
              {error}{" "}
              <Link href="/ai/pricing">مقایسه پلن‌ها</Link>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="ai-input-area">
        <div className="ai-container">
          <div className="ai-mode-pills-wrap">
            <span className="ai-mode-label">حالت:</span>
            {MODES.map((m) => (
              <button
                key={m.id}
                className={`ai-mode-pill${mode === m.id ? " active" : ""}`}
                onClick={() => setMode(m.id)}
                disabled={loading}
              >
                {m.icon} {m.label}
              </button>
            ))}
          </div>

          <div className="ai-textarea-row">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              placeholder="سؤالت را اینجا بنویس..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="ai-send-btn"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <svg
                className="ai-send-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>

          <div
            style={{
              fontSize: 11,
              color: "var(--ai-text3)",
              marginTop: 6,
              textAlign: "center",
            }}
          >
            Enter برای ارسال — Shift+Enter برای خط جدید
          </div>
        </div>
      </div>
    </div>
  );
}
