// برچسب‌های فارسی برای reasonهای دفتر کل اعتبار آرایه AI

const REASON_LABELS: Record<string, string> = {
  signup_bonus: "اعتبار هدیه ثبت‌نام",
  package_purchase: "خرید بسته",
  topup: "شارژ اعتبار",
  subscription_grant: "اعتبار اشتراک",
  referral_bonus: "پاداش معرفی",
  admin_grant: "افزایش توسط پشتیبانی",
  admin_revoke: "کاهش توسط پشتیبانی",
  admin_adjustment: "تعدیل پشتیبانی",
  reserve: "رزرو برای اجرا",
  charge: "مصرف اجرا",
  refund: "بازگشت اعتبار",
  image_refund: "بازگشت اعتبار تصویر",
  video_refund: "بازگشت اعتبار ویدیو",
  usage: "مصرف سرویس",
  battle: "نبرد مدل‌ها",
  image_generation: "ساخت تصویر",
  video_generation: "ساخت ویدیو",
  audio_generation: "ساخت صوت",
  music_generation: "ساخت موسیقی",
  transcription: "پیاده‌سازی صوت",
  code_studio: "استودیو کد",
  direct_chat: "چت مستقیم",
  compare: "مقایسه مدل‌ها",
  council: "شورای مدل‌ها",
  persona: "چت با شخصیت",
};

export function creditReasonLabel(reason: string | null | undefined): string {
  if (!reason) return "تراکنش";
  return REASON_LABELS[reason] || reason;
}

export function formatCreditDelta(delta: number): string {
  const abs = Math.abs(delta).toLocaleString("fa-IR");
  if (delta > 0) return `+${abs}`;
  if (delta < 0) return `−${abs}`;
  return abs;
}
