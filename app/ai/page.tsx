"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "quick" | "brainstorm" | "critique";

const MODES: { id: Mode; icon: string; label: string }[] = [
  { id: "quick",      icon: "⚡", label: "جواب سریع" },
  { id: "brainstorm", icon: "🧠", label: "همفکری" },
  { id: "critique",   icon: "🔬", label: "نقد و اصلاح" },
];

const SUGGESTIONS = [
  "برای تبلیغ کلینیک زیبایی، گوگل ادز بهتره یا اینستاگرام؟",
  "چطور یک محصول جدید در بازار ایران معرفی کنم؟",
  "استراتژی قیمت‌گذاری برای خدمات طراحی سایت؟",
  "تفاوت SEO و گوگل ادز برای کسب‌وکار محلی؟",
];

const AUTH_ERRORS: Record<string, string> = {
  PHONE_TAKEN:   "این شماره قبلاً ثبت‌نام کرده — وارد شو.",
  INVALID_CREDS: "شماره یا رمز اشتباه است.",
  INVALID_PHONE: "شماره موبایل معتبر نیست.",
  RATE_LIMIT:    "تلاش زیاد، بعد از یک دقیقه دوباره امتحان کن.",
  default:       "خطایی پیش آمد. دوباره تلاش کن.",
};

