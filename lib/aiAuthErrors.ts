export const AI_AUTH_ERRORS: Record<string, string> = {
  phone_taken: "این شماره قبلاً ثبت‌نام کرده — وارد شو.",
  phone_not_found: "این شماره ثبت‌نام نکرده — اول ثبت‌نام کن.",
  invalid_credentials: "شماره یا رمز اشتباه است.",
  invalid_phone: "شماره موبایل معتبر نیست.",
  password_too_short: "رمز باید حداقل ۶ کاراکتر باشد.",
  rate_limited: "تلاش زیاد؛ یک دقیقه بعد دوباره امتحان کن.",
  missing_fields: "شماره و رمز را وارد کن.",
  missing_phone: "شماره موبایل را وارد کن.",
  missing_otp: "کد تأیید را وارد کن.",
  invalid_otp: "کد تأیید اشتباه است.",
  otp_expired: "کد منقضی شده؛ دوباره درخواست بده.",
  otp_not_found: "اول کد تأیید را درخواست کن.",
  otp_locked: "تلاش زیاد برای این کد؛ کد جدید بخواه.",
  otp_cooldown: "کمی صبر کن و دوباره کد بخواه.",
  otp_send_limit: "حد ارسال کد برای این شماره پر شده؛ بعداً تلاش کن.",
  sms_send_failed: "ارسال پیامک ناموفق بود. دوباره تلاش کن.",
  sms_credit_low: "ارسال پیامک موقتاً در دسترس نیست.",
  otp_template_missing: "قالب پیامک تأیید تنظیم نشده است.",
  otp_template_invalid: "قالب پیامک تأیید نامعتبر است.",
  kavenegar_not_configured: "سرویس پیامک تنظیم نشده است.",
  kavenegar_network: "ارتباط با سرویس پیامک برقرار نشد.",
  kavenegar_auth: "تنظیمات سرویس پیامک نامعتبر است.",
  kavenegar_plan_required: "سرویس پیشرفته پیامک فعال نیست.",
  default: "خطایی پیش آمد. دوباره تلاش کن.",
};

export function aiAuthErrorMessage(code: string | undefined): string {
  if (!code) return AI_AUTH_ERRORS.default;
  return AI_AUTH_ERRORS[code] ?? AI_AUTH_ERRORS.default;
}
