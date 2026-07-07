// =========================================================
// Telegram message lifecycle — loading, edit, chunking, fallback
// =========================================================

import {
  sendMessage,
  editMessageText,
  editMessageReplyMarkup,
  type InlineKeyboard,
} from "./api";

export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;
export const LOADING_MESSAGE = "⏳ دارم فکر می‌کنم...";

export function splitTelegramText(text: string, maxLen = TELEGRAM_MAX_MESSAGE_LENGTH): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [""];
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  let remaining = trimmed;

  while (remaining.length > maxLen) {
    let splitAt = remaining.lastIndexOf("\n\n", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = remaining.lastIndexOf("\n", maxLen);
    if (splitAt < maxLen * 0.5) splitAt = remaining.lastIndexOf(" ", maxLen);
    if (splitAt < maxLen * 0.3) splitAt = maxLen;

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export type TelegramApiResult = {
  ok: boolean;
  result?: { message_id?: number };
  description?: string;
};

export async function sendLoadingMessage(chatId: number): Promise<number | null> {
  const res = (await sendMessage(chatId, LOADING_MESSAGE)) as TelegramApiResult;
  return res.ok ? (res.result?.message_id ?? null) : null;
}

export async function editOrSendMessage(
  chatId: number,
  messageId: number | null | undefined,
  text: string,
  extra: { reply_markup?: InlineKeyboard } = {}
): Promise<number | null> {
  if (messageId) {
    const edited = (await editMessageText(chatId, messageId, text, extra)) as TelegramApiResult;
    if (edited.ok) return messageId;
  }
  const sent = (await sendMessage(chatId, text, extra)) as TelegramApiResult;
  return sent.ok ? (sent.result?.message_id ?? null) : null;
}

export async function deliverBotResponse(
  chatId: number,
  loadingMessageId: number | null,
  text: string,
  extra: { reply_markup?: InlineKeyboard } = {}
): Promise<void> {
  const chunks = splitTelegramText(text);
  const firstExtra = chunks.length === 1 ? extra : {};

  if (loadingMessageId) {
    const edited = (await editMessageText(
      chatId,
      loadingMessageId,
      chunks[0],
      firstExtra
    )) as TelegramApiResult;
    if (!edited.ok) {
      await sendMessage(chatId, chunks[0], firstExtra);
    }
  } else {
    await sendMessage(chatId, chunks[0], firstExtra);
  }

  for (let i = 1; i < chunks.length; i++) {
    const isLast = i === chunks.length - 1;
    await sendMessage(chatId, chunks[i], isLast ? extra : {});
  }
}

export async function removeInlineKeyboard(
  chatId: number,
  messageId: number | null | undefined
): Promise<void> {
  if (!messageId) return;
  await editMessageReplyMarkup(chatId, messageId, { inline_keyboard: [] });
}
