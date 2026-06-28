// =====================================================
// lib/telegramBot.ts
// دستیار آرایه — مشاور فروش هوشمند تلگرام (OpenRouter)
// =====================================================

import { normalizeContact } from "@/lib/validateContact";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";
const LEADS_API_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/leads`
  : null;

const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ---------- Telegram API helpers ----------

async function callTelegram(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

// ---------- OpenRouter / conversation ----------

type Role = "system" | "user" | "assistant";
interface ChatMessage { role: Role; content: string; }

interface Session {
  name?: string;
  phone?: string;
  specialty?: string;
  city?: string;
  pain?: string;
  role?: string;
  urgency?: string;
  done: boolean;
  messages: ChatMessage[];
  startedAt: number;
}

const sessions = new Map<number, Session>();

function getSession(chatId: number): Session {
  const existing = sessions.get(chatId);
  if (existing && Date.now() - existing.startedAt < 30 * 60 * 1000) {
    return existing;
  }
  const fresh: Session = {
    done: false,
    messages: [{ role: "system", content: SYSTEM_PROMPT }],
    startedAt: Date.now(),
  };
  sessions.set(chatId, fresh);
  return fresh;
}

function resetSession(chatId: number) {
  sessions.set(chatId, {
    done: false,
    messages: [{ role: "system", content: SYSTEM_PROMPT }],
    startedAt: Date.now(),
  });
}

const SYSTEM_PROMPT = `تو «دستیار آرایه» هستی — مشاور فروش ارشد تیم آرایه در تلگرام.

شخصیت تو: مثل یک مشاور فروش با تجربه و خوش‌مشرب که سال‌ها در حوزهٔ دیجیتال کار کرده. گرم، بااعتمادبه‌نفس، صادق و دلسوز. هیچ‌وقت ربات‌وار یا فرمالیستی حرف نزن. مثل یک انسان واقعی که دغدغهٔ مشتری را درک می‌کند صحبت کن.

== شرکت آرایه ==
آرایه به کسب‌وکارها سایت و بستر آنلاین حرفه‌ای می‌فروشد:
- پزشکان، مطب‌ها و کلینیک‌ها → سایت بیمارآور + نوبت‌دهی آنلاین + چت‌بات پاسخگوی بیمار ۲۴ساعته
- کسب‌وکارهای خرد و متوسط → سایت حرفه‌ای، فروشگاه آنلاین، رزرو آنلاین، درگاه پرداخت
- رستوران‌ها، سالن‌های زیبایی، آموزشگاه‌ها و هر کسب‌وکاری که به حضور آنلاین نیاز دارد

== محصول آرایه ==
- وب‌سایت تخصصی متناسب با نوع کسب‌وکار
- نوبت‌دهی / رزرو / فروش آنلاین (بسته به حوزه)
- دامنه، سرور، درگاه پرداخت — همه به نام خود مشتری
- تحویل اولین نسخه: ۲ روز کاری
- مشتری هیچ کار فنی انجام نمی‌دهد — همه‌چیز را تیم آرایه انجام می‌دهد
- نمونه‌کار: دکتر عالیه پوردست (عفونی)، دکتر اشفی‌وند (شنوایی)، و چند کسب‌وکار خرد
- ارزش اصلی: مشتری حتی نیمه‌شب به شما می‌رسد و جامانده نمی‌شود = درآمد بیشتر و دردسر کمتر
- پکیج‌ها: مطب / کلینیک / مرکز درمانی / کسب‌وکار خرد / فروشگاه

== نقش تو ==
- مشاوره بده، سوال جواب بده، اعتماد بساز.
- مخاطب را گرم کن و وقتی آماده شد، شماره‌اش را بگیر و به همکار انسانی پاس بده.
- نمی‌فروشی، نمی‌بندی، اصرار نمی‌کنی. صادقانه و حرفه‌ای حرف بزن.
- هدف نهایی: گرفتن شماره تماس برای وصل کردن به همکار انسانی.

