"use client";

import { useState, useEffect, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */
interface QuickReply {
  t: string;
  go?: string;
  set?: Partial<LeadState>;
}

interface ScriptNode {
  msgs: string[] | ((s: LeadState) => string[]);
  quick?: QuickReply[];
  expects?: "contact";
}

interface LeadState {
  intent: string;
  detail: string;
  budget: string;
  plan: string;
  contact: string;
}

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

/* ------------------------------------------------------------------ */
/*  Conversation script                                                 */
/* ------------------------------------------------------------------ */
const PLAN: Record<string, string> = {
  bronze: "برنزی",
  silver: "نقره‌ای",
  gold: "طلایی",
};

function recommendPlan(s: LeadState): { plan: string; why: string } {
  const b = s.budget;
  const wantsAI = /chatbot|support|چت‌بات/.test(s.intent + s.detail);
  if (b === "lt15") return { plan: "bronze", why: "با این بودجه یک لندینگ‌پیج سریع و سئوشده بهترین نقطه شروع است؛ کم‌هزینه و بعداً قابل ارتقا." };
  if (b === "gt100") return { plan: "gold", why: "برای این بودجه، راهکار سازمانی «طلایی» با هوش مصنوعی و زیرساخت اختصاصی بیشترین بازده را می‌دهد." };
  if (b === "40-100") return wantsAI
    ? { plan: "gold", why: "چون هوش مصنوعی اولویت شماست، پکیج «طلایی» با اتوماسیون AI این بودجه را کامل بهره‌وری می‌کند." }
    : { plan: "silver", why: "وب‌سایت کامل + چت‌بات در این بازه تعادل عالی هزینه و نتیجه است." };
  return { plan: "silver", why: "پکیج «نقره‌ای» محبوب‌ترین انتخاب در این بودجه است؛ سایت کامل + چت‌بات هوشمند برای رشد واقعی." };
}

const SCRIPT: Record<string, ScriptNode> = {
  start: {
    msgs: ["سلام 👋 من دستیار آرایه‌ام.", "می‌تونم کمک کنم بهترین مسیر رو برای پروژه‌تون پیدا کنیم. از کجا شروع کنیم؟"],
    quick: [
      { t: "وب‌سایت می‌خوام", go: "website", set: { intent: "website" } },
      { t: "چت‌بات هوشمند", go: "chatbot", set: { intent: "chatbot" } },
      { t: "نرم‌افزار / سیستم اختصاصی", go: "budget", set: { intent: "custom", detail: "نرم‌افزار اختصاصی" } },
      { t: "مطمئن نیستم، مشاوره می‌خوام", go: "advise", set: { intent: "advise" } },
    ],
  },
  website: {
    msgs: ["عالیه! بیشتر دنبال چه نوع سایتی هستید؟"],
    quick: [
      { t: "سایت شرکتی / معرفی", go: "budget", set: { detail: "سایت شرکتی" } },
      { t: "فروشگاه آنلاین", go: "budget", set: { detail: "فروشگاه آنلاین" } },
      { t: "لندینگ‌پیج کمپین", go: "budget", set: { detail: "لندینگ کمپین" } },
    ],
  },
  chatbot: {
    msgs: ["چت‌بات‌های آرایه روی دانش خودِ کسب‌وکار شما آموزش می‌بینند و به پیام‌رسان‌ها وصل می‌شن.", "کدام کانال برایتان مهم‌تر است؟"],
    quick: [
      { t: "روی وب‌سایت", go: "budget", set: { detail: "چت‌بات سایت" } },
      { t: "اینستاگرام", go: "budget", set: { detail: "چت‌بات اینستاگرام" } },
      { t: "تلگرام / بله", go: "budget", set: { detail: "چت‌بات تلگرام/بله" } },
    ],
  },
  advise: {
    msgs: ["مشکلی نیست! هدف اصلی‌تان از سرمایه‌گذاری روی نرم‌افزار چیه؟"],
    quick: [
      { t: "فروش بیشتر", go: "budget", set: { detail: "هدف: فروش" } },
      { t: "پشتیبانی خودکار مشتری", go: "budget", set: { detail: "هدف: پشتیبانی", intent: "chatbot" } },
      { t: "برندسازی و معرفی", go: "budget", set: { detail: "هدف: برندسازی" } },
    ],
  },
  budget: {
    msgs: ["یک سوال کوتاه تا دقیق‌ترین پیشنهاد رو بدم: بودجه تقریبی شما در چه بازه‌ای است؟"],
    quick: [
      { t: "کمتر از ۱۵ م.ت", go: "recommend", set: { budget: "lt15" } },
      { t: "۱۵ تا ۴۰ م.ت", go: "recommend", set: { budget: "15-40" } },
      { t: "۴۰ تا ۱۰۰ م.ت", go: "recommend", set: { budget: "40-100" } },
      { t: "بیش از ۱۰۰ م.ت", go: "recommend", set: { budget: "gt100" } },
    ],
  },
  recommend: {
    msgs: (s) => {
      const r = recommendPlan(s);
      s.plan = r.plan;
      return [
        `بر اساس نیاز شما، پیشنهادم پکیج «${PLAN[r.plan]}» است 👇`,
        r.why,
        "می‌خواهید نمونه‌کار مرتبط و برآورد قیمت را برایتان بفرستم؟",
      ];
    },
    quick: [
      { t: "بله، ارسال کن", go: "qualify" },
      { t: "می‌خوام با کارشناس حرف بزنم", go: "human" },
    ],
  },
  qualify: {
    msgs: ["عالی! یک ایمیل یا شماره موبایل بدید تا نمونه‌کار و پیشنهاد قیمت همین حالا برایتان بفرستم 🎁"],
    expects: "contact",
  },
  thanks: {
    msgs: [
      "ممنون! 🙌 اطلاعات شما ثبت شد.",
      "یکی از مشاوران آرایه خیلی زود با شما تماس می‌گیرد.",
    ],
    quick: [
      { t: "ادامه در واتساپ", go: "whatsapp" },
      { t: "مشاهده خدمات", go: "end" },
    ],
  },
  human: {
    msgs: ["حتماً! شماره یا ایمیل‌تان را بگذارید تا کارشناس ما با شما تماس بگیرد."],
    expects: "contact",
  },
  whatsapp: {
    msgs: ["می‌توانید از طریق واتساپ یا تماس مستقیم با ما در ارتباط باشید 📱"],
    quick: [{ t: "تماس با آرایه", go: "end" }],
  },
  end: {
    msgs: ["ممنون که با آرایه در ارتباط بودید. موفق باشید! 🙏"],
    quick: [],
  },
};

/* ------------------------------------------------------------------ */
/*  Lead submission                                                     */
/* ------------------------------------------------------------------ */
function submitLead(lead: LeadState) {
  const params = new URLSearchParams(window.location.search);
  const utms: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((k) => {
    const v = params.get(k);
    if (v) utms[k] = v;
  });

  fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "homepage_chatbot",
      page: window.location.pathname,
      referrer: document.referrer || undefined,
      contact: lead.contact,
      intent: lead.intent || undefined,
      detail: lead.detail || undefined,
      budget: lead.budget || undefined,
      plan: lead.plan || undefined,
      ...utms,
    }),
    keepalive: true,
  }).catch(() => {});
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
function toLatin(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}
function isEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isPhone(v: string) { return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()+]/g, "")); }

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [expecting, setExpecting] = useState<"contact" | null>(null);
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [started, setStarted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const lead = useRef<LeadState>({ intent: "", detail: "", budget: "", plan: "", contact: "" });
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* nudge after 25s */
  useEffect(() => {
    const t = setTimeout(() => { if (!started) setNudge(true); }, 25000);
    return () => clearTimeout(t);
  }, [started]);

  /* scroll to bottom */
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing, quickReplies]);

  /* focus input when expecting contact */
  useEffect(() => {
    if (expecting === "contact" && inputRef.current) inputRef.current.focus();
  }, [expecting]);

  function addBotMsgs(msgs: string[], node: ScriptNode) {
    if (!msgs.length) {
      afterMsgs(node);
      return;
    }
    const [first, ...rest] = msgs;
    setTyping(true);
    const delay = Math.min(1200, 500 + first.length * 15);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { who: "bot", text: first }]);
      setTimeout(() => addBotMsgs(rest, node), 200);
    }, delay);
  }

  function afterMsgs(node: ScriptNode) {
    if (node.expects === "contact") {
      setExpecting("contact");
      setQuickReplies([]);
      return;
    }
    setExpecting(null);
    setQuickReplies(node.quick || []);
  }

  function renderNode(id: string) {
    const node = SCRIPT[id];
    if (!node) return;
    setQuickReplies([]);
    setExpecting(null);
    const raw = typeof node.msgs === "function" ? node.msgs(lead.current) : node.msgs;
    addBotMsgs([...raw], node);
  }

  function openChat() {
    setOpen(true);
    setNudge(false);
    setBadgeVisible(false);
    if (!started) {
      setStarted(true);
      setTimeout(() => renderNode("start"), 400);
    }
  }

  function handleQuick(q: QuickReply) {
    setMessages((prev) => [...prev, { who: "user", text: q.t }]);
    setQuickReplies([]);
    if (q.set) Object.assign(lead.current, q.set);
    if (q.go) setTimeout(() => renderNode(q.go!), 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    setMessages((prev) => [...prev, { who: "user", text: val }]);
    setInputVal("");

    if (expecting === "contact") {
      if (isEmail(val) || isPhone(val)) {
        lead.current.contact = val;
        setExpecting(null);
        submitLead(lead.current);
        setTimeout(() => renderNode("thanks"), 350);
      } else {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages((prev) => [
            ...prev,
            { who: "bot", text: "به نظر می‌رسد ایمیل یا شماره کامل نیست 🤔 لطفاً دوباره امتحان کنید." },
          ]);
        }, 700);
      }
    }
  }

  return (
    <>
      {/* Launcher */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col items-end gap-2">
        {/* Nudge bubble */}
        {nudge && !open && (
          <button
            onClick={openChat}
            className="animate-fade-up rounded-2xl bg-white border border-navy-100 shadow-lg px-4 py-3 text-sm font-medium text-navy-700 max-w-[220px] text-right leading-relaxed hover:shadow-xl transition-shadow"
          >
            سوالی دارید؟ می‌تونم کمک کنم 👋
          </button>
        )}

        <button
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label="چت با دستیار آرایه"
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-900 text-white shadow-lg transition-all duration-200 hover:bg-navy-800 hover:shadow-xl active:scale-[0.96]"
        >
          {open ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {badgeVisible && !open && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-white ring-2 ring-white">
              1
            </span>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div
          dir="rtl"
          className="fixed bottom-24 left-5 z-50 w-[calc(100vw-40px)] max-w-sm flex flex-col rounded-2xl border border-navy-100 bg-white shadow-2xl overflow-hidden animate-fade-up"
          style={{ maxHeight: "min(520px, calc(100dvh - 110px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-navy-100 bg-navy-900 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">دستیار آرایه</p>
                <p className="text-[11px] text-navy-300 mt-0.5">مشاور پروژه شما</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-navy-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={threadRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2 text-sm"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.who === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.who === "user"
                      ? "bg-navy-900 text-white rounded-tl-sm"
                      : "bg-navy-50 text-navy-800 rounded-tr-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-navy-50 px-4 py-3">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-navy-400 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2 pt-1 border-t border-navy-50">
              {quickReplies.map((q) => (
                <button
                  key={q.t}
                  onClick={() => handleQuick(q)}
                  className="rounded-xl border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                >
                  {q.t}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {(expecting === "contact" || messages.length > 0) && (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-navy-100 px-3 py-2.5"
            >
              <input
                ref={inputRef}
                type={expecting === "contact" ? "text" : "text"}
                dir="rtl"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={expecting === "contact" ? "ایمیل یا شماره موبایل…" : "پیام بنویسید…"}
                className="flex-1 rounded-xl bg-navy-50 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 outline-none focus:bg-white focus:ring-2 focus:ring-navy-200 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputVal.trim()}
                aria-label="ارسال"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white transition-all hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
