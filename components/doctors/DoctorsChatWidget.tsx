"use client";

import { useState, useEffect, useRef } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { doctorPackages, formatToman } from "@/lib/doctorsData";

interface ChatMessage {
  who: "bot" | "user";
  text: string;
}

type FaqKey =
  | "hello"
  | "price"
  | "booking"
  | "chatbot"
  | "turnkey"
  | "demo"
  | "time"
  | "guarantee"
  | "default"
  | "contact_saved";

const pkgMatab = doctorPackages[0];
const pkgClinic = doctorPackages[1];

const FAQ: Record<FaqKey, string> = {
  hello:
    "سلام! من دستیار آرایه برای پزشکان و مطب‌ها هستم.\n\nمی‌تونم درباره پکیج‌ها، قیمت، نوبت‌دهی آنلاین، چت‌بات بیماران و زمان تحویل کمکت کنم.\n\nسؤالت چیه؟ یا شماره‌ت رو بفرست تا کارشناس تماس بگیره.",
  price: `پکیج‌های سایت مطب:\n• مطب (تک‌پزشک): ${formatToman(pkgMatab.price)} تومان — پیش‌پرداخت ${formatToman(pkgMatab.deposit)} تومان\n• کلینیک (۲ تا ۶ پزشک): ${formatToman(pkgClinic.price)} تومان — پیش‌پرداخت ${formatToman(pkgClinic.deposit)} تومان\n• مرکز درمانی: از ۵۹ میلیون تومان\n\nهمه شامل دامنه، سرور و درگاه پرداخت. شماره‌ت رو بفرست تا پیشنهاد اختصاصی بگیری.`,
  booking:
    "سیستم نوبت‌دهی آنلاین می‌ذاریم تا بیمار خودش زمان خالی رو ببینه و رزرو کنه؛ با یادآوری پیامکی و امکان پیش‌پرداخت ویزیت.\n\nکل راه‌اندازی (دامنه، سرور، درگاه) با ماست. شماره‌ت رو بفرست تا نمونه و قیمت بفرستیم.",
  chatbot:
    "چت‌بات فقط روی اطلاعات تأییدشده مطب شما آموزش می‌بینه و به سؤال‌های پرتکرار بیماران (هزینه، آدرس، بیمه) پاسخ می‌ده — موارد تشخیصی رو به پزشک ارجاع می‌ده.\n\nشماره‌ت رو بفرست تا دموی مطب رو برات فعال کنیم.",
  turnkey:
    "بله! طراحی سایت، چت‌بات، دامنه، سرور، درگاه پرداخت و پشتیبانی — همه با ماست. شما فقط محتوای مطب رو می‌دید.\n\nشماره‌ت رو بفرست تا قیمت اختصاصی مطب‌ت رو بفرستیم.",
  demo:
    "می‌تونی نمونه سایت مطب رو اینجا ببینی: araaye.com/demo\n\nتخصص مطب‌ت رو انتخاب کن و در چند ثانیه یک سایت کامل مثل چیزی که برات می‌سازیم رو ببین. بعدش شماره‌ت رو بفرست تا قیمت اختصاصی بگیری.",
  time:
    "اولین نسخه سایت معمولاً در ۲ روز کاری تحویل می‌شه. راه‌اندازی کامل (دامنه، سرور، نوبت‌دهی) حدود ۱ هفته.\n\nسؤال دیگه‌ای داری؟",
  guarantee:
    "تا ۷ روز از شروع کار، ضمانت بازگشت کامل وجه داری — بدون سؤال. دامنه هم به نام خودت ثبت می‌شه.\n\nشماره‌ت رو بفرست تا شروع کنیم.",
  default:
    "سؤال خوبیه! می‌تونم درباره قیمت پکیج‌ها، نوبت‌دهی آنلاین، چت‌بات بیماران، زمان تحویل و ضمانت کمکت کنم.\n\nیا شماره‌ت رو بفرست تا کارشناس ما مستقیم راهنماییت کنه.",
  contact_saved:
    "عالی! شماره‌ت ثبت شد ✓\nکارشناس آرایه در کمتر از ۲ ساعت کاری برای پیشنهاد اختصاصی مطب‌ت تماس می‌گیره.",
};

const QUICK_KEYS: { key: FaqKey; label: string }[] = [
  { key: "price", label: "قیمت پکیج‌ها؟" },
  { key: "booking", label: "نوبت‌دهی آنلاین" },
  { key: "chatbot", label: "چت‌بات بیماران" },
  { key: "turnkey", label: "همه‌چیز با شماست؟" },
  { key: "time", label: "زمان تحویل؟" },
];

