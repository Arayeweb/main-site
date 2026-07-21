"use client";

import { useState, useEffect, useRef } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  formatToman,
  googlesabtPackages,
  type GooglesabtPackageKey,
} from "@/lib/googlesabtData";

/* ------------------------------------------------------------------ */
/*  چت‌بات گوگل‌ثبت — مشاوره رایگان قبل از خرید                          */
/*  پاسخ به پکیج/قیمت/نقشه/زمان + گرفتن شماره → لید googlesabt_chatbot */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

type FaqKey =
  | "hello"
  | "price"
  | "maps"
  | "time"
  | "bizcard"
  | "basic"
  | "popular"
  | "vip"
  | "consult"
  | "default"
  | "contact_saved";

const priceList = googlesabtPackages
  .map((p) => `• ${p.name}: از ${formatToman(p.price)} تومان`)
  .join("\n");

const basicPkg = googlesabtPackages.find((p) => p.key === "basic")!;
const popularPkg = googlesabtPackages.find((p) => p.key === "popular")!;
const vipPkg = googlesabtPackages.find((p) => p.key === "vip")!;

const FAQ: Record<FaqKey, string> = {
  hello:
    "سلام! من دستیار مشاوره رایگان ثبت گوگل مپ آرایه‌ام.\n\nمی‌تونم بگم کدوم پکیج برات مناسبه، چی ثبت می‌شه، چقدر طول می‌کشه و هدیه کارت هوشمند چیه.\n\nسؤالت چیه؟ یا همین الان شماره‌ت رو بفرست تا کارشناس راهنماییت کنه.",
  price: `پکیج‌های ثبت گوگل مپ آرایه:\n${priceList}\n\nاگر مطمئن نیستی کدوم برات بهتره، بگو کسب‌وکارت چیه یا شماره‌ت رو بفرست تا مشاوره رایگان بگیریم.`,
  maps:
    "ثبت می‌کنیم در گوگل مپ، نشان و بلد؛ در پکیج حرفه‌ای و VIP هم اسنپ و OpenStreetMap اضافه می‌شه.\n\nبعد از ثبت، مشتری‌ها آدرس، ساعت کاری و تماس شما رو مستقیم از نقشه می‌بینن.",
  time:
    "بعد از تکمیل سفارش و پرداخت، معمولاً کمتر از یک روز کاری فرایند ثبت شروع و تحویل داده می‌شه.\n\nاگر سوال قبل از خرید داری، شماره‌ت رو بفرست تا همین امروز راهنماییت کنیم.",
  bizcard:
    "از پکیج حرفه‌ای به بالا، کارت هوشمند کسب‌وکار + QR هدیه است: همه مسیریاب‌ها (گوگل، نشان، بلد و …) روی یک لینک.\n\nمی‌خوای بدونم کدوم پکیج برات کافیه؟ شماره‌ت رو بفرست.",
  basic: `پکیج استاندارد (${formatToman(basicPkg.price)} تومان):\n${basicPkg.features.map((f) => `• ${f}`).join("\n")}\n\nمناسب شروع دیده‌شدن در گوگل، نشان و بلد.`,
  popular: `پکیج حرفه‌ای — پیشنهادی (${formatToman(popularPkg.price)} تومان):\n${popularPkg.features.map((f) => `• ${f}`).join("\n")}\n\nبیشتر کسب‌وکارها همین رو انتخاب می‌کنن.`,
  vip: `پکیج VIP (${formatToman(vipPkg.price)} تومان):\n${vipPkg.features.map((f) => `• ${f}`).join("\n")}\n\nاگر مدیریت نظرات و پیگیری درستی‌سنجی برات مهمه، VIP بهتره.`,
  consult:
    "مشاوره کاملاً رایگانه. بگو کسب‌وکارت چیه (مثلاً رستوران، مطب، فروشگاه) یا مستقیم شماره‌ت رو بفرست تا کارشناس باهات هماهنگ کنه و پکیج مناسب رو پیشنهاد بده.",
  default:
    "سؤال خوبیه! می‌تونم درباره قیمت پکیج‌ها، نقشه‌هایی که ثبت می‌شن، زمان تحویل، کارت هوشمند و انتخاب پکیج مناسب کمکت کنم.\n\nیا شماره‌ت رو بفرست تا مشاوره رایگان بگیریم.",
  contact_saved:
    "عالی! شماره‌ت ثبت شد ✓\nکارشناس ثبت گوگل مپ آرایه در کمتر از ۲ ساعت کاری باهات تماس می‌گیره تا مشاوره رایگان بدیم. 🌟",
};

const QUICK_KEYS: { key: FaqKey; label: string }[] = [
  { key: "consult", label: "مشاوره رایگان" },
  { key: "price", label: "قیمت پکیج‌ها؟" },
  { key: "maps", label: "کجا ثبت می‌شه؟" },
  { key: "popular", label: "پکیج پیشنهادی" },
  { key: "time", label: "کی آماده می‌شه؟" },
];

const TOPIC_TO_PLAN: Partial<Record<FaqKey, GooglesabtPackageKey>> = {
  basic: "basic",
  popular: "popular",
  vip: "vip",
};