== جریان مکالمه ==
1. خوشامد گرم و کوتاه — مثل یک انسان. بپرس در چه حوزه‌ای فعالیت می‌کنند و بزرگ‌ترین دردسرشان چیست.
   مثال خوب: «سلام، خوشحالم که پیام دادید. من دستیار مشاوره‌ای آرایه هستم. در چه حوزه‌ای فعالیت می‌کنید؟»
   مثال بد: «سلام. به ربات آرایه خوش آمدید. لطفاً اطلاعات خود را وارد کنید.»
2. با دقت گوش بده. روی درد اصلی تمرکز کن، نه روی فروش.
3. بر اساس دردشان، راه‌حل آرایه را ساده، مرتبط و بدون اغراق توضیح بده.
   - اگر دردش نوبت‌دهی است → نوبت‌دهی آنلاین را توضیح بده.
   - اگر دردش جذب مشتری است → سایت + سئو + حضور آنلاین را توضیح بده.
   - اگر دردش پاسخگویی شبانه است → چت‌بات ۲۴ساعته را توضیح بده.
4. اگر شک یا تردید داشت:
   - نمونه‌کار مرتبط بگو.
   - تحویل ۲ روزه را یادآور شو.
   - بگو «مشتری هیچ کار فنی انجام نمی‌دهد».
5. ضمن مکالمه نرم بفهم (بدون اینکه بگویی داری می‌سنجی):
   - نوع کسب‌وکار و شهر
   - مشکل اصلی
   - آیا تصمیم‌گیرنده است یا فقط پرس‌وجو می‌کند
   - چقدر فوری نیاز دارد

== مدیریت اعتراضات ==
- «گرنه» / «نیاز ندارم»: بپرس «الان مشتری‌هاتون چطور پیدا می‌کنن؟» و درد نبود سایت را باز کن.
- «گرنه»: بگو «کاملاً درک می‌کنم. اگه یه روزی نیاز داشتید، من اینجام.» و مکالمه را باز بگذار.
- «گرنه»: بگو «حق با شماست. فقط بذارید یه نمونه‌کار نشونتون بدم تا ببینید چقدر تفاوت داره.»
- «گرنه»: بگو «قیمت به نیاز دقیق شما بستگی داره؛ همکارم شفاف می‌گه و یه دموی رایگان نشون می‌ده. شماره‌تون رو بدید تا دقیق بگه.»
- «گرنه»: صادقانه بگو «من دستیار هوشمند آرایه هستم و همکار انسانی برای جزئیات نهایی تماس می‌گیرد.»

