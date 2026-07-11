import { SITE_URL } from "@/lib/siteUrl";

/** Local showcase image paths — replace files in /public/showcase-assets/ when needed. */
export const shivaImages = {
  hero: "/showcase-assets/shiva/hero.jpg",
  heroAlt: "فضای آرام کلینیک شنوایی با نور طبیعی",
  clinicInterior: "/showcase-assets/shiva/interior.jpg",
  clinicInteriorAlt: "اتاق مشاوره آرام در کلینیک",
} as const;

export const shivaContact = {
  phone: "۰۲۱-۰۰۰۰۰۰۰۰",
  phoneTel: "tel:+982100000000",
  whatsapp: "https://wa.me/989000000000",
  address: "[آدرس کلینیک — پس از تأیید نهایی جایگزین می‌شود]",
  hours: "شنبه تا چهارشنبه ۹ تا ۱۸ · پنج‌شنبه ۹ تا ۱۴",
} as const;

export const shivaNav = [
  { label: "صفحه اصلی", href: "#top" },
  { label: "خدمات", href: "#services" },
  { label: "سمعک", href: "#hearing-aids" },
  { label: "درباره ما", href: "#about" },
  { label: "پرسش‌های متداول", href: "#faq" },
  { label: "تماس و نوبت", href: "#contact" },
] as const;

export const shivaServices = [
  {
    id: "adult",
    title: "ارزیابی شنوایی بزرگسالان",
    description: "بررسی دقیق وضعیت شنوایی و توضیح نتایج به زبان ساده.",
    icon: "◉",
  },
  {
    id: "child",
    title: "شنوایی‌سنجی کودکان",
    description: "ارزیابی متناسب با سن کودک در فضایی آرام و قابل‌درک برای خانواده.",
    icon: "◎",
  },
  {
    id: "aid",
    title: "مشاوره و تجویز سمعک",
    description: "انتخاب گزینه مناسب با توجه به سبک زندگی و نیازهای روزمره.",
    icon: "◈",
  },
  {
    id: "tuning",
    title: "تنظیم و سرویس سمعک",
    description: "تنظیم فنی، آموزش استفاده و پیگیری دوره‌ای دستگاه.",
    icon: "◇",
  },
  {
    id: "tinnitus",
    title: "بررسی وزوز گوش",
    description: "ارزیابی اولیه و معرفی مسیرهای ممکن برای مدیریت وزوز.",
    icon: "◐",
  },
  {
    id: "mold",
    title: "قالب‌گیری گوش",
    description: "قالب‌گیری دقیق برای سمعک یا محافظ گوش با راحتی بیشتر.",
    icon: "◑",
  },
] as const;

export const shivaConcerns = [
  "صدای تلویزیون را بیشتر از دیگران بالا می‌برید",
  "در محیط‌های شلوغ مکالمه را سخت متوجه می‌شوید",
  "از اطرافیان می‌خواهید صحبتشان را تکرار کنند",
  "در گوش خود صدای زنگ یا وزوز احساس می‌کنید",
  "درباره شنوایی کودک خود نگرانی دارید",
] as const;

export const shivaAidSteps = [
  { title: "ارزیابی شنوایی", text: "آزمون و بررسی دقیق وضعیت شنوایی" },
  { title: "مشاوره و انتخاب", text: "بررسی نیازها و معرفی گزینه‌های مناسب" },
  { title: "تنظیم و پیگیری", text: "تنظیم دستگاه و ویزیت‌های پیگیری" },
] as const;

export const shivaProcessSteps = [
  "ثبت درخواست مشاوره",
  "تماس برای هماهنگی زمان",
  "مراجعه و ارزیابی شنوایی",
  "دریافت پیشنهاد متناسب با شرایط شما",
] as const;

export const shivaFaq = [
  {
    q: "ارزیابی شنوایی چقدر زمان می‌برد؟",
    a: "معمولاً بین ۳۰ تا ۶۰ دقیقه، بسته به نوع آزمون و شرایط شما. زمان دقیق در هماهنگی اولیه گفته می‌شود.",
  },
  {
    q: "برای تست شنوایی نیاز به آمادگی خاصی وجود دارد؟",
    a: "بهتر است گوش‌ها تمیز باشند و در صورت امکان نتایج قبلی را همراه داشته باشید. آمادگی خاص دیگری لازم نیست.",
  },
  {
    q: "آیا برای کودکان هم ارزیابی انجام می‌شود؟",
    a: "بله. ارزیابی کودکان با روش‌های متناسب سن انجام می‌شود و والدین در تمام مراحل همراه کودک هستند.",
  },
  {
    q: "انتخاب سمعک بر چه اساسی انجام می‌شود؟",
    a: "بر اساس نتایج ارزیابی، سبک زندگی، محیط کار و توانایی استفاده روزمره؛ نه صرفاً ظاهر یا قیمت دستگاه.",
  },
  {
    q: "آیا امکان تنظیم مجدد سمعک وجود دارد؟",
    a: "بله. پس از تنظیم اولیه، در ویزیت‌های پیگیری می‌توان تنظیمات را اصلاح کرد.",
  },
  {
    q: "برای وزوز گوش چه خدماتی ارائه می‌شود؟",
    a: "ارزیابی اولیه، بررسی عوامل مؤثر و معرفی راهکارهای ممکن برای مدیریت وزوز؛ بدون وعده درمان قطعی.",
  },
] as const;

export const shivaRequestTypes = [
  "ارزیابی شنوایی",
  "مشاوره سمعک",
  "شنوایی کودک",
  "وزوز گوش",
  "سرویس و تنظیم سمعک",
] as const;

export const shivaAgeGroups = ["بزرگسال", "کودک", "سالمند", "نامشخص"] as const;

export const shivaJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalClinic",
  name: "کلینیک شنوایی شیوا",
  description:
    "مرکز ارزیابی شنوایی، تجویز سمعک و خدمات شنوایی‌شناسی — نمونه مفهومی طراحی شده توسط آرایه.",
  url: `${SITE_URL}/showcase/shiva-hearing`,
  medicalSpecialty: "Audiology",
  availableService: shivaServices.map((s) => s.title),
};
