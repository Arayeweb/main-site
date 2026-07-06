#!/usr/bin/env node
/**
 * Register Telegram webhook for Araaye acquisition bot.
 * Usage: node scripts/telegram-set-webhook.mjs
 * Requires: TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, NEXT_PUBLIC_SITE_URL
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com").replace(/\/$/, "");

if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const webhookUrl = `${siteUrl}/api/telegram/webhook`;

const body = {
  url: webhookUrl,
  allowed_updates: ["message", "callback_query"],
  drop_pending_updates: true,
};
if (secret) body.secret_token = secret;

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const data = await res.json();
if (!data.ok) {
  console.error("setWebhook failed:", data);
  process.exit(1);
}

console.log("Webhook registered:", webhookUrl);
const info = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`).then((r) => r.json());
console.log("Webhook info:", JSON.stringify(info.result, null, 2));