function toLatin(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function matchFaq(text: string): FaqKey {
  const t = text.toLowerCase();
  if (/سلام|درود|\bhi\b|hello/.test(t)) return "hello";
  if (/قیمت|چنده|هزینه|نرخ|تعرفه|پکیج|cost|price/.test(t)) return "price";
  if (/نوبت|رزرو|booking|appointment/.test(t)) return "booking";
  if (/چت|بات|bot|پاسخگو/.test(t)) return "chatbot";
  if (/دامنه|سرور|درگاه|همه|خودتون|turnkey|فنی/.test(t)) return "turnkey";
  if (/نمونه|دمو|demo|ببین/.test(t)) return "demo";
  if (/چقدر|زمان|مدت|کی |طول|تحویل|time/.test(t)) return "time";
  if (/ضمانت|گارانتی|تضمین|guarantee|بازگشت/.test(t)) return "guarantee";
  return "default";
}

function extractPhone(text: string): string | null {
  const m = toLatin(text).replace(/[\s\-()]/g, "").match(/(?:\+98|0098|0)?9\d{9}/);
  if (!m) return null;
  return "0" + m[0].replace(/^(\+98|0098|0)?/, "");
}

export default function DoctorsChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [started, setStarted] = useState(false);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [leadSaved, setLeadSaved] = useState(false);
  const lastTopic = useRef<string>("");
  const threadRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!started) setNudge(true);
    }, 20000);
    return () => clearTimeout(t);
  }, [started]);

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
    setNudge(false);
    setBadgeVisible(false);
    pushGtmEvent("chat_open", { page: "doctors", source: "doctors_chatbot" });
    if (!started) {
      setStarted(true);
      setTimeout(() => addBotMsg(FAQ.hello), 350);
    }
    setTimeout(() => inputRef.current?.focus(), 500);
  }

  function submitChatLead(phone: string) {
    const topic = lastTopic.current || "doctor_site";
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "doctors_chatbot",
        page: "/doctors",
        contact: phone,
        goal: topic,
        channel: "doctors_landing",
        detail: `chatbot conversation | topic: ${topic || "-"}`,
        consent: true,
        referrer: document.referrer || undefined,
        company: "",
        ...getUtmParams(),
      }),
      keepalive: true,
    })
      .then(() => {
        pushGtmEvent("generate_lead", { source: "doctors_chatbot", page: "doctors" });
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
    if (key !== "hello" && key !== "default" && key !== "contact_saved") {
      lastTopic.current = key;
    }
    addBotMsg(FAQ[key]);
  }

  function handleQuick(item: { key: FaqKey; label: string }) {
    setMessages((prev) => [...prev, { who: "user", text: item.label }]);
    if (item.key !== "hello" && item.key !== "default") {
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
      {/* Launcher — بالای sticky bar موبایل تا با دکمه «مشاهده پکیج‌ها» تداخل نداشته باشد */}
      <div className="fixed bottom-20 left-4 z-50 flex flex-col items-end gap-2 sm:bottom-5 sm:left-5">
        {nudge && !open && (
          <button
            type="button"
            onClick={openChat}
            className="animate-fade-up max-w-[230px] rounded-2xl border border-sky-100 bg-white px-4 py-3 text-right text-sm font-medium leading-relaxed text-navy-700 shadow-lg transition-shadow hover:shadow-xl"
          >
            قیمت مطب‌تان را بپرسید 👋
          </button>
        )}

        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openChat())}
          aria-label="چت با دستیار آرایه برای پزشکان"
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg transition-all duration-200 hover:bg-sky-700 hover:shadow-xl active:scale-[0.96]"
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
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white ring-2 ring-white">
              1
            </span>
          )}
        </button>
      </div>

      {open && (
        <div
          dir="rtl"
          className="fixed bottom-[5.75rem] left-4 z-50 flex w-[calc(100vw-32px)] max-w-sm animate-fade-up flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl sm:bottom-24 sm:left-5 sm:w-[calc(100vw-40px)]"
          style={{ maxHeight: "min(520px, calc(100dvh - 140px))" }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-sky-100 bg-sky-700 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-sky-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold leading-none text-white">دستیار مطب آرایه</p>
                <p className="mt-0.5 text-[11px] text-sky-200">ویژه پزشکان و کلینیک‌ها</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="بستن"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-sky-200 transition-colors hover:bg-white/10 hover:text-white"
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
                      ? "rounded-tl-sm bg-sky-700 text-white"
                      : "rounded-tr-sm bg-sky-50/80 text-navy-800"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-end">
                <div className="flex items-center gap-1 rounded-2xl rounded-tr-sm bg-sky-50/80 px-4 py-3">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-500"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!typing && !leadSaved && messages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-sky-50 px-4 pb-2 pt-1">
              {QUICK_KEYS.map((q) => (
                <button
                  key={q.key}
                  type="button"
                  onClick={() => handleQuick(q)}
                  className="rounded-xl border border-navy-200 bg-white px-3 py-1.5 text-xs font-medium text-navy-700 transition-colors hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-sky-100 px-3 py-2.5">
            <input
              ref={inputRef}
              type="text"
              dir="rtl"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="سؤالت رو بنویس یا شماره‌ت رو بفرست…"
              className="flex-1 rounded-xl bg-sky-50/60 px-3 py-2 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-400 focus:bg-white focus:ring-2 focus:ring-sky-200"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              aria-label="ارسال"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
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
