// =========================================================
// اعتبارسنجی ورودی کاربر — قبل از رسیدن به provider.
// خطاها با کد برمی‌گردند و پیام فارسی در sse.ts نگاشت می‌شود.
// =========================================================

import { MAX_PROMPT_CHARS } from "@/lib/aiCredits";

export type ModerationResult =
  | { ok: true; prompt: string }
  | { ok: false; error: "missing_prompt" | "prompt_too_long" };

/**
 * پاک‌سازی و اعتبارسنجی prompt.
 * کاراکترهای کنترلی حذف می‌شوند؛ طول به سقف محدود می‌شود.
 */
export function validatePrompt(raw: unknown): ModerationResult {
  const text = String(raw ?? "")
    // حذف کاراکترهای کنترلی به‌جز newline و tab
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  if (!text) return { ok: false, error: "missing_prompt" };
  if (text.length > MAX_PROMPT_CHARS) {
    return { ok: true, prompt: text.slice(0, MAX_PROMPT_CHARS) };
  }
  return { ok: true, prompt: text };
}

/**
 * خطای خام provider هرگز به کاربر نمی‌رسد — این تابع لاگ می‌کند
 * و کد امن برمی‌گرداند.
 */
export function sanitizeProviderError(
  errorCode: string,
  rawMessage: string,
  context: string
): string {
  const debugRaw = process.env.AI_DEBUG_PROVIDER_ERRORS === "1";
  console.error(
    `[ai/safety] provider error in ${context}: ${errorCode}${
      debugRaw ? ` — ${rawMessage.slice(0, 300)}` : ""
    }`
  );
  const safe = new Set([
    "network_error",
    "provider_error",
    "rate_limited",
    "timeout",
    "cancelled",
  ]);
  return safe.has(errorCode) ? errorCode : "provider_error";
}
