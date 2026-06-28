// =====================================================
// lib/telegramBot.ts
// دستیار آرایه — مشاور فروش هوشمند تلگرام برای پزشکان
// =====================================================

import { normalizeContact } from "@/lib/validateContact";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
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

// ---------- Conversation state ----------
// در production با Redis/Supabase جایگزین شود

type Step = "greeting" | "ask_pain" | "explore" | "ask_phone" | "done";

interface Session {
  step: Step;
  name?: string;
  phone?: string;
  specialty?: string;
  city?: string;
  pain?: string;
  role?: string;
  urgency?: string;
  summary?: string;
  history: string[];
  startedAt: number;
}

const sessions = new Map<number, Session>();

function getSession(chatId: number): Session {
  const existing = sessions.get(chatId);
  if (existing && Date.now() - existing.startedAt < 30 * 60 * 1000) {
    return existing;
  }
  const fresh: Session = { step: "greeting", startedAt: Date.now(), history: [] };
  sessions.set(chatId, fresh);
  return fresh;
}

function resetSession(chatId: number) {
  sessions.set(chatId, { step: "greeting", startedAt: Date.now(), history: [] });
}

function pushHistory(session: Session, text: string) {
  session.history.push(text);
  if (session.history.length > 6) session.history.shift();
}

// ---------- Persian keyword classifiers ----------

const PAIN_KEYWORDS: Record<string, string[]> = {
  appointment: ["نوبت", "نوبت دهی", "نوبت‌دهی", "جذب بیمار", "بیمار کم", "وقت"],
  site: ["سایت", "وبسایت", "وب‌سایت", "سایت ندارم", "سایت ندار"],
  visibility: ["دیده نشدن", "دیده نمیشم", "گوگل", "سئو", "معرفی", "آنلاین"],
  support: ["چت", "چت‌بات", "چتبات", "پاسخگویی", "سوالات بیمار", "پشتیبانی"],
  domain: ["دامنه", "سرور", "درگاه", "پرداخت", "هاست", "فنی"],
};

const BUYING_SIGNALS = [
  "قیمت", "چقدر میشه", "هزینه", "شروع", "سفارش", "سفارش بدم", "ثبت", "نمونه", "دمو",
  "تماس بگیرید", "تماس بگیر", "با من تماس", "مشاوره", "راهنمایی", "خرید", "می‌خوام",
  "میخوام", "علاقه", "آماده‌ام", "آماده ام", "باشه", "بفرست", "تماس",
];

const HUMAN_HANDOFF_QUESTIONS = [
  "با انسان", "با آدم", "کارشناس", "همکار", "با خودت", "انسان", "آدم", "مدیری",
];

const BOT_QUESTIONS = [
  "رباتی", "ربات", "هوش مصنوعی", "بطی", "دستیار هوشمند", "خودت کی هستی", "تو کی هستی",
];

function detectPain(text: string): string | null {
  const t = text.toLowerCase();
  for (const [key, words] of Object.entries(PAIN_KEYWORDS)) {
    if (words.some((w) => t.includes(w))) return key;
  }
  return null;
}

function hasBuyingSignal(text: string): boolean {
  const t = text.toLowerCase();
  return BUYING_SIGNALS.some((w) => t.includes(w.toLowerCase()));
}

function asksForHuman(text: string): boolean {
  const t = text.toLowerCase();
  return HUMAN_HANDOFF_QUESTIONS.some((w) => t.includes(w.toLowerCase()));
}

function asksIfBot(text: string): boolean {
  const t = text.toLowerCase();
  if (/\bai\b/i.test(text)) return true;
  return BOT_QUESTIONS.some((w) => t.includes(w.toLowerCase()));
}

function extractSpecialty(text: string): string | null {
  const match = text.match(/(?:متخصص|دکتر|فellowship|فوق تخصص|تخصص|پزشک|رزیدنت)\s+([\u0600-\u06FF\s]+?)(?:در|هستم|بودم|هستند|م\.)/);
  return match ? match[1].trim() : null;
}

