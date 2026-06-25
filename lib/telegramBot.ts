// =====================================================
// lib/telegramBot.ts
// منطق ربات تلگرام برای ثبت لید — بدون کتابخانه خارجی
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

export async function sendMessage(
  chatId: number,
  text: string,
  extra: Record<string, unknown> = {}
) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...extra,
  });
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text: text || "",
  });
}

export async function editMessageReplyMarkup(
  chatId: number,
  messageId: number,
  replyMarkup: Record<string, unknown> | null = null
) {
  return callTelegram("editMessageReplyMarkup", {
    chat_id: chatId,
    message_id: messageId,
    reply_markup: replyMarkup || {},
  });
}

// ---------- Conversation state (in-memory) ----------
// در production با Redis یا Supabase جایگزین شود

type Step =
  | "start"
  | "ask_need"
  | "ask_infra"
  | "ask_challenge"
  | "ask_name"
  | "ask_contact"
  | "done";

interface Session {
  step: Step;
  need?: string;
  infra?: string;
  challenge?: string;
  name?: string;
  contact?: string;
  startedAt: number;
}

const sessions = new Map<number, Session>();

function getSession(chatId: number): Session {
  const existing = sessions.get(chatId);
  if (existing && Date.now() - existing.startedAt < 30 * 60 * 1000) {
    return existing;
  }
  const fresh: Session = { step: "start", startedAt: Date.now() };
  sessions.set(chatId, fresh);
  return fresh;
}

function resetSession(chatId: number) {
  sessions.set(chatId, { step: "start", startedAt: Date.now() });
}

// ---------- Step content ----------

const NEEDS = [
  { label: "🌐 سایت حرفه‌ای", value: "website" },
  { label: "📍 دیده‌شدن آنلاین", value: "visibility" },
  { label: "🤖 چت‌بات / پشتیبانی", value: "support" },
  { label: "⚙️ اتوماسیون", value: "automation" },
];

const INFRA: Record<string, { label: string; value: string }[]> = {
  website: [
    { label: "ندارم", value: "none" },
    { label: "دارم ولی قدیمی", value: "website" },
    { label: "دارم و راضی‌ام", value: "ok" },
  ],
  visibility: [
    { label: "هیچ حضور آنلاینی ندارم", value: "none" },
    { label: "سایت دارم", value: "website" },
    { label: "شبکه اجتماعی فعال دارم", value: "social" },
  ],
  support: [
    { label: "هیچ‌چیز ندارم", value: "none" },
    { label: "چت‌بات دارم", value: "chatbot" },
    { label: "فقط تلفن/ایمیل", value: "manual" },
  ],
  automation: [
    { label: "هیچ اتوماسیونی ندارم", value: "none" },
    { label: "بخشی اتوماتیک است", value: "partial" },
    { label: "سیستم دارم ولی ناقص", value: "existing" },
  ],
};

const CHALLENGES = [
  { label: "🔍 مشتری پیدا نمی‌کنم", value: "discover" },
  { label: "🌐 سایت مناسب ندارم", value: "website" },
  { label: "⏱️ پاسخ‌گویی کند است", value: "response" },
  { label: "📋 پیگیری پراکنده", value: "scattered" },
  { label: "🔄 کارهای تکراری زیاد", value: "repetitive" },
];

// ---------- Inline keyboard builder ----------

function inlineKeyboard(buttons: { label: string; value: string }[][], prefix: string) {
  return {
    inline_keyboard: buttons.map((row) =>
      row.map((b) => ({ text: b.label, callback_data: `${prefix}:${b.value}` }))
    ),
  };
}

function chunked<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

// ---------- Flow steps ----------

async function sendNeedQuestion(chatId: number) {
  const session = getSession(chatId);
  session.step = "ask_need";
  await sendMessage(
    chatId,
    "👋 سلام! خوش اومدی.\n\nبرای شروع، بگو <b>چه نیازی داری</b>؟ یکی از گزینه‌ها رو انتخاب کن:",
    { reply_markup: inlineKeyboard(chunked(NEEDS, 2), "need") }
  );
}

async function sendInfraQuestion(chatId: number, need: string) {
  const session = getSession(chatId);
  session.need = need;
  session.step = "ask_infra";
  const opts = INFRA[need] || INFRA.website;
  const needLabel = NEEDS.find((n) => n.value === need)?.label || need;
  await sendMessage(
    chatId,
    `✅ عالی!\n\nبرای <b>${needLabel}</b>، الان <b>زیرساخت آنلاین</b> داری؟`,
    { reply_markup: inlineKeyboard(chunked(opts, 2), "infra") }
  );
}

async function sendChallengeQuestion(chatId: number, infra: string) {
  const session = getSession(chatId);
  session.infra = infra;
  session.step = "ask_challenge";
  await sendMessage(
    chatId,
    "🎯 مهم‌ترین <b>چالش</b> فعلی کسب‌وکارت چیه؟",
    { reply_markup: inlineKeyboard(chunked(CHALLENGES, 2), "challenge") }
  );
}