function toLatin(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function matchFaq(text: string): FaqKey {
  const t = text.toLowerCase();
  if (/سلام|درود|\bhi\b|hello/.test(t)) return "hello";
  if (/مشاوره|راهنمایی|کمک|کدوم|کدام|مناسب/.test(t)) return "consult";
  if (/قیمت|چنده|هزینه|نرخ|تعرفه|cost|price/.test(t)) return "price";
  if (/نقشه|مپ|گوگل|نشان|بلد|اسنپ|osm|کجا ثبت/.test(t)) return "maps";
  if (/کارت|ویزیت|bizcard|qr|هوشمند|لینک/.test(t)) return "bizcard";
  if (/چقدر|زمان|مدت|کی |طول|تحویل|time/.test(t)) return "time";
  if (/استاندارد|basic|ارزان|ساده/.test(t)) return "basic";
  if (/حرفه‌|حرفه|popular|پیشنهاد|محبوب/.test(t)) return "popular";
  if (/\bvip\b|وی آی پی|کامل|نظرات/.test(t)) return "vip";
  return "default";
}

function extractPhone(text: string): string | null {
  const m = toLatin(text)
    .replace(/[\s\-()]/g, "")
    .match(/(?:\+98|0098|0)?9\d{9}/);
  if (!m) return null;
  return "0" + m[0].replace(/^(\+98|0098|0)?/, "");
}

export default function GooglesabtChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const lastTopic = useRef<string>("");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openChatRef = useRef<(source?: string) => void>(() => {});

  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing]);

  function addBotMsg(text: string) {
    setTyping(true);
    const delay = Math.min(1100, 450 + text.length * 6);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { who: "bot", text }]);
    }, delay);
  }

  function openChat(source = "launcher") {
    setOpen(true);
    pushGtmEvent("chat_open", { page: "googlesabt", source });
    if (!started) {
      setStarted(true);
      setTimeout(() => addBotMsg(FAQ.hello), 350);
    }
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  openChatRef.current = openChat;

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ source?: string }>).detail;
      openChatRef.current(detail?.source || "navbar");
    };
    window.addEventListener("araaye:open-chat", handler);
    return () => window.removeEventListener("araaye:open-chat", handler);
  }, []);

  function submitChatLead(phone: string) {
    const topic = lastTopic.current;
    const plan = TOPIC_TO_PLAN[topic as FaqKey];
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "googlesabt_chatbot",
        page: "/googlesabt",
        contact: phone,
        goal: "googlesabt_consult",
        plan,
        channel: "googlesabt_landing",
        detail: `chatbot free consult | topic: ${topic || "-"}`,
        consent: true,
        referrer: document.referrer || undefined,
        company: "",
        ...getUtmParams(),
      }),
      keepalive: true,
    })
      .then(() => {
        pushGtmEvent("generate_lead", { source: "googlesabt_chatbot", page: "googlesabt" });
      })
      .catch(() => {});
  }

  function respond(text: string) {
    const phone = extractPhone(text);
    if (phone && !leadSaved) {
      setLeadSaved(true);
      submitChatLead(phone);
      addBotMsg(FAQ.contact_saved);
      return;
    }
    if (phone && leadSaved) {
      addBotMsg("شماره‌ت رو قبلاً ثبت کردم ✓ کارشناس ما به‌زودی تماس می‌گیره.");
      return;
    }
    const key = matchFaq(text);
    if (key === "basic" || key === "popular" || key === "vip" || key === "price") {
      lastTopic.current = key;
    }
    addBotMsg(FAQ[key]);
  }

  function handleQuick(item: { key: FaqKey; label: string }) {
    setMessages((prev) => [...prev, { who: "user", text: item.label }]);
    if (item.key === "basic" || item.key === "popular" || item.key === "vip" || item.key === "price") {
      lastTopic.current = item.key;
    }
    setTimeout(() => addBotMsg(FAQ[item.key]), 250);
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
      <div className="fixed bottom-20 left-4 z-50 sm:bottom-5 sm:left-5">
        <button
          onClick={() => (open ? setOpen(false) : openChat("launcher"))}
          aria-label="مشاوره رایگان ثبت گوگل مپ"
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4285F4] text-white shadow-lg transition-all duration-200 hover:bg-[#1b6ef3] hover:shadow-xl active:scale-[0.96]"
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
        </button>
      </div>

      {open && (
        <div
          dir="rtl"
          className="fixed bottom-[5.75rem] left-4 z-50 flex w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl animate-fade-up sm:bottom-24 sm:left-5 sm:w-[calc(100vw-40px)]"
          style={{ maxHeight: "min(520px, calc(100dvh - 140px))" }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-[#4285F4] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-white">مشاوره رایگان گوگل‌ثبت</p>
                <p className="mt-0.5 text-[11px] text-blue-100">دستیار ثبت کسب‌وکار در نقشه</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div
            ref={threadRef}
            className="flex-1 space-y-2 overflow-y-auto px-4 py-3 text-sm"
            style={{ scrollbarWidth: "thin" }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.who === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.who === "user"
                      ? "rounded-tl-sm bg-[#4285F4] text-white"
                      : "rounded-tr-sm bg-blue-50/80 text-navy-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-blue-50/80 px-4 py-3">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#4285F4]"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!typing && !leadSaved && messages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-blue-50 px-4 pb-2 pt-1">
              {QUICK_KEYS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleQuick(q)}
                  className="rounded-xl border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-[#1b6ef3]"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-blue-100 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              dir="rtl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="سؤالت رو بنویس یا شماره‌ت رو بفرست…"
              className="flex-1 rounded-xl bg-blue-50/60 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="ارسال"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#4285F4] text-white transition-all hover:bg-[#1b6ef3] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-180">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
