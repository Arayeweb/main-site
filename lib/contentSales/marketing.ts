/** پیام‌ها و کپی‌های عملیاتی لانچ — تم سفید / سرمه‌ای */

export const CHECKOUT_PAGE_COPY = {
  title: "تکمیل خرید",
  subtitle: "Content & Sales Bundle · پرداخت امن · فعال‌سازی فوری پس از پرداخت",
  fields: {
    name: "نام و نام خانوادگی",
    phone: "شماره موبایل",
    email: "ایمیل (اختیاری)",
  },
  button: "پرداخت و دریافت دسترسی",
  note: "با ادامه، شرایط استفاده و سیاست بازگشت وجه را می‌پذیرید.",
};

export const POST_PURCHASE_MESSAGE = `پرداخت با موفقیت انجام شد.

سلام {نام}،

دسترسی شما فعال است:
— داشبورد پکیج: {لینک_داشبورد}
— پنل هوش مصنوعی: araaye.com/ai
{رمز_اگر_جدید}

شروع سریع (۱۰ دقیقه):
۱. آموزش «اولین خروجی» را ببینید
۲. یک سناریوی ریلز انتخاب کنید
۳. در AI شخصی‌سازی کنید
۴. امشب منتشر کنید

سؤال دارید؟ واتساپ: ۰۹۹۹۱۳۰۰۷۸۸`;

export const FREE_CREDITS_UPSELL = `۵ پرسش رایگان شما تمام شد.

برای چت عمومی → اشتراک AI از ۷۹ هزار تومان
برای خروجی آماده محتوا و فروش → Content & Sales Bundle:

• ۱ ماه اکانت AI
• ۳۰ ریلز + ۳۰ کپشن + ۲۰ دایرکت + کمپین‌های آماده

قیمت لانچ: ۵۹۰ هزار تومان
→ /ai/content-sales`;

export const LAUNCH_REELS_MARKETING = [
  { hook: "فقط با AI چت نکن", cta: "/ai/content-sales" },
  { hook: "۳۰ ریلز آماده — فقط ضبط کن", cta: "/ai/content-sales" },
  { hook: "دایرکت فروش بدون قفل", cta: "/ai/content-sales" },
  { hook: "ChatGPT عمومی ≠ فروش اینستا", cta: "/ai/content-sales" },
  { hook: "۵۹۰k لانچ — یک ماه AI هم هست", cta: "/ai/content-sales" },
  { hook: "کمپین ۷ روزه نوشته شده", cta: "/ai/content-sales" },
  { hook: "خروجی آماده، نه پرامپت خام", cta: "/ai/content-sales" },
  { hook: "اولین کپشن — ۱۰ دقیقه", cta: "/ai/content-sales" },
  { hook: "برای پیج فروش، نه دانشجو", cta: "/ai/content-sales" },
  { hook: "VPN نمی‌خوام — Araaye AI", cta: "/ai/content-sales" },
] as const;

