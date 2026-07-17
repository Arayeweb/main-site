// =========================================================
// Persian UX copy — Araaye positioning (original wording)
// =========================================================

import { formatToman, TELEGRAM_PACKAGE_LIST } from "./packages";
import type { TelegramPackage } from "./packages";

export const COPY = {
  forcedJoin:
    "برای استفاده رایگان از آرایه، اول عضو کانال‌های رسمی آرایه شو و بعد روی «عضو شدم» بزن.",

  welcome: `به آرایه خوش آمدی.

اینجا می‌تونی سریع با یک مدل چت کنی.
اما فرق آرایه اینه که فقط به یک مدل محدود نیستی.

در نسخه وب می‌تونی یک سؤال را همزمان به چند مدل بدهی و جواب‌ها را کنار هم مقایسه کنی.

برای شروع، دکمه «چت سریع» را بزن و مدل را انتخاب کن.
۳ پیام اول امروز رایگان است.`,

  chatMode: "اول مدل را انتخاب کن:",

  modelRequired: "اول یک مدل انتخاب کن:",

  premiumModelNoCredits: (label: string, cost: number) =>
    `مدل «${label}» پولی است و هر پاسخ ≈ ${cost} اعتبار می‌خواهد.\n\nاعتبار کافی نداری. می‌تونی بسته بخری یا از مدل‌های رایگان استفاده کنی.`,

  freeLimitReached: `سهمیه رایگان امروزت تمام شد.

برای ادامه می‌تونی اعتبار بخری یا نسخه وب آرایه را امتحان کنی.`,

  compareCta: "می‌خوای همین سؤال را با چند مدل مقایسه کنی؟",

  aiSlow: "مشکلی پیش اومد. دوباره امتحان کن.",

  mediaUnsupported:
    "فعلاً داخل تلگرام فقط چت متنی فعال است. برای ابزارهای بیشتر وارد نسخه وب شو.",

  textTooLong: "متن خیلی طولانی است. لطفاً کوتاه‌تر بنویس یا از نسخه وب استفاده کن.",

  parallelRun: "یک پاسخ در حال آماده‌سازی است. چند لحظه صبر کن.",

  membershipRetry: "بررسی عضویت موفق نشد. دوباره «عضو شدم» را بزن.",

  notJoined: "هنوز عضو هر دو کانال نشدی. لطفاً اول عضو شو و بعد «عضو شدم» را بزن.",

  phonePrompt: `برای پرداخت ریالی و تطبیق سفارش، شماره موبایل خودت را وارد کن.

مثال:
09123456789`,

  phoneInvalid: "شماره موبایل معتبر نیست. مثال: 09123456789",

  paymentLinkError: "خطا در ساخت لینک پرداخت. چند دقیقه دیگر دوباره امتحان کن.",

  paymentSuccess: `پرداخت با موفقیت انجام شد.
اعتبار بسته به حسابت اضافه شد.

حالا می‌تونی دوباره سوالت را بفرستی.`,

  paymentFailed: `پرداخت تأیید نشد.
اگر مبلغ از حسابت کم شده، با پشتیبانی تماس بگیر.`,

  clearDone: "تاریخچه چت پاک شد. همین مدل فعاله — سوال بعدی را بفرست.",

  imageModePrompt: (cost: number) =>
    `حالت ساخت تصویر فعاله.

اولین تصویر رایگان است.
بعد از آن هر تصویر ≈ ${cost} اعتبار.

توضیح تصویر را بفرست.`,

  imageNoCredits: (cost: number) =>
    `برای ساخت تصویر حداقل ${cost} اعتبار لازم است.\n\nاعتبار کافی نداری. می‌تونی بسته بخری.`,

  imageFreeUsed: (cost: number) =>
    `تصویر رایگانت را استفاده کردی.\n\nبرای ادامه حداقل ${cost} اعتبار لازم است.`,

  imageFailed: "ساخت تصویر ناموفق بود. اعتبار برگشت داده شد. دوباره امتحان کن.",

  imageTextOnly:
    "فعلاً فقط توضیح متنی می‌پذیریم. تصویر مرجع را در نسخه وب آپلود کن.",

  imageSuccess: "تصویر ساخته شد.",

  support: (username: string, webUrl: string) =>
    username
      ? `برای پشتیبانی با @${username.replace("@", "")} در تلگرام تماس بگیر.`
      : `برای پشتیبانی به ${webUrl}/ai/support برو.`,
};

export function pricingMessage(): string {
  const lines = [
    "بسته‌های اعتبار آرایه:",
    "",
    ...TELEGRAM_PACKAGE_LIST.map((pkg) =>
      [
        `بسته ${pkg.name}`,
        `قیمت: ${formatToman(pkg.priceToman)} تومان`,
        `اعتبار: ${pkg.credits.toLocaleString("fa-IR")}`,
        "",
      ].join("\n")
    ),
  ];
  return lines.join("\n").trim();
}

export function orderConfirm(pkg: TelegramPackage, phoneMasked: string): string {
  return `تأیید خرید

بسته: ${pkg.name}
اعتبار: ${pkg.credits.toLocaleString("fa-IR")}
قیمت: ${formatToman(pkg.priceToman)} تومان

شماره موبایل:
${phoneMasked}

برای پرداخت روی دکمه زیر بزن.`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 4) + "xxxxx" + phone.slice(-2);
}