function extractCity(text: string): string | null {
  const match = text.match(/(?:شهر|در|مطب)\s+([\u0600-\u06FF\s]+?)(?:هستم|هست|میکنم|م\.|زندگی|کار)/);
  return match ? match[1].trim() : null;
}

function extractRole(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("مدیر") || t.includes("مسئول") || t.includes("منشی") || t.includes("مسئول مطب")) return "decider_no";
  if (t.includes("خودم پزشک") || t.includes("دکتر هستم") || t.includes("من پزشک") || t.includes("خودم هستم")) return "decider_yes";
  return null;
}

function extractUrgency(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes("فوری") || t.includes("همین") || t.includes("امروز") || t.includes("این هفته") || t.includes("زود")) return "فوری";
  if (t.includes("آینده") || t.includes("ماه") || t.includes("بعد")) return "متوسط";
  if (t.includes("فعلا") || t.includes("فکر") || t.includes("بررسی")) return "پایین";
  return null;
}

// ---------- Response snippets ----------

const RESPONSES: Record<string, string> = {
  welcome: "سلام دکتر عزیز، روزتون بخیر. 🌿\n\nمن دستیار مشاورهٔ آرایه هستم. اگر اجازه بدید یه سوال کوچک بپرسم: بزرگ‌ترین دردسر مطب یا مرکز درمانی شما الان چیه؟ نوبت‌دهی، جذب بیمار، نبود سایت، یا پاسخگویی شبانه؟",

  pain_appointment: "مشکل رزرو نوبت و جذب بیمار واقعاً دردآور است. با سایت و چت‌بات آرایه، بیمار حتی نیمه‌شب نوبت می‌گیرد و به مطب دیگر نمی‌رود. در نتیجه نوبت جامانده کمتر و درآمد مطب بیشتر می‌شود. 🩺",

  pain_site: "سایت تخصصی مطب یعنی اعتماد بیمار از اولین سرچ. ما وب‌سایت کامل، دامنه، سرور و درگاه پرداخت را به نام خود پزشک تحویل می‌دهیم و پزشک هیچ کار فنی انجام نمی‌دهد. 🌐",

  pain_visibility: "اگر بیمار در گوگل شما را نبیند، سراغ رقیب می‌رود. سایت آرایه برای جستجوی نام پزشک و تخصص بهینه می‌شود تا بیمار راحت‌تر پیدایتان کند. 📍",

  pain_support: "چت‌بات ۲۴ساعتهٔ آرایه به سوال‌های رایج بیمار (هزینه، آدرس، بیمه، نوبت) پاسخ می‌دهد و بار تماس‌های تکراری را کم می‌کند. 🤖",

  pain_domain: "تمام زیرساخت‌ها (دامنه، سرور، درگاه پرداخت) به نام خود پزشک ثبت می‌شود. تحویل اولین نسخه ۲ روز کاری است و هیچ کار فنی از سمت پزشک نیست. ⚙️",

  pain_general: "ممنون که گفتید. ما بسته به نیاز مطب، پکیج‌های مطب (تک‌پزشک)، کلینیک (چندپزشک) و مرکز درمانی داریم. راه‌حل دقیق بستگی به تخصص و شهر شما دارد. 💼",

  samples: "نمونه‌کارهای ما: سایت دکتر عالیه پوردست (عفونی) و دکتر اشرفی‌وند (شنوایی). هر دو ظرف ۲ روز تحویل شدند و بیماران‌شان آنلاین نوبت می‌گیرند. 🏥",

  samples_plus_delivery: "تحویل اولین نسخه ۲ روز کاری است. بعد از تایید نهایی، سایت آمادهٔ استفاده می‌شود. اگر بخواهید همکارم نمونه واقعی را دقیق‌تر نشانتان می‌دهد. ✅",

  pricing: "قیمت دقیق به نیاز دقیق مطبتان بستگی دارد. همکارم می‌تواند دقیق و شفاف بگوید و حتی یک دموی رایگان نشانتان بدهد. 📞",

  human_handoff: "عالیه دکتر! شماره‌تان را بدید تا همکارم همین امروز با شما تماس بگیرد و دقیق راهنمایتان کند. 🙏",

  ask_phone: "لطفاً شماره موبایلتان را بفرستید تا همکارم با شما تماس بگیرد. ☎️",

  invalid_phone: "این شماره معتبر نیست. لطفاً شماره موبایل ایرانی معتبر بفرستید، مثلاً 09123456789. ⚠️",

  phone_confirm: "ممنون دکتر! شمارهٔ شما ثبت شد. همکار انسانی آرایه به‌زودی با شما تماس می‌گیرد. 🌟",

  honesty: "بله، من دستیار هوشمند آرایه هستم. برای جزئیات نهایی و انتخاب پکیج مناسب، همکار انسانی با شما تماس می‌گیرد. 🤖",

  unknown: "حتماً. بگذارید همکار انسانی بهتر راهنمایتان کند. اگر شماره موبایلتان را بفرستید، همین امروز با شما تماس می‌گیرند. 📱",
};

