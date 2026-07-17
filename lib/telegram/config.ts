// =========================================================
// Telegram acquisition bot — configuration from env
// =========================================================

import { SITE_URL } from "@/lib/siteUrl";

export function getTelegramConfig() {
  const timeoutMs = Number(process.env.TELEGRAM_PROVIDER_TIMEOUT_MS || "10000");
  const normalizedTimeout =
    process.env.NODE_ENV === "test"
      ? timeoutMs
      : Math.min(Math.max(timeoutMs, 8_000), 12_000);
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || "",
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || "",
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "AraayeAIBot",
    requiredChannelId: process.env.TELEGRAM_REQUIRED_CHANNEL_ID || "",
    salesChannelId: process.env.TELEGRAM_REQUIRED_SALES_CHANNEL_ID || "",
    supportUsername: process.env.TELEGRAM_SUPPORT_USERNAME || "",
    freeDailyLimit: Number(process.env.TELEGRAM_FREE_DAILY_LIMIT || "3"),
    firstDayLimit: 5,
    maxFreeMessageChars: 2000,
    maxChatContextPairs: 2,
    freeChatMaxTokens: Number(process.env.TELEGRAM_FREE_MAX_TOKENS || "450"),
    freeChatTimeoutMs: normalizedTimeout,
    siteUrl: SITE_URL,
  };
}

export function isBotConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export function isZibalConfigured(): boolean {
  return Boolean(process.env.ZIBAL_MERCHANT);
}

export function compareWebUrl(): string {
  return `${SITE_URL}/ai/compare?utm_source=telegram_bot&utm_campaign=compare`;
}

export function councilWebUrl(): string {
  return `${SITE_URL}/ai?mode=council&utm_source=telegram_bot&utm_campaign=council`;
}

export function imageWebUrl(): string {
  return `${SITE_URL}/ai?mode=image&utm_source=telegram_bot&utm_campaign=image`;
}

export function webAppUrl(): string {
  return `${SITE_URL}/ai?utm_source=telegram_bot&utm_campaign=web`;
}
