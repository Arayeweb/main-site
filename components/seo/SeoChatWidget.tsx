"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { seoPackages, formatPackagePrice, getSeoPackage } from "@/lib/seoData";
import { formatBusinessLabel, parseBusinessInput } from "@/lib/seoBusinessInput";

/* ------------------------------------------------------------------ */
/*  چت‌بات سئو — پورت منطق rule-based از public/assets/js/seo.js        */
/*  پاسخ به سؤالات پکیج/قیمت/ضمانت + گرفتن شماره → لید seo_chatbot     */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

type FaqKey =
  | "hello"
  | "price"
  | "time"
  | "trial"
  | "guarantee"
  | "local"
  | "local_pkg"
  | "growth"
  | "pro"
  | "default"
  | "contact_saved";

const priceList = seoPackages
  .map((p) => `• ${p.name}: ${formatPackagePrice(p)}`)
  .join("\n");

const localPkg = getSeoPackage("local");
const growthPkg = getSeoPackage("growth");
const proPkg = getSeoPackage("pro");

const FAQ: Record<FaqKey, string> = {
  hello:
    "سلام! من دستیار سئوی آرایه‌ام. می‌تونم درباره پکیج‌ها، قیمت‌ها، بررسی اولیه و زمان نتیجه کمکت کنم.\n\nسؤالت چیه؟ یا همین الان شماره‌ت رو بفرست تا کارشناس تماس بگیره.",
  price:
    `پکیج‌های سئوی آرایه:\n${priceList}\n\nبرای بررسی اولیه هم می‌تونی فرم صفحه رو پر کنی.`,
  time:
    "اصلاحات فنی و Local SEO زودتر دیده می‌شن. رشد ارگانیک معمولاً از ماه دوم به بعد و با اجرای پیوسته قابل ارزیابیه.\n\nسؤال دیگه‌ای داری؟",
  trial:
    "بررسی اولیه شامل:\n• وضعیت نمایش در گوگل\n• مشکلات فنی و ایندکس\n• صفحات هدف\n• Google Maps\n• مسیر تماس\n\nفرم بالای صفحه رو پر کن یا شماره‌ت رو بفرست.",
  guarantee:
    "رتبه اول گوگل تضمین نمی‌شه. آرایه اجرای کارهای مشخص، گزارش شفاف و بهبود مستمر رو ارائه می‌ده.",
  local:
    "Local SEO برای کسب‌وکارهاییه که مشتری براساس شهر یا منطقه جست‌وجو می‌کنه.\n\nشامل Google Business Profile، صفحات محلی و بهبود مسیر تماسه.",
  local_pkg:
    `پکیج Local SEO:\n• یک محدوده و حداکثر ۲ خدمت\n• Google Business Profile\n• حداکثر ۲ صفحه خدمات یا محلی\n• گزارش ماهانه\n\nقیمت: ${formatPackagePrice(localPkg)}`,
  growth:
    `پکیج SEO Growth (پیشنهادی):\n• تحلیل فنی کامل اولیه\n• حداکثر ۲ خروجی محتوایی در ماه\n• بهینه‌سازی ۵ صفحه موجود\n• CRO و گزارش KPI\n\nقیمت: ${formatPackagePrice(growthPkg)}`,
  pro:
    `پکیج SEO Pro:\n• تحلیل فنی پیشرفته\n• حداکثر ۴ خروجی محتوایی در ماه\n• Off-page و CRO\n• جلسه ماهانه هماهنگی\n\nقیمت: ${formatPackagePrice(proPkg)}`,
  default:
    "سؤال خوبیه! می‌تونم درباره قیمت پکیج‌ها، بررسی رایگان، سئوی محلی و نقشه گوگل، زمان نتیجه و ضمانت کمکت کنم.\n\nیا شماره‌ت رو بفرست تا کارشناس ما مستقیم راهنماییت کنه.",
  contact_saved:
    "عالی! شماره‌ت ثبت شد ✓\nکارشناس سئوی ما در کمتر از ۲ ساعت کاری باهات تماس می‌گیره. 🌟",
};

function businessAuditReply(business: string): string {
  const label = formatBusinessLabel(business);
  return `${label}\n\nبرای بررسی وضعیت حضور شما در گوگل، شماره تماس‌تون رو بفرستید تا کارشناس ما گزارش اولیه رو آماده کنه.\n\nمی‌تونید درباره پکیج‌ها و قیمت‌ها هم بپرسید.`;
}

const QUICK_KEYS: { key: FaqKey; label: string }[] = [
  { key: "price", label: "قیمت پکیج‌ها؟" },
  { key: "trial", label: "بررسی رایگان چیه؟" },
  { key: "local", label: "سئوی محلی یعنی چی؟" },
  { key: "time", label: "کی نتیجه می‌گیرم؟" },
  { key: "guarantee", label: "ضمانت دارید؟" },
];

