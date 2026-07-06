// =========================================================
// Telegram acquisition bot — configuration from env
// =========================================================

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.araaye.com";

export function getTelegramConfig() {
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
    maxChatContextPairs: 6,
    freeChatMaxTokens: 400,
    freeChatTimeoutMs: 30_000,
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
  return `${SITE_URL}/ai?mode=compare&utm_source=telegram_bot&utm_campaign=compare`;
}

export function councilWebUrl(): string {
  return `${SITE_URL}/ai?mode=council&utm_source=telegram_bot&utm_campaign=council`;
}

export function webAppUrl(): string {
  return `${SITE_URL}/ai?utm_source=telegram_bot&utm_campaign=web`;
}
