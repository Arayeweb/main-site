// =========================================================
// SSE event contract — یک stream برای هر run
// همه eventها envelope یکسان دارند: { type, runId, ... }
// =========================================================

export type RunMode = "direct" | "compare" | "council";

export type RunSSEEvent =
  | { type: "run_preparing"; runId: string }
  | { type: "run_started"; runId: string; mode: RunMode; models: string[] }
  | { type: "model_started"; runId: string; model: string; provider: string }
  | { type: "model_delta"; runId: string; model: string; text: string }
  | {
      type: "model_done";
      runId: string;
      model: string;
      inputTokens: number;
      outputTokens: number;
      ttftMs: number | null;
      latencyMs: number;
    }
  | { type: "model_error"; runId: string; model: string; errorCode: string; message: string }
  | { type: "critique_started"; runId: string }
  | { type: "critique_delta"; runId: string; text: string }
  | { type: "summary_started"; runId: string }
  | { type: "summary_delta"; runId: string; text: string }
  | { type: "usage_update"; runId: string; creditsCharged: number; creditsRemaining: number }
  | { type: "run_done"; runId: string; status: "completed" | "cancelled"; chargedCredits: number }
  | { type: "run_error"; runId: string; errorCode: string; message: string };

/** یک event را به فرمت SSE wire تبدیل می‌کند */
export function encodeSSE(event: RunSSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-store, no-cache, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
} as const;

/**
 * پیام‌های خطای فارسی — هرگز خطای خام provider به کاربر نشان داده نمی‌شود.
 */
export const FRIENDLY_ERRORS: Record<string, string> = {
  unauthorized: "برای استفاده وارد حساب خود شوید.",
  insufficient_credits: "اعتبار شما کافی نیست. لطفاً اعتبار تهیه کنید.",
  plan_upgrade_required: "این قابلیت به پلن بالاتر نیاز دارد.",
  rate_limited: "تعداد درخواست‌ها زیاد است. کمی بعد دوباره تلاش کنید.",
  network_error: "اتصال به سرویس هوش مصنوعی برقرار نشد. دوباره تلاش کنید.",
  provider_error: "پاسخ‌دهی مدل با خطا مواجه شد. دوباره تلاش کنید.",
  timeout: "پاسخ مدل بیش از حد طول کشید.",
  cancelled: "تولید پاسخ متوقف شد.",
  invalid_model: "مدل انتخاب‌شده معتبر نیست.",
  bad_request: "درخواست نامعتبر است.",
  too_many_concurrent: "تعداد درخواست‌های همزمان زیاد است. کمی بعد دوباره تلاش کنید.",
  missing_prompt: "متن سؤال خالی است.",
  server_error: "خطای داخلی سرور. دوباره تلاش کنید.",
};

export function friendlyError(code: string): string {
  return FRIENDLY_ERRORS[code] ?? FRIENDLY_ERRORS.server_error;
}
