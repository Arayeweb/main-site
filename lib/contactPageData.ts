export type ContactTopicId = "google" | "adready" | "website" | "ai" | "unsure";

export const CONTACT_TOPICS: {
  id: ContactTopicId;
  label: string;
  intent: string;
  routeTeam: string;
}[] = [
  {
    id: "google",
    label: "می‌خواهم در گوگل بهتر دیده شوم",
    intent: "google",
    routeTeam: "تیم SEO آرایه",
  },
  {
    id: "adready",
    label: "برای تبلیغاتم صفحه فروش می‌خواهم",
    intent: "adready",
    routeTeam: "AdReady",
  },
  {
    id: "website",
    label: "سایت جدید یا بازطراحی سایت می‌خواهم",
    intent: "website",
    routeTeam: "طراحی سایت آرایه",
  },
  {
    id: "ai",
    label: "درباره Araaye AI سؤال دارم",
    intent: "ai",
    routeTeam: "پشتیبانی Araaye AI",
  },
  {
    id: "unsure",
    label: "هنوز مطمئن نیستم",
    intent: "unsure",
    routeTeam: "تیم راه‌اندازی درخواست",
  },
];

export const CONTACT_ROUTING = [
  { need: "دیده‌شدن در گوگل", team: "تیم SEO آرایه" },
  { need: "صفحه مخصوص تبلیغات", team: "AdReady" },
  { need: "طراحی یا بازطراحی سایت", team: "طراحی سایت آرایه" },
  { need: "مشکل حساب یا پرداخت AI", team: "پشتیبانی Araaye AI" },
] as const;

export const CONTACT_FAQ = [
  {
    q: "برای شروع چه اطلاعاتی لازم است؟",
    a: "نام، شماره موبایل و یک توضیح کوتاه درباره کسب‌وکارتان کافی است. اگر سایت یا صفحه اینستاگرام دارید، گفتن آن کمک می‌کند؛ اجباری نیست.",
  },
  {
    q: "اگر ندانم کدام راهکار مناسب است چه کنم؟",
    a: "گزینه «هنوز مطمئن نیستم» را انتخاب کنید و چند خط درباره وضعیت فعلی بنویسید. درخواست را به بخش مناسب می‌فرستیم.",
  },
  {
    q: "هزینه پروژه چگونه مشخص می‌شود؟",
    a: "بعد از فهمیدن نیاز و دیدن وضعیت فعلی کسب‌وکار، پیشنهاد مشخص می‌دهیم. قبل از شروع، هزینه و خروجی را شفاف می‌گوییم.",
  },
  {
    q: "برای پشتیبانی Araaye AI از کجا پیام بدهم؟",
    a: "برای مشکل حساب، پرداخت یا استفاده از Araaye AI، از داخل حساب کاربری در بخش پشتیبانی (araaye.com/ai/support) تیکت ثبت کنید. این صفحه برای درخواست‌های کسب‌وکاری و پروژه است.",
  },
] as const;

export { COMPANY_LEGAL_NAME } from "@/lib/companyIdentity";
