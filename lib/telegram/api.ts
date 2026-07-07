// =========================================================
// Telegram Bot API wrapper — server-side only
// =========================================================

import { getTelegramConfig } from "./config";

function apiBase(): string {
  const token = getTelegramConfig().botToken;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not configured");
  return `https://api.telegram.org/bot${token}`;
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function callTelegram(
  method: string,
  body: Record<string, unknown>,
  retry = true
): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  try {
    const res = await fetch(`${apiBase()}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({ ok: false }));
    if (!data.ok && retry) {
      return callTelegram(method, body, false);
    }
    return data;
  } catch (e) {
    console.error(`[telegram/api] ${method} failed:`, e instanceof Error ? e.name : "error");
    if (retry) return callTelegram(method, body, false);
    return { ok: false, description: "network_error" };
  }
}

export type InlineKeyboard = {
  inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
};

export type ReplyKeyboard = {
  keyboard: Array<Array<{ text: string; request_contact?: boolean }>>;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
};

export async function sendMessage(
  chatId: number,
  text: string,
  extra: {
    reply_markup?: InlineKeyboard | ReplyKeyboard | { remove_keyboard: true };
    disable_web_page_preview?: boolean;
  } = {}
) {
  return callTelegram("sendMessage", {
    chat_id: chatId,
    text: escapeHtml(text),
    parse_mode: "HTML",
    ...extra,
  });
}

export async function sendTypingAction(chatId: number) {
  return callTelegram("sendChatAction", {
    chat_id: chatId,
    action: "typing",
  });
}

export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
) {
  return callTelegram("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
  });
}

export type ChatMemberStatus =
  | "creator"
  | "administrator"
  | "member"
  | "restricted"
  | "left"
  | "kicked";

const JOINED_STATUSES = new Set<ChatMemberStatus>([
  "creator",
  "administrator",
  "member",
  "restricted",
]);

export async function getChatMember(
  chatId: string,
  userId: number
): Promise<{ ok: boolean; joined: boolean; error?: string }> {
  if (!chatId) return { ok: true, joined: true };
  const data = await callTelegram("getChatMember", {
    chat_id: chatId,
    user_id: userId,
  });
  if (!data.ok) {
    return { ok: false, joined: false, error: data.description };
  }
  const status = (data.result as { status?: string })?.status as ChatMemberStatus;
  return { ok: true, joined: JOINED_STATUSES.has(status) };
}

export async function setMyCommands() {
  return callTelegram("setMyCommands", {
    commands: [
      { command: "start", description: "شروع" },
      { command: "chat", description: "چت سریع" },
      { command: "compare", description: "مقایسه چند مدل" },
      { command: "council", description: "همفکری چند مدل" },
      { command: "pricing", description: "خرید اعتبار" },
      { command: "support", description: "پشتیبانی" },
      { command: "clear", description: "پاک کردن تاریخچه" },
    ],
  });
}