// ---------- Conversation flow ----------

async function greet(chatId: number, session: Session) {
  session.step = "ask_pain";
  await sendMessage(chatId, RESPONSES.welcome);
}

async function handlePain(chatId: number, session: Session, text: string) {
  pushHistory(session, text);
  const pain = detectPain(text);
  session.pain = pain || "عمومی";

  if (pain === "appointment") await sendMessage(chatId, RESPONSES.pain_appointment);
  else if (pain === "site") await sendMessage(chatId, RESPONSES.pain_site);
  else if (pain === "visibility") await sendMessage(chatId, RESPONSES.pain_visibility);
  else if (pain === "support") await sendMessage(chatId, RESPONSES.pain_support);
  else if (pain === "domain") await sendMessage(chatId, RESPONSES.pain_domain);
  else await sendMessage(chatId, RESPONSES.pain_general);

  const specialty = extractSpecialty(text);
  if (specialty) session.specialty = specialty;
  const city = extractCity(text);
  if (city) session.city = city;

  if (hasBuyingSignal(text)) {
    session.step = "ask_phone";
    await sendMessage(chatId, RESPONSES.human_handoff);
    return;
  }

  session.step = "explore";
  await sendMessage(chatId, "برای راهنمایی دقیق‌تر، چه تخصصی و در چه شهری فعال هستید؟");
}

async function handleExplore(chatId: number, session: Session, text: string) {
  pushHistory(session, text);

  const specialty = extractSpecialty(text) || session.specialty;
  if (specialty) session.specialty = specialty;

  const city = extractCity(text) || session.city;
  if (city) session.city = city;

  const role = extractRole(text);
  if (role) session.role = role === "decider_yes" ? "خود پزشک/تصمیم‌گیرنده" : "غیرپزشک/نیاز به تایید";

  const urgency = extractUrgency(text);
  if (urgency) session.urgency = urgency;

  if (asksIfBot(text)) {
    await sendMessage(chatId, RESPONSES.honesty);
    return;
  }

  if (asksForHuman(text) || hasBuyingSignal(text)) {
    session.step = "ask_phone";
    await sendMessage(chatId, RESPONSES.human_handoff);
    return;
  }

  const t = text.toLowerCase();
  if (t.includes("نمونه") || t.includes("دمو") || t.includes("نمونه کار") || t.includes("نمونه‌کار")) {
    await sendMessage(chatId, RESPONSES.samples);
    await sendMessage(chatId, RESPONSES.samples_plus_delivery);
    return;
  }

  if (t.includes("قیمت") || t.includes("هزینه") || t.includes("چقدر")) {
    await sendMessage(chatId, RESPONSES.pricing);
    session.step = "ask_phone";
    await sendMessage(chatId, RESPONSES.ask_phone);
    return;
  }

  if (t.includes("تحویل") || t.includes("چند روز") || t.includes("۲ روز") || t.includes("دو روز")) {
    await sendMessage(chatId, RESPONSES.samples_plus_delivery);
    return;
  }

  if (t.includes("شک") || t.includes("مطمئن") || t.includes("فکر کنم") || t.includes("نیاز دارم")) {
    await sendMessage(chatId, "کاملاً طبیعی است. نمونه‌کارهای ما و تحویل ۲ روزه کمک می‌کند با خیال راحت‌تر تصمیم بگیرید. اگر بخواهید همکارم دموی رایگان می‌دهد. 🏥");
    return;
  }

  // Soft probe if we still lack info
  if (!session.specialty || !session.city) {
    await sendMessage(chatId, "برای پیشنهاد دقیق‌تر، تخصص و شهر مطبتان را بفرمایید؟");
    return;
  }

  if (!session.urgency) {
    await sendMessage(chatId, "این نیازتان چقدر فوری است؟ همین ماه، چند هفتهٔ آینده، یا هنوز در حال بررسی؟");
    return;
  }

  await sendMessage(chatId, "ممنون از توضیحات. اگر مایل به مشاورهٔ دقیق‌تر هستید، شماره موبایلتان را بفرستید تا همکارم تماس بگیرد. 📞");
}

