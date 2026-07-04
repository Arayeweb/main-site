// Araaye AI Content & Sales Bundle — آفر لانچ

export const CONTENT_SALES_ID = "content_sales_bundle" as const;

export const CONTENT_SALES_LAUNCH_PRICE_TOMAN = 590_000;
export const CONTENT_SALES_RENEWAL_PRICE_TOMAN = 290_000;
export const CONTENT_SALES_LIST_PRICE_TOMAN = 890_000;

/** اعتبار یک‌ماهه داخل پکیج */
export const CONTENT_SALES_AI_GRANT = {
  grantsPlan: "pro" as const,
  credits: 180,
  months: 1,
};

export const CONTENT_SALES_ICP =
  "صاحب پیج اینستاگرام، فریلنسر، آژانس کوچک، فروشنده آنلاین، تولیدکننده محتوا";

export const CONTENT_SALES_PROMISE =
  "با Araaye AI در ۷ روز، برای پیج یا کسب‌وکارت محتوا، کپشن، دایرکت و کمپین فروش آماده کن.";

export const CONTENT_SALES_PACKAGE_ITEMS = [
  { id: "ai", title: "۱ ماه اکانت Araaye AI", desc: "۵ مدل · بدون VPN · پرداخت تومان" },
  { id: "reels", title: "۳۰ سناریوی ریلز", desc: "هوک + متن + کپشن + CTA آماده" },
  { id: "captions", title: "۳۰ کپشن قابل شخصی‌سازی", desc: "فروش · آموزش · داستان · اعتماد" },
  { id: "dm", title: "۲۰ متن دایرکت فروش", desc: "شروع · اعتراض · بستن معامله" },
  { id: "campaigns", title: "۱۰ قالب کمپین اینستاگرام", desc: "۷ روزه · لانچ · فروش · ری‌انگیج" },
  { id: "analysis", title: "۱۰ قالب تحلیل", desc: "پیج · محصول · مشتری · رقیب · دایرکت" },
  { id: "tutorials", title: "۵ آموزش کوتاه", desc: "۳–۵ دقیقه · مسیر استفاده از AI" },
  { id: "samples", title: "۵ نمونه قبل/بعد", desc: "ورودی ضعیف → نقد → خروجی بهتر" },
  { id: "templates", title: "۱۲ قالب پرامپت AI", desc: "ساختار ۵ بخشی — کپی و «استفاده در AI»" },
  { id: "system", title: "سیستم جواب → نقد → خروجی", desc: "چک‌لیست ۴ مرحله‌ای برای خروجی واقعی" },
] as const;

export const CONTENT_SALES_7DAY_OUTCOMES = [
  "لیست ایده محتوا برای ۲ هفته",
  "۳–۵ سناریوی ریلز آماده ضبط",
  "کپشن‌های فروش و آموزشی",
  "متن‌های دایرکت برای لید گرم",
  "یک کمپین ۷ روزه اینستاگرام",
  "تحلیل پیج یا محصول با AI",
] as const;

export const CONTENT_SALES_FAQ = [
  {
    q: "این فقط پرامپت پک است؟",
    a: "نه. اکانت Araaye AI + سناریو، کپشن، دایرکت و کمپین آماده داری. پرامپت‌ها داخل قالب‌ها هستند؛ تو فقط ورودی کسب‌وکارت را می‌گذاری و خروجی می‌گیری.",
  },
  {
    q: "اگر بلد نباشم با AI کار کنم چی؟",
    a: "۵ آموزش کوتاه + سیستم جواب→نقد→خروجی داری. از روز اول با یک سناریوی آماده شروع می‌کنی، نه از صفر.",
  },
  {
    q: "با ChatGPT چه فرقی دارد؟",
    a: "ChatGPT عمومی است. این پکیج برای محتوا و فروش اینستاگرام ساخته شده + اکانت Araaye AI بدون VPN و با تومان.",
  },
  {
    q: "بعد از یک ماه چه می‌شود؟",
    a: "محتوای پکیج مال توست. برای ادامه اکانت AI می‌توانی اشتراک ۲۹۰ هزار تومان ماهانه بگیری.",
  },
  {
    q: "محصول چطور تحویل داده می‌شود؟",
    a: "بعد از پرداخت: داشبورد پکیج در /ai/content-sales/app — همیشه از منوی AI با «پکیج محتوا» یا با همان حسابی که خریدی وارد می‌شوی.",
  },
  {
    q: "اگر کوکی پاک شد یا دستگاه عوض کردم؟",
    a: "با همان موبایلی که خریدی وارد Araaye AI شو — دسترسی پکیج خودکار برمی‌گردد.",
  },
  {
    q: "برای چه کسانی مناسب نیست؟",
    a: "دانشجو، برنامه‌نویس، پزشک، شرکت بزرگ، یا کسی که فقط چت عمومی AI می‌خواهد.",
  },
] as const;

export function formatToman(n: number): string {
  return n.toLocaleString("fa-IR");
}
