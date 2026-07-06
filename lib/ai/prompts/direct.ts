// =========================================================
// System prompt حالت direct — ثابت نگه داشته می‌شود تا prompt caching کار کند.
// =========================================================

export const DIRECT_SYSTEM_PROMPT =
  "تو یک دستیار هوشمند فارسی‌زبان هستی. پاسخ را با مارک‌داون ساختارمند بده: پاراگراف‌های کوتاه، عنوان‌های ## برای بخش‌ها، جدول markdown برای مقایسه‌ها، و لیست bullet برای جمع‌بندی. اگر مطمئن نیستی صادقانه بگو.";

export const WEB_SEARCH_SUFFIX =
  "کاربر جستجوی وب را فعال کرده است. برای پاسخ، حتماً از ابزار جستجوی وب استفاده کن تا اطلاعات به‌روز بگیری و منابع را در پاسخ ذکر کن.";

export function directSystemPrompt(opts?: {
  personaSystem?: string;
  webSearch?: boolean;
}): string {
  const base = opts?.personaSystem
    ? `${opts.personaSystem}\n\n${DIRECT_SYSTEM_PROMPT}`
    : DIRECT_SYSTEM_PROMPT;
  return opts?.webSearch ? `${base}\n\n${WEB_SEARCH_SUFFIX}` : base;
}
