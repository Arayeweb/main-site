"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface BizcardChatCard {
  slug: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  hours: string | null;
  maps_url: string | null;
  neshan_url: string | null;
  balad_url: string | null;
}

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

type ReplyKey = "hello" | "address" | "hours" | "phone" | "whatsapp" | "maps" | "services" | "default";

function matchIntent(text: string): ReplyKey {
  const t = text.toLowerCase();
  if (/سلام|درود|\bhi\b|hello/.test(t)) return "hello";
  if (/آدرس|کجا|مسیری|location|map|نقشه|لوکیشن/.test(t)) return "address";
  if (/ساعت|زمان|کی باز|hours|open|بسته/.test(t)) return "hours";
  if (/واتساپ|whatsapp|wa\b/.test(t)) return "whatsapp";
  if (/تماس|زنگ|شماره|تلفن|phone|call/.test(t)) return "phone";
  if (/مسیریاب|مسیر|راهنما|گوگل.?مپ|نشان|بلد/.test(t)) return "maps";
  if (/خدمات|چیکار|چه کار|صنف|category|فعالیت/.test(t)) return "services";
  return "default";
}

export default function BizcardChatWidget({ card }: { card: BizcardChatCard }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [started, setStarted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const responses = useMemo(() => {
    const name = card.business_name;
    const mapsLines = [
      card.maps_url ? "• گوگل‌مپ" : null,
      card.neshan_url ? "• نشان" : null,
      card.balad_url ? "• بلد" : null,
    ].filter(Boolean);

    return {
      hello: `سلام 👋 من دستیار ${name} هستم.\n\nمی‌تونم درباره آدرس، ساعت کاری و راه‌های تماس راهنماییتون کنم. چطور کمکتون کنم؟`,
      address: card.address
        ? `آدرس ${name}:\n${card.address}${mapsLines.length ? `\n\nبرای مسیریابی از دکمه‌های نقشه روی کارت استفاده کنید.` : ""}`
        : `آدرس ${name} در کارت ثبت نشده. می‌تونید با شماره تماس مستقیم بپرسید.`,
      hours: card.hours
        ? `ساعت کاری ${name}:\n${card.hours}`
        : `ساعت کاری ${name} در کارت ثبت نشده. لطفاً تماس بگیرید.`,
      phone: card.phone
        ? `برای تماس با ${name}:\n${card.phone}\n\nمی‌تونید روی دکمه «تماس» در کارت بزنید.`
        : `شماره تماس ${name} در کارت ثبت نشده.`,
      whatsapp: card.whatsapp
        ? `برای پیام در واتساپ، روی دکمه واتساپ در کارت بزنید.\nشماره: ${card.whatsapp}`
        : `واتساپ ${name} در کارت ثبت نشده.`,
      maps:
        mapsLines.length > 0
          ? `مسیریابی ${name}:\n${mapsLines.join("\n")}\n\nروی هر کدام که می‌خواید در کارت بزنید.`
          : `لینک مسیریابی برای ${name} در کارت ثبت نشده.`,
      services: card.category
        ? `${name} در حوزه «${card.category}» فعالیت می‌کنه.\n\nبرای جزئیات بیشتر تماس بگیرید.`
        : `برای اطلاع از خدمات ${name} لطفاً تماس بگیرید.`,
      default: `می‌تونم درباره آدرس، ساعت کاری، تماس و مسیریابی ${name} کمکتون کنم.\n\nسؤالتون رو بنویسید یا یکی از دکمه‌ها رو بزنید.`,
    } satisfies Record<ReplyKey, string>;
  }, [card]);

  const quickReplies = useMemo(() => {
    const items: { key: ReplyKey; label: string }[] = [];
    if (card.address) items.push({ key: "address", label: "آدرس کجاست؟" });
    if (card.hours) items.push({ key: "hours", label: "ساعت کاری" });
    if (card.phone) items.push({ key: "phone", label: "شماره تماس" });
    if (card.maps_url || card.neshan_url || card.balad_url) {
      items.push({ key: "maps", label: "مسیریابی" });
    }
    return items;
  }, [card]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!started) setNudge(true);
    }, 12000);
    return () => clearTimeout(t);
  }, [started]);

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing]);

  function addBotMsg(text: string) {
    setTyping(true);
    const delay = Math.min(900, 350 + text.length * 4);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { who: "bot", text }]);
    }, delay);
  }

  function respond(key: ReplyKey) {
    addBotMsg(responses[key]);
  }

  function openChat() {
    setOpen(true);
    setNudge(false);
    setBadgeVisible(false);
    if (!started) {
      setStarted(true);
      setTimeout(() => respond("hello"), 350);
    }
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  function handleQuick(item: { key: ReplyKey; label: string }) {
    setMessages((prev) => [...prev, { who: "user", text: item.label }]);
    setTimeout(() => respond(item.key), 250);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    setMessages((prev) => [...prev, { who: "user", text: val }]);
    setInputVal("");
    const key = matchIntent(val);
    setTimeout(() => respond(key), 250);
  }

  return (
    <>
      <div className="bc-chat-wrap">
        {nudge && !open ? (
          <button type="button" className="bc-chat-nudge" onClick={openChat}>
            سؤالی درباره {card.business_name} دارید؟ بپرسید 👋
          </button>
        ) : null}

        <button
          type="button"
          className="bc-chat-launcher"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label={`چت با ${card.business_name}`}
        >
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
          {badgeVisible && !open ? <span className="bc-chat-badge">۱</span> : null}
        </button>
      </div>

      {open ? (
        <div className="bc-chat-panel" dir="rtl">
          <div className="bc-chat-head">
            <div className="bc-chat-head-info">
              <div className="bc-chat-head-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" />
                  <rect width="16" height="12" x="4" y="8" rx="2" />
                  <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
                </svg>
              </div>
              <div>
                <p className="bc-chat-title">دستیار {card.business_name}</p>
                <p className="bc-chat-sub">پاسخ‌گویی هوشمند</p>
              </div>
            </div>
            <button type="button" className="bc-chat-close" onClick={() => setOpen(false)} aria-label="بستن">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={threadRef} className="bc-chat-thread">
            {messages.map((m, i) => (
              <div key={i} className={`bc-chat-row ${m.who === "user" ? "user" : "bot"}`}>
                <div className="bc-chat-bubble">{m.text}</div>
              </div>
            ))}
            {typing ? (
              <div className="bc-chat-row bot">
                <div className="bc-chat-bubble bc-chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            ) : null}
          </div>

          {!typing && messages.length > 0 && quickReplies.length > 0 ? (
            <div className="bc-chat-quick">
              {quickReplies.map((q) => (
                <button key={q.key} type="button" onClick={() => handleQuick(q)}>
                  {q.label}
                </button>
              ))}
            </div>
          ) : null}

          <form className="bc-chat-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              dir="rtl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="سؤالتون رو بنویسید…"
            />
            <button type="submit" disabled={!inputVal.trim()} aria-label="ارسال">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="bc-chat-note">پاسخ‌ها بر اساس اطلاعات کارت · نمایشی</p>
        </div>
      ) : null}
    </>
  );
}