async function sendNameQuestion(chatId: number, challenge: string) {
  const session = getSession(chatId);
  session.challenge = challenge;
  session.step = "ask_name";
  await sendMessage(chatId, "👤 چقدر خوب! یه قدم مونده.\n\n<b>اسم</b>ت چیه؟ (همین پایین بنویس)");
}

async function sendContactQuestion(chatId: number, name: string) {
  const session = getSession(chatId);
  session.name = name;
  session.step = "ask_contact";
  await sendMessage(
    chatId,
    `ممنون ${name}! 😊\n\n<b>شماره موبایل</b>ت رو وارد کن تا کارشناس‌های ما باهات تماس بگیرن:`
  );
}

async function finishRegistration(chatId: number, contactRaw: string) {
  const session = getSession(chatId);
  const contact = normalizeContact(contactRaw);

  if (contact.kind === "invalid") {
    await sendMessage(
      chatId,
      "❌ شماره وارد شده معتبر نیست.\n\nلطفاً یه شماره موبایل ایرانی معتبر وارد کن (مثلاً: 09123456789)"
    );
    return;
  }

  session.contact = contact.value;
  session.step = "done";

  // ارسال به /api/leads
  const payload = {
    source: "telegram_bot",
    name: session.name,
    contact: contact.value,
    need: session.need,
    infra: session.infra,
    challenge: session.challenge,
    page: "telegram",
    ts: Date.now(),
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
    // fallback: ذخیره مستقیم اگر URL در دسترس نبود
    try {
      const { getSupabaseAdmin } = await import("@/lib/supabase");
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.from("leads").insert({
        source: "telegram_bot",
        name: session.name,
        contact: contact.value,
        goal: session.need,
        sitetype: session.infra,
        intent: session.challenge,
        page: "telegram",
        raw: payload,
      });
      saved = !error;
    } catch {
      saved = false;
    }
  }

  await sendMessage(
    chatId,
    `✅ <b>ثبت شد!</b>\n\nممنون <b>${session.name}</b>!\n\nاطلاعات مشاوره‌ات ذخیره شد. کارشناسان آرایه طی کمتر از یک روز کاری با شماره <b>${contact.value}</b> باهات تماس می‌گیرن. 🎉\n\nبرای شروع مجدد /start بزن.`
  );

  // اطلاع‌رسانی به ادمین
  if (ADMIN_CHAT_ID) {
    const needLabel = NEEDS.find((n) => n.value === session.need)?.label || session.need;
    const challengeLabel =
      CHALLENGES.find((c) => c.value === session.challenge)?.label || session.challenge;
    await sendMessage(
      Number(ADMIN_CHAT_ID),
      `🔔 <b>لید جدید از تلگرام</b>\n\n👤 نام: ${session.name}\n📱 شماره: ${contact.value}\n🎯 نیاز: ${needLabel}\n⚠️ چالش: ${challengeLabel}`
    );
  }
}

// ---------- Main update handler ----------

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number; first_name?: string };
    text?: string;
    contact?: { phone_number: string };
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name?: string };
    message: { message_id: number; chat: { id: number } };
    data: string;
  };
}

export async function handleUpdate(update: TelegramUpdate) {
  // ---------- callback_query (دکمه‌های inline) ----------
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message.chat.id;
    const data = cq.data;
    const session = getSession(chatId);

    await answerCallbackQuery(cq.id);
    await editMessageReplyMarkup(chatId, cq.message.message_id, null);

    const [prefix, value] = data.split(":");

    if (prefix === "need" && session.step === "ask_need") {
      await sendInfraQuestion(chatId, value);
    } else if (prefix === "infra" && session.step === "ask_infra") {
      await sendChallengeQuestion(chatId, value);
    } else if (prefix === "challenge" && session.step === "ask_challenge") {
      await sendNameQuestion(chatId, value);
    } else {
      await sendMessage(chatId, "برای شروع مجدد /start بزن.");
    }
    return;
  }

  // ---------- message ----------
  if (update.message) {
    const msg = update.message;
    const chatId = msg.chat.id;
    const text = msg.text?.trim() || "";
    const session = getSession(chatId);

    if (text === "/start" || text.startsWith("/start ")) {
      resetSession(chatId);
      await sendNeedQuestion(chatId);
      return;
    }

    if (text === "/cancel") {
      resetSession(chatId);
      await sendMessage(chatId, "❌ فرایند ثبت لغو شد. برای شروع مجدد /start بزن.");
      return;
    }

    if (session.step === "ask_name") {
      if (text.length < 2) {
        await sendMessage(chatId, "⚠️ لطفاً اسم کاملت رو بنویس (حداقل ۲ حرف).");
        return;
      }
      await sendContactQuestion(chatId, text);
      return;
    }

    if (session.step === "ask_contact") {
      await finishRegistration(chatId, text);
      return;
    }

    // وضعیت پیش‌فرض یا نامعلوم
    if (session.step === "done") {
      await sendMessage(chatId, "✅ قبلاً ثبت‌نامت کامل شده!\n\nبرای ثبت مشاوره جدید /start بزن.");
    } else {
      await sendNeedQuestion(chatId);
    }
  }
}