== قوانین ==
- قیمت دقیق نده. اگر پرسید: «قیمت به نیاز دقیق کسب‌وکار شما بستگی داره؛ همکارم دقیق و شفاف می‌گه و حتی یه دموی رایگان نشونتون می‌ده.»
- وقتی علاقه واقعی نشان داد (قیمت پرسید، گفت کی شروع می‌شه، گفت چطور سفارش بدم، گفت نمونه می‌خوام): بگو «عالیه! شماره‌تون رو بدید تا همکارم همین امروز باهاتون تماس بگیره و دقیق راهنماییتون کنه.»
- بعد از گرفتن شماره، تأیید کن و بگو به‌زودی تماس می‌گیرند.
- لحن گرم، انسانی و حرفه‌ای. صمیمی ولی نه بازاری. حداکثر یک ایموجی در هر پیام. پاسخ‌ها کوتاه (۲-۴ خط).
- هیچ‌وقت اطلاعات غلط نده؛ اگر چیزی را نمی‌دانی بگو «همکارم دقیق می‌گه».
- هیچ‌وقت خروجی فرم یا خلاصهٔ لید برای تیم چاپ نکن. فقط با مخاطب مکالمه کن.
- اگر مخاطب گفت قبلاً سایت دارد، بپرس راضی است یا نه و دردش را پیدا کن.
- اگر مخاطب گفت فقط اطلاعات می‌خواد، اطلاعات بده و در انتها بگو «اگه خواستید ادامه بدیم، شماره‌تون رو بفرستید تا همکارم دقیق‌تر راهنماییتون کنه.»`;

async function callOpenRouter(messages: ChatMessage[]): Promise<string | null> {
  if (!OPENROUTER_API_KEY) {
    console.error("[openrouter] missing OPENROUTER_API_KEY");
    return null;
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SITE_URL,
        "X-Title": "Araye Telegram Assistant",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[openrouter] error", res.status, data);
      return null;
    }

    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" ? content.trim() : null;
  } catch (e) {
    console.error("[openrouter] exception", e);
    return null;
  }
}

// ---------- Lightweight extraction helpers ----------

function extractPhone(text: string): string | null {
  const contact = normalizeContact(text);
  return contact.kind === "invalid" ? null : contact.value;
}

function extractSpecialty(text: string): string | null {
  const match = text.match(/(?:متخصص|دکتر|فوق تخصص|تخصص|پزشک|رزیدنت)\s+([\u0600-\u06FF\s]+?)(?:در|هستم|بودم|هستند|م\.|است|هستند)/);
  return match ? match[1].trim() : null;
}

function extractCity(text: string): string | null {
  const match = text.match(/(?:شهر|در|مطب)\s+([\u0600-\u06FF\s]+?)(?:هستم|هست|میکنم|م\.|زندگی|کار|دارم)/);
  return match ? match[1].trim() : null;
}

function detectPain(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("نوبت") || t.includes("جذب بیمار") || t.includes("وقت")) return "نوبت‌دهی / جذب بیمار";
  if (t.includes("سایت") || t.includes("وبسایت") || t.includes("وب‌سایت")) return "نبود سایت";
  if (t.includes("گوگل") || t.includes("سئو") || t.includes("دیده") || t.includes("آنلاین")) return "دیده‌شدن آنلاین";
  if (t.includes("چت") || t.includes("چت‌بات") || t.includes("پاسخگویی") || t.includes("پشتیبانی")) return "پاسخگویی بیمار";
  if (t.includes("دامنه") || t.includes("سرور") || t.includes("درگاه") || t.includes("هاست")) return "زیرساخت فنی";
  return null;
}

function detectUrgency(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("فوری") || t.includes("همین") || t.includes("امروز") || t.includes("این هفته") || t.includes("زود")) return "فوری";
  if (t.includes("آینده") || t.includes("ماه") || t.includes("بعد")) return "متوسط";
  if (t.includes("فعلا") || t.includes("فکر") || t.includes("بررسی")) return "پایین";
  return null;
}

function detectRole(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("مدیر") || t.includes("مسئول") || t.includes("منشی") || t.includes("کادر")) return "غیرپزشک/نیاز به تایید";
  if (t.includes("خودم پزشک") || t.includes("دکتر هستم") || t.includes("من پزشک") || t.includes("خودم هستم")) return "خود پزشک/تصمیم‌گیرنده";
  return null;
}

function extractFields(session: Session, text: string) {
  const userTexts = session.messages.filter((m) => m.role === "user").map((m) => m.content);
  const allText = userTexts.join(" ") + " " + text;

  const specialty = extractSpecialty(allText) || extractSpecialty(text);
  if (specialty) session.specialty = specialty;

  const city = extractCity(allText) || extractCity(text);
  if (city) session.city = city;

  const pain = detectPain(allText) || detectPain(text);
  if (pain) session.pain = pain;

  const urgency = detectUrgency(allText) || detectUrgency(text);
  if (urgency) session.urgency = urgency;

  const role = detectRole(allText) || detectRole(text);
  if (role) session.role = role;
}

// ---------- Lead saving and team summary ----------

interface LeadSession extends Session {
  specialty?: string;
  city?: string;
  pain?: string;
  role?: string;
  urgency?: string;
}

async function saveLeadAndNotifyAdmin(chatId: number, session: LeadSession, phone: string) {
  const history = session.messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "پزشک" : "دستیار"}: ${m.content}`)
    .join(" | ");

  const detail = `مشکل اصلی: ${session.pain || "نامشخص"}. تخصص و شهر: ${session.specialty || "نامشخص"} / ${session.city || "نامشخص"}. نقش: ${session.role || "نامشخص"}. فوریت: ${session.urgency || "نامشخص"}. تاریخچه: ${history}`;

  const payload = {
    source: "telegram_bot",
    name: session.name || "پزشک/مدیر مطب",
    contact: phone,
    page: "telegram",
    goal: "مشاوره و فروش سایت پزشکی",
    intent: session.pain || "مشاوره عمومی",
    sitetype: "مطب/کلینیک/مرکز درمانی",
    detail,
    raw: { ...session, chatId },
  };

  let saved = false;
  if (LEADS_API_URL) {
    try {
      const res = await fetch(LEADS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      saved = res.ok;
    } catch {
      saved = false;
    }
  }

  if (!saved) {
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase");
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("leads").insert({
        source: "telegram_bot",
        name: session.name || "پزشک/مدیر مطب",
        contact: phone,
        page: "telegram",
        goal: "مشاوره و فروش سایت پزشکی",
        intent: session.pain || "مشاوره عمومی",
        sitetype: "مطب/کلینیک/مرکز درمانی",
        detail,
        raw: payload,
      });
      saved = !error;
    } catch {
      saved = false;
    }
  }

  if (!saved) {
    console.error("[telegramBot] failed to save lead", { chatId, session });
  }

  if (ADMIN_CHAT_ID) {
    const summary = `🔴 لید داغ
` +
      `نام: ${session.name || "نامشخص"}\n` +
      `حوزه فعالیت/نقش و شهر: ${session.specialty || "نامشخص"} / ${session.city || "نامشخص"}\n` +
      `مشکل اصلی: ${session.pain || "نامشخص"}\n` +
      `سطح فوریت: ${session.urgency || "نامشخص"}\n` +
      `شماره: ${phone}\n` +
      `خلاصهٔ مکالمه: ${history}`;
    await sendMessage(Number(ADMIN_CHAT_ID), summary);
  }
}

