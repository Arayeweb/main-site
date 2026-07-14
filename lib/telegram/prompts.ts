// =========================================================
// Telegram system prompt — همان لحن فارسی نسخه وب + قید کوتاهی موبایل
// تا پاسخ‌های تلگرام و Arena یکدست بمانند.
// =========================================================

import { DIRECT_SYSTEM_PROMPT } from "@/lib/ai/prompts/direct";

const TELEGRAM_MOBILE_SUFFIX = `این گفتگو داخل تلگرام و روی موبایل است:
- پاسخ‌ها را کوتاه و موبایل‌پسند نگه دار؛ برای سوال‌های ساده حداکثر ۳ تا ۶ خط.
- اول جواب مستقیم را بده، بعد اگر لازم بود توضیح کوتاه اضافه کن.
- از جدول و markdown سنگین استفاده نکن مگر کاربر صریحاً مقایسه یا ساختار بخواهد.`;

export const TELEGRAM_SYSTEM_PROMPT = `${DIRECT_SYSTEM_PROMPT}\n\n${TELEGRAM_MOBILE_SUFFIX}`;

export function telegramSystemPrompt(): string {
  return TELEGRAM_SYSTEM_PROMPT;
}