function toLatin(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function matchFaq(text: string): FaqKey {
  const t = text.toLowerCase();
  if (/سلام|درود|\bhi\b|hello/.test(t)) return "hello";
  if (/قیمت|چنده|هزینه|نرخ|تعرفه|cost|price/.test(t)) return "price";
  if (/رایگان|free|trial|بررسی/.test(t)) return "trial";
  if (/محلی|نقشه|مپ|گوگل مپ|نزدیک|local|map/.test(t)) return "local";
  if (/چقدر|زمان|مدت|کی |طول|time/.test(t)) return "time";
  if (/ضمانت|گارانتی|تضمین|guarantee/.test(t)) return "guarantee";
  if (/پایه|local seo|محلی پکیج|ارزان/.test(t)) return "local_pkg";
  if (/رشد|growth|پیشنهاد/.test(t)) return "growth";
  if (/حرفه|pro|کامل/.test(t)) return "pro";
  if (/محتوا|content|مقاله/.test(t)) return "growth";
  return "default";
}

function extractPhone(text: string): string | null {
  const m = toLatin(text).replace(/[\s\-()]/g, "").match(/(?:\+98|0098|0)?9\d{9}/);
  if (!m) return null;
  return "0" + m[0].replace(/^(\+98|0098|0)?/, "");
}

export default function SeoChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const lastTopic = useRef<string>("");
  const businessRef = useRef<string>("");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  function openChat() {
    setOpen(true);
    if (!started) {
      setStarted(true);
      setTimeout(() => addBotMsg(FAQ.hello), 350);
    }
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  const openChatWithBusiness = useCallback((business: string) => {
    const trimmed = business.trim();
    if (!trimmed) {
      openChat();
      return;
    }

    businessRef.current = trimmed;
    setOpen(true);
    setStarted(true);
    setMessages([{ who: "user", text: trimmed }]);
    setTimeout(() => addBotMsg(businessAuditReply(trimmed)), 350);
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const openChatWithBusinessRef = useRef(openChatWithBusiness);
  openChatWithBusinessRef.current = openChatWithBusiness;

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ business?: string }>).detail;
      if (detail?.business) {
        openChatWithBusinessRef.current(detail.business);
      }
    };
    window.addEventListener("araaye:open-seo-chat", handler);
    return () => window.removeEventListener("araaye:open-seo-chat", handler);
  }, []);

  function submitChatLead(phone: string) {
    const topic = lastTopic.current;
    const plan =
      topic === "local_pkg" || topic === "growth" || topic === "pro"
        ? topic === "local_pkg"
          ? "local"
          : topic
        : undefined;
    const business = businessRef.current;
    const parsed = parseBusinessInput(business);
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "seo_chatbot",
        page: "/seo",
        contact: phone,
        goal: "seo_service",
        plan,
        channel: "seo_landing",
        detail: `chatbot conversation | topic: ${topic || "-"}${business ? ` | business: ${business}` : ""}`,
        referrer: document.referrer || undefined,
        company: parsed.name || parsed.website || "",
        ...getUtmParams(),
      }),
      keepalive: true,
    })
      .then(() => {
        pushGtmEvent("generate_lead", { source: "seo_chatbot", page: "seo" });
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
    if (key === "local_pkg" || key === "growth" || key === "pro" || key === "price")
      lastTopic.current = key;
    addBotMsg(FAQ[key]);
  }

  function handleQuick(item: { key: FaqKey; label: string }) {
    setMessages((prev) => [...prev, { who: "user", text: item.label }]);
    if (
      item.key === "local_pkg" ||
      item.key === "growth" ||
      item.key === "pro" ||
      item.key === "price"
    ) {
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
      {/* Launcher — بالای sticky bar موبایل تا با CTA پایین تداخل نداشته باشد */}
      <div className="fixed bottom-20 left-4 z-50 sm:bottom-5 sm:left-5">
        <button
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label="چت با دستیار سئوی آرایه"
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg transition-all duration-200 hover:bg-teal-700 hover:shadow-xl active:scale-[0.96]"
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

      {/* Chat panel */}
      {open && (
        <div
          dir="rtl"
          className="fixed bottom-[5.75rem] left-4 z-50 flex w-[calc(100vw-32px)] max-w-sm flex-col overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-2xl animate-fade-up sm:bottom-24 sm:left-5 sm:w-[calc(100vw-40px)]"
          style={{ maxHeight: "min(520px, calc(100dvh - 140px))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-teal-100 bg-teal-700 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-teal-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-none">دستیار سئوی آرایه</p>
                <p className="text-[11px] text-teal-200 mt-0.5">پاسخ به سؤالات سئوی محلی</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-teal-200 hover:bg-white/10 hover:text-white transition-colors"
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
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.who === "user"
                      ? "bg-teal-700 text-white rounded-tl-sm"
                      : "bg-teal-50/80 text-navy-800 rounded-tr-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-teal-50/80 px-4 py-3">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          {!typing && !leadSaved && messages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-2 pt-1 border-t border-teal-50">
              {QUICK_KEYS.map((q) => (
                <button
                  key={q.key}
                  onClick={() => handleQuick(q)}
                  className="rounded-xl border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-teal-100 px-3 py-2.5"
          >
            <input
              ref={inputRef}
              type="text"
              dir="rtl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="سؤالت رو بنویس یا شماره‌ت رو بفرست…"
              className="flex-1 rounded-xl bg-teal-50/60 px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 outline-none focus:bg-white focus:ring-2 focus:ring-teal-200 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="ارسال"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition-all hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed"
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