// ---------- Public handler ----------

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; first_name?: string };
    text?: string;
    contact?: { phone_number: string };
  };
}

export async function handleUpdate(update: TelegramUpdate) {
  if (!update.message) return;
  const msg = update.message;
  const chatId = msg.chat.id;
  const text = msg.text?.trim() || "";
  const session = getSession(chatId) as LeadSession;

  if (!session.name && msg.chat.first_name) {
    session.name = msg.chat.first_name;
  }

  if (text === "/start" || text.startsWith("/start ")) {
    resetSession(chatId);
    const fresh = getSession(chatId) as LeadSession;
    if (msg.chat.first_name) fresh.name = msg.chat.first_name;
    const reply = await callOpenRouter([...fresh.messages, { role: "user", content: "سلام" }]);
    if (reply) fresh.messages.push({ role: "assistant", content: reply });
    await sendMessage(chatId, reply || "سلام، خوشحالم که پیام دادید. من دستیار مشاوره‌ای آرایه هستم. بفرمایید در چه حوزه‌ای فعالیت می‌کنید تا بهتر راهنماییتون کنم. 🌿");
    return;
  }

  if (text === "/cancel") {
    resetSession(chatId);
    await sendMessage(chatId, "فرایند لغو شد. برای شروع مجدد /start بزنید.");
    return;
  }

  if (session.done) {
    await sendMessage(chatId, "ثبت شما کامل شده. برای مشاورهٔ جدید /start بزنید. 🌟");
    return;
  }

  session.messages.push({ role: "user", content: text });
  extractFields(session, text);

  const phone = extractPhone(text);
  if (phone) {
    session.phone = phone;
    session.done = true;
    session.messages.push({ role: "assistant", content: "ممنون! شمارهٔ شما ثبت شد. همکار انسانی آرایه به‌زودی با شما تماس می‌گیرد. 🌟" });
    await sendMessage(chatId, "ممنون! شمارهٔ شما ثبت شد. همکار انسانی آرایه به‌زودی با شما تماس می‌گیرد. 🌟");
    await saveLeadAndNotifyAdmin(chatId, session, phone);
    return;
  }

  const reply = await callOpenRouter(session.messages);
  if (reply) {
    session.messages.push({ role: "assistant", content: reply });
    await sendMessage(chatId, reply);
  } else {
    await sendMessage(chatId, "مشکلی در ارتباط با دستیار پیش آمده. لطفاً چند لحظه دیگر امتحان کنید یا شماره‌تان را بفرستید تا همکارم با شما تماس بگیرد. 📱");
  }
}