async function askPhone(chatId: number, session: Session, text: string) {
  const contact = normalizeContact(text);

  if (contact.kind === "invalid") {
    await sendMessage(chatId, RESPONSES.invalid_phone);
    return;
  }

  session.phone = contact.value;
  session.step = "done";

  await sendMessage(chatId, RESPONSES.phone_confirm);

  await saveLeadAndNotifyAdmin(chatId, session);
}

async function saveLeadAndNotifyAdmin(chatId: number, session: Session) {
  const detail = `دردسر اصلی: ${session.pain || "نامشخص"}. تخصص و شهر: ${session.specialty || "نامشخص"} / ${session.city || "نامشخص"}. نقش: ${session.role || "نامشخص"}. فوریت: ${session.urgency || "نامشخص"}. تاریخچه: ${session.history.join(" | ")}`;

  const payload = {
    source: "telegram_bot",
    name: session.name || "پزشک/مدیر مطب",
    contact: session.phone,
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
        contact: session.phone,
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
    const teamSummary = buildTeamSummary(session);
    await sendMessage(Number(ADMIN_CHAT_ID), teamSummary);
  }
}

function buildTeamSummary(session: Session): string {
  return `🔴 لید داغ
` +
    `نام: ${session.name || "نامشخص"}\n` +
    `تخصص و شهر: ${session.specialty || "نامشخص"} / ${session.city || "نامشخص"}\n` +
    `مشکل اصلی: ${session.pain || "نامشخص"}\n` +
    `سطح فوریت: ${session.urgency || "نامشخص"}\n` +
    `شماره: ${session.phone || "نامشخص"}\n` +
    `خلاصهٔ مکالمه: ${session.history.join(" | ")}`;
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
  const session = getSession(chatId);

  if (!session.name && msg.chat.first_name) {
    session.name = msg.chat.first_name;
  }

  if (text === "/start" || text.startsWith("/start ")) {
    resetSession(chatId);
    const fresh = getSession(chatId);
    if (msg.chat.first_name) fresh.name = msg.chat.first_name;
    await greet(chatId, fresh);
    return;
  }

  if (text === "/cancel") {
    resetSession(chatId);
    await sendMessage(chatId, "فرایند لغو شد. برای شروع مجدد /start بزنید.");
    return;
  }

  if (session.step === "done") {
    await sendMessage(chatId, "ثبت شما کامل شده. برای مشاورهٔ جدید /start بزنید. 🌟");
    return;
  }

  if (session.step === "greeting") {
    await greet(chatId, session);
    return;
  }

  if (session.step === "ask_pain") {
    await handlePain(chatId, session, text);
    return;
  }

  if (session.step === "explore") {
    await handleExplore(chatId, session, text);
    return;
  }

  if (session.step === "ask_phone") {
    await askPhone(chatId, session, text);
    return;
  }
}
