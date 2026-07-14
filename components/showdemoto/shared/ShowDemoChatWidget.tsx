"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

export interface ShowDemoChatTheme {
  /** primary accent (button bg, user bubble) */
  bg: string;
  /** hover bg for launcher button */
  hoverBg: string;
  /** border color for chat panel/bubbles */
  border: string;
  /** header background */
  headerBg: string;
  /** bot bubble background */
  botBubbleBg: string;
  /** bot bubble text color */
  botBubbleText: string;
  /** typing dot color */
  dot: string;
  /** launcher icon background tint (optional gradient) */
  badge: string;
}

export interface ShowDemoChatQuickReply {
  key: string;
  label: string;
}

export interface ShowDemoChatResponses {
  hello: string;
  booking: string;
  booking_done: string;
  services: string;
  [key: string]: string;
}

export interface ShowDemoChatConfig {
  assistantTitle: string;
  assistantSubtitle: string;
  nudge: string;
  demoNote: string;
  responses: ShowDemoChatResponses;
  quickReplies: ShowDemoChatQuickReply[];
  faq?: ReadonlyArray<{ q: string; a: string }>;
  /** intent keywords; matched against lowercased user text */
  intents?: ReadonlyArray<{ key: string; pattern: RegExp }>;
  /** GTM event label, e.g. slug */
  eventLabel: string;
}

function toLatin(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function extractPhone(text: string): string | null {
  const m = toLatin(text).replace(/[\s\-()]/g, "").match(/(?:\+98|0098|0)?9\d{9}/);
  if (!m) return null;
  return "0" + m[0].replace(/^(\+98|0098|0)?/, "");
}

function matchIntent(text: string, config: ShowDemoChatConfig): string {
  const t = text.toLowerCase();

  if (config.faq && config.faq.length > 0) {
    for (const item of config.faq) {
      const qWords = item.q.replace(/[؟?]/g, "").split(/\s+/).filter((w) => w.length > 3);
      if (qWords.some((w) => t.includes(w))) return "faq";
    }
  }

  if (config.intents) {
    for (const intent of config.intents) {
      if (intent.pattern.test(t)) return intent.key;
    }
  }

  return "default";
}

interface ShowDemoChatWidgetProps {
  config: ShowDemoChatConfig;
  theme: ShowDemoChatTheme;
}

export default function ShowDemoChatWidget({ config, theme }: ShowDemoChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [started, setStarted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [bookingSaved, setBookingSaved] = useState(false);
  const faqIndex = useRef(0);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!started) setNudge(true);
    }, 15000);
    return () => clearTimeout(t);
  }, [started]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing]);

  function addBotMsg(text: string) {
    setTyping(true);
    const delay = Math.min(1000, 400 + text.length * 5);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { who: "bot", text }]);
    }, delay);
  }

  function openChat() {
    setOpen(true);
    setNudge(false);
    setBadgeVisible(false);
    if (!started) {
      setStarted(true);
      pushGtmEvent("showdemo_chatbot_open", { slug: config.eventLabel });
      setTimeout(() => addBotMsg(config.responses.hello), 350);
    }
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  function respond(text: string) {
    const phone = extractPhone(text);
    if (phone && !bookingSaved) {
      setBookingSaved(true);
      pushGtmEvent("showdemo_chatbot_booking", { slug: config.eventLabel, simulated: true });
      addBotMsg(config.responses.booking_done);
      return;
    }
    if (phone && bookingSaved) {
      addBotMsg("درخواست شما قبلاً ثبت شده ✓ به‌زودی با شما تماس می‌گیریم.");
      return;
    }

    const key = matchIntent(text, config);
    if (key === "faq" && config.faq) {
      const item = config.faq[faqIndex.current % config.faq.length];
      faqIndex.current += 1;
      addBotMsg(`${item.q}\n\n${item.a}`);
      return;
    }

    addBotMsg(config.responses[key] ?? config.responses.default);
  }

  function handleQuick(item: ShowDemoChatQuickReply) {
    setMessages((prev) => [...prev, { who: "user", text: item.label }]);
    pushGtmEvent("showdemo_chatbot_quick", { slug: config.eventLabel, topic: item.key });
    setTimeout(() => addBotMsg(config.responses[item.key] ?? config.responses.default), 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    setMessages((prev) => [...prev, { who: "user", text: val }]);
    setInputVal("");
    setTimeout(() => respond(val), 250);
  }

  return (
    <>
      <div className="fixed bottom-5 left-5 z-50 flex flex-col items-end gap-2">
        {nudge && !open ? (
          <button
            type="button"
            onClick={openChat}
            className={`animate-fade-up max-w-[240px] rounded-2xl border bg-white px-4 py-3 text-right text-sm font-medium leading-relaxed text-navy-700 shadow-lg transition-shadow hover:shadow-xl ${theme.border}`}
          >
            {config.nudge}
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label={`چت با ${config.assistantTitle}`}
          className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-200 hover:shadow-xl active:scale-[0.96] ${theme.bg} ${theme.hoverBg}`}
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
          {badgeVisible && !open ? (
            <span className={`absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-white ${theme.badge}`}>
              1
            </span>
          ) : null}
        </button>
      </div>

      {open ? (
        <div
          dir="rtl"
          className={`fixed bottom-24 left-5 z-50 flex w-[calc(100vw-40px)] max-w-sm animate-fade-up flex-col overflow-hidden rounded-2xl border bg-white shadow-2xl ${theme.border}`}
          style={{ maxHeight: "min(520px, calc(100dvh - 110px))" }}
        >
          <div className={`flex items-center justify-between gap-3 border-b px-4 py-3 ${theme.headerBg} ${theme.border}`}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2" />
                  <path d="M20 14h2" />
                  <path d="M15 13v2" />
                  <path d="M9 13v2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-white">{config.assistantTitle}</p>
                <p className="mt-0.5 text-[11px] text-white/70">{config.assistantSubtitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={threadRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm" style={{ scrollbarWidth: "thin" }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.who === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.who === "user"
                      ? `${theme.bg} text-white rounded-tl-sm`
                      : `${theme.botBubbleBg} ${theme.botBubbleText} rounded-tr-sm`
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing ? (
              <div className="flex justify-end">
                <div className={`flex items-center gap-1 rounded-2xl rounded-tr-sm px-4 py-3 ${theme.botBubbleBg}`}>
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className={`h-1.5 w-1.5 animate-bounce rounded-full ${theme.dot}`}
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {!typing && messages.length > 0 ? (
            <div className={`flex flex-wrap gap-1.5 border-t px-4 pb-2 pt-1 ${theme.border}`}>
              {config.quickReplies.map((q) => (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => handleQuick(q)}
                  className={`rounded-xl border bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:bg-navy-50 ${theme.border}`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className={`flex items-center gap-2 border-t px-3 py-2.5 ${theme.border}`}>
            <input
              ref={inputRef}
              type="text"
              dir="rtl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="سؤالتون رو بنویسید یا شماره برای رزرو…"
              className={`flex-1 rounded-xl px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:ring-2 focus:bg-white ${theme.border}`}
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="ارسال"
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${theme.bg} ${theme.hoverBg}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="border-t border-navy-50 bg-navy-50/50 px-3 py-1.5 text-center text-[10px] text-navy-400">
            {config.demoNote}
          </p>
        </div>
      ) : null}
    </>
  );
}