export const LAUNCH_STORIES: { day: number; text: string; goal: string; cta: string }[] = [
  { day: 1, text: "می‌خوای با AI محتوا بسازی یا فقط چت کنی؟", goal: "آگاهی", cta: "نظرسنجی استوری" },
  { day: 1, text: "مشکل: خروجی AI خام = نتیجه ضعیف", goal: "درد", cta: "اسکرین نمونه" },
  { day: 1, text: "فردا راه‌حل رو می‌گم", goal: "تعلیق", cta: "فالو" },
  { day: 2, text: "Content & Sales Bundle = اکانت + قالب آماده", goal: "معرفی", cta: "لینک" },
  { day: 2, text: "۳۰ ریلز · ۳۰ کپشن · ۲۰ دایرکت", goal: "ارزش", cta: "DM «لیست»" },
  { day: 2, text: "برای پیج فروش — نه استفاده عمومی", goal: "فیلتر ICP", cta: "ذخیره" },
  { day: 3, text: "نمونه قبل/بعد — همینجا", goal: "اثبات", cta: "اسکرین" },
  { day: 3, text: "سیستم: جواب → نقد → خروجی نهایی", goal: "مکانیزم", cta: "ریلز" },
  { day: 3, text: "سؤال داری؟ DM بازه", goal: "تعامل", cta: "DM" },
  { day: 4, text: "۵۹۰ هزار لانچ (شامل ۱ ماه AI)", goal: "قیمت", cta: "لینک" },
  { day: 4, text: "ماه بعد اکانت: ۲۹۰ هزار (اختیاری)", goal: "شفافیت", cta: "FAQ" },
  { day: 4, text: "ChatGPT رایگانه — این فرقشه: {یک_خط}", goal: "اعتراض", cta: "ریلز FAQ" },
  { day: 5, text: "۷ روزه چی می‌سازی؟ ریلز + کپشن + کمپین", goal: "خروجی", cta: "چک‌لیست" },
  { day: 5, text: "مشتری X: «دیگه از صفر نمی‌نویسم»", goal: "اجتماعی", cta: "DM" },
  { day: 5, text: "فقط {N} نفر لانچ — واقعی باشه", goal: "فوریت", cta: "لینک" },
  { day: 6, text: "گرونه؟ = {مقایسه_زمان}", goal: "قیمت", cta: "DM" },
  { day: 6, text: "بعداً؟ لانچ تموم می‌شه", goal: "فوریت", cta: "یادآوری" },
  { day: 6, text: "۳ سؤال قبل خرید — FAQ", goal: "اعتماد", cta: "هایلایت FAQ" },
  { day: 7, text: "آخرین روز لانچ ۵۹۰k", goal: "بستن", cta: "لینک پرداخت" },
  { day: 7, text: "فردا قیمت بالاتر", goal: "ددلاین", cta: "الان" },
  { day: 7, text: "سؤال آخر؟ واتساپ", goal: "پشتیبانی", cta: "واتساپ" },
];

export const LAUNCH_7DAY_PLAN = [
  { day: 1, product: "قالب‌ها + داشبورد", site: "لندینگ live", content: "۳ استوری آگاهی", sales: "DM گرم‌ها", metric: "بازدید لندینگ" },
  { day: 2, product: "تست خرید end-to-end", site: "GTM events", content: "ریلز معرفی + ۳ استوری", sales: "پاسخ DM <2h", metric: "lead count" },
  { day: 3, product: "نمونه before/after", site: "بخش proof", content: "ریلز نمونه + استوری", sales: "فالوآپ لید دیروز", metric: "scroll pricing %" },
  { day: 4, product: "—", site: "—", content: "ریلز قیمت + FAQ استوری", sales: "اعتراض قیمت", metric: "checkout start" },
  { day: 5, product: "—", site: "sticky CTA", content: "ریلز خروجی ۷ روز", sales: "واتساپ consult", metric: "checkout/start ratio" },
  { day: 6, product: "—", site: "—", content: "استوری فوریت", sales: "DM بستن", metric: "paid count" },
  { day: 7, product: "—", site: "—", content: "ریلز آخر + ۳ استوری", sales: "آخرین push", metric: "total sales vs هدف" },
];

export const DECISION_METRICS = {
  zeroSales: "پیام/آفر را عوض کن — ICP یا قیمت یا proof. ۵ مصاحبه با لید سرد.",
  lowSales: "CTR خوب، CVR بد → لندینگ و checkout. CVR خوب، ترافیک کم → محتوا/ads.",
  highTrialLowBuy: "upsell زودتر + nurture ۳ روز + نمونه خروجی در اپ.",
  highDmLowPay: "اعتراض قیمت/اعتماد — FAQ واتساپ + testimonial + پرداخت اقساط؟",
  goodSales: "scale محتوا، affiliate، قیمت را بعد از ۵۰ فروش بازبینی کن.",
};