export default function AIHomePage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const phoneRef    = useRef<HTMLInputElement>(null);

  const [authed,   setAuthed]   = useState<boolean | null>(null);
  const [question, setQuestion] = useState("");
  const [mode,     setMode]     = useState<Mode>("quick");
  const [sending,  setSending]  = useState(false);

  // Auth sheet state
  const [showSheet, setShowSheet] = useState(false);
  const [pendingQ,  setPendingQ]  = useState("");
  const [authTab,   setAuthTab]   = useState<"register" | "login">("register");
  const [phone,     setPhone]     = useState("");
  const [password,  setPassword]  = useState("");
  const [authErr,   setAuthErr]   = useState("");
  const [authBusy,  setAuthBusy]  = useState(false);

  useEffect(() => {
    fetch("/api/ai/auth")
      .then((r) => r.json())
      .then((d) => setAuthed(!!d.authed))
      .catch(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (showSheet) setTimeout(() => phoneRef.current?.focus(), 120);
  }, [showSheet]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function sendMessage(q: string) {
    if (!q.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, content: q.trim() }),
      });
      const data = await res.json();
      if (data.ok && data.conversation_id) {
        router.push(`/ai/app/c/${data.conversation_id}`);
      }
    } finally {
      setSending(false);
    }
  }

  function handleSend() {
    const q = question.trim();
    if (!q || sending) return;
    if (!authed) {
      setPendingQ(q);
      setShowSheet(true);
      return;
    }
    sendMessage(q);
  }

  async function handleAuth() {
    if (!phone.trim() || !password.trim()) return;
    setAuthBusy(true);
    setAuthErr("");
    try {
      const res = await fetch("/api/ai/auth", {
        method: authTab === "register" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();
      if (data.ok) {
        setAuthed(true);
        setShowSheet(false);
        if (pendingQ) {
          setQuestion("");
          sendMessage(pendingQ);
        }
      } else {
        setAuthErr(AUTH_ERRORS[data.error as string] ?? AUTH_ERRORS.default);
      }
    } finally {
      setAuthBusy(false);
    }
  }

  const hasInput = question.trim().length > 0;

  return (
    <div className="ai-home-shell">
      {/* ── Nav ── */}
      <nav className="ai-home-nav">
        <div className="ai-logo">
          آرایه <span>AI</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/ai/pricing" className="ai-btn ai-btn-ghost ai-btn-sm">
            قیمت‌ها
          </Link>
          {authed ? (
            <Link href="/ai/app" className="ai-btn ai-btn-primary ai-btn-sm">
              داشبورد
            </Link>
          ) : (
            <button
              className="ai-btn ai-btn-primary ai-btn-sm"
              onClick={() => { setPendingQ(""); setShowSheet(true); }}
            >
              ورود
            </button>
          )}
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="ai-home-main">
        {/* Welcome — collapses when typing */}
        <div className={`ai-welcome-area${hasInput ? " hidden" : ""}`}>
          <div className="ai-welcome-logo">
            اتاق فکر <span>هوشمند</span>
          </div>
          <p className="ai-welcome-sub">
            سؤالت را بنویس — یک هوش مصنوعی جواب می‌دهد، یا چند AI با هم فکر
            می‌کنند.
          </p>
          <div className="ai-suggestions">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="ai-suggestion-chip"
                onClick={() => {
                  setQuestion(s);
                  setTimeout(() => {
                    textareaRef.current?.focus();
                    autoResize();
                  }, 0);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="ai-input-area">
          <div className="ai-container" style={{ maxWidth: 680 }}>
            <div className="ai-mode-pills-wrap">
              <span className="ai-mode-label">حالت:</span>
              {MODES.map((m) => (
                <button
                  key={m.id}
                  className={`ai-mode-pill${mode === m.id ? " active" : ""}`}
                  onClick={() => setMode(m.id)}
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
                rows={1}
                value={question}
                onChange={(e) => { setQuestion(e.target.value); autoResize(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <button
                className="ai-send-btn"
                onClick={handleSend}
                disabled={!hasInput || sending}
                aria-label="ارسال"
              >
                {sending ? (
                  <span style={{ fontSize: 20, color: "#fff" }}>⋯</span>
                ) : (
                  <svg
                    className="ai-send-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      d="M12 19V5M5 12l7-7 7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
            {authed === false && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "var(--ai-text3)",
                  marginTop: 8,
                }}
              >
                ۵ سؤال رایگان · بدون کارت بانکی
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ── Auth Sheet ── */}
      {showSheet && (
        <>
          <div
            className="ai-auth-sheet-overlay"
            onClick={() => setShowSheet(false)}
          />
          <div className="ai-auth-sheet" role="dialog" aria-modal="true">
            <div className="ai-sheet-handle" />
            <div className="ai-sheet-inner">
              <div className="ai-sheet-title">
                آرایه <span>AI</span>
              </div>
              <p className="ai-sheet-sub">
                {pendingQ
                  ? "برای ارسال سؤال ابتدا وارد شو"
                  : "ورود یا ثبت‌نام رایگان"}
              </p>

              <div className="ai-sheet-tabs">
                <button
                  className={`ai-sheet-tab${
                    authTab === "register" ? " active" : ""
                  }`}
                  onClick={() => { setAuthTab("register"); setAuthErr(""); }}
                >
                  ثبت‌نام رایگان
                </button>
                <button
                  className={`ai-sheet-tab${
                    authTab === "login" ? " active" : ""
                  }`}
                  onClick={() => { setAuthTab("login"); setAuthErr(""); }}
                >
                  ورود
                </button>
              </div>

              <div className="ai-auth-form">
                <div>
                  <label className="ai-label">شماره موبایل</label>
                  <input
                    ref={phoneRef}
                    className="ai-input"
                    type="tel"
                    placeholder="09123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                    style={{ textAlign: "left" }}
                  />
                </div>
                <div>
                  <label className="ai-label">رمز عبور</label>
                  <input
                    className="ai-input"
                    type="password"
                    placeholder="حداقل ۶ کاراکتر"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                  />
                </div>

                {authErr && <p className="ai-form-err">{authErr}</p>}

                <button
                  className="ai-btn ai-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={handleAuth}
                  disabled={authBusy || !phone.trim() || !password.trim()}
                >
                  {authBusy
                    ? "در حال پردازش..."
                    : authTab === "register"
                    ? "ثبت‌نام و ادامه"
                    : "ورود و ادامه"}
                </button>

                {authTab === "register" && (
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--ai-text3)",
                    }}
                  >
                    ۵ سؤال رایگان · بدون کارت بانکی
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
