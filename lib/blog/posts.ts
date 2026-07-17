export type BlogTopic =
  | "همه"
  | "سئو"
  | "نرخ تبدیل"
  | "چت‌بات"
  | "طراحی سایت"
  | "راهکار صنفی"
  | "جذب شاگرد";

export type BlogPost = {
  slug: string;
  href: string;
  title: string;
  description: string;
  category: string;
  topic: Exclude<BlogTopic, "همه">;
  dateLabel: string;
  readTime: string;
  coverSrc?: string;
  featured?: boolean;
  ctaLabel?: string;
};

export const blogTopics: BlogTopic[] = [
  "همه",
  "سئو",
  "نرخ تبدیل",
  "چت‌بات",
  "طراحی سایت",
  "راهکار صنفی",
  "جذب شاگرد",
];

export const blogPosts: BlogPost[] = [
  {
    slug: "seo-checklist-business-site",
    href: "/blog/seo-checklist-business-site",
    title: "چک‌لیست کامل سئوی سایت کسب‌وکار در سال ۱۴۰۵",
    description:
      "از سئوی تکنیکال و سرعت سایت تا محتوای هدفمند و لینک‌سازی داخلی؛ گام‌به‌گام بررسی می‌کنیم چطور سایت‌تان در گوگل بالا بیاید و مشتری جذب کند.",
    category: "سئو",
    topic: "سئو",
    dateLabel: "۲۵ خرداد ۱۴۰۵",
    readTime: "۱۲ دقیقه مطالعه",
    coverSrc: "/assets/blog/seo-checklist-business-site.jpg",
    featured: true,
  },
  {
    slug: "doctor-website-seo-mistakes",
    href: "/blog/doctor-website-seo-mistakes",
    title: "۷ اشتباه رایج سئو سایت پزشکان که باعث از دست رفتن بیمار می‌شود",
    description:
      "از صفحه تخصصی ضعیف تا CTA پنهان؛ اشتباهاتی که ورودی گوگل را به تماس و نوبت تبدیل نمی‌کنند.",
    category: "سئو پزشکان",
    topic: "سئو",
    dateLabel: "۱۷ تیر ۱۴۰۵",
    readTime: "۱۰ دقیقه",
    coverSrc: "/assets/blog/doctor-website-seo-mistakes.jpg",
  },
  {
    slug: "clinic-seo-checklist",
    href: "/blog/clinic-seo-checklist",
    title: "چک‌لیست سئو کلینیک؛ از سرچ گوگل تا رزرو وقت",
    description:
      "گام‌به‌گام مسیر جذب مراجعه‌کننده در کلینیک: صفحه خدمت، رزرو، اعتمادسازی و اندازه‌گیری تبدیل.",
    category: "سئو کلینیک",
    topic: "سئو",
    dateLabel: "۱۷ تیر ۱۴۰۵",
    readTime: "۹ دقیقه",
    coverSrc: "/assets/blog/clinic-seo-checklist.jpg",
  },
  {
    slug: "local-seo-for-doctors",
    href: "/blog/local-seo-for-doctors",
    title: "لوکال سئو برای پزشکان؛ چطور در جستجوهای محلی بهتر دیده شویم؟",
    description:
      "چک‌لیست عملی برای دیده‌شدن در نتایج محلی و نقشه، بدون ساخت صفحات شهر پراکنده و بی‌محتوا.",
    category: "سئوی محلی",
    topic: "سئو",
    dateLabel: "۱۷ تیر ۱۴۰۵",
    readTime: "۸ دقیقه",
    coverSrc: "/assets/blog/local-seo-for-doctors.jpg",
  },
  {
    slug: "clinic-website-features",
    href: "/blog/clinic-website-features",
    title: "سایت کلینیک باید چه امکاناتی داشته باشد؟",
    description:
      "امکانات ضروری برای تبدیل بازدید به رزرو: نوبت‌دهی، اعتمادسازی، موبایل و مسیر تماس مشخص.",
    category: "طراحی سایت",
    topic: "طراحی سایت",
    dateLabel: "۱۷ تیر ۱۴۰۵",
    readTime: "۹ دقیقه",
    coverSrc: "/assets/blog/conversion-rate.svg",
  },
  {
    slug: "jozb-shagerd-khososi",
    href: "/blog/jozb-shagerd-khososi",
    title: "چگونه برای تدریس خصوصی شاگرد جذب کنیم؟ راهنمای عملی مدرس‌ها",
    description:
      "راهنمای عملی جذب شاگرد خصوصی: انتخاب حوزه، نمونه تدریس، پلتفرم‌ها و سایت مستقل مدرس.",
    category: "جذب شاگرد",
    topic: "جذب شاگرد",
    dateLabel: "۱۵ تیر ۱۴۰۵",
    readTime: "۸ دقیقه",
  },
  {
    slug: "jozb-shagerd-zaban",
    href: "/blog/jozb-shagerd-zaban",
    title: "روش‌های جذب شاگرد خصوصی زبان؛ از نمونه تدریس تا ثبت مستقیم کلاس",
    description:
      "جذب شاگرد خصوصی زبان: انتخاب سطح، IELTS و مکالمه، نمونه درس، قیمت‌گذاری و سایت مستقل.",
    category: "جذب شاگرد",
    topic: "جذب شاگرد",
    dateLabel: "۱۵ تیر ۱۴۰۵",
    readTime: "۷ دقیقه",
  },
  {
    slug: "matn-tablig-tadris-khososi",
    href: "/blog/matn-tablig-tadris-khososi",
    title: "متن تبلیغ تدریس خصوصی؛ فرمول و نمونه برای جذب شاگرد",
    description:
      "فرمول متن تبلیغ تدریس خصوصی برای واتساپ، اینستاگرام، تلگرام و headline لندینگ.",
    category: "جذب شاگرد",
    topic: "جذب شاگرد",
    dateLabel: "۱۵ تیر ۱۴۰۵",
    readTime: "۶ دقیقه",
  },
  {
    slug: "conversion-rate-optimization",
    href: "/blog/conversion-rate-optimization",
    title: "۷ تکنیک افزایش نرخ تبدیل سایت بدون افزایش هزینه تبلیغات",
    description:
      "چطور با تغییرهای کوچک در صفحه فرود، فرم و دکمه‌های اقدام، بازدیدکننده بیشتری را به مشتری تبدیل کنید.",
    category: "نرخ تبدیل",
    topic: "نرخ تبدیل",
    dateLabel: "۱۸ خرداد ۱۴۰۵",
    readTime: "۹ دقیقه",
    coverSrc: "/assets/blog/conversion-rate.svg",
  },
  {
    slug: "website-chatbot-customer-support",
    href: "/blog/website-chatbot-customer-support",
    title: "چت‌بات هوشمند سایت؛ چطور فروش و رضایت مشتری را همزمان بالا می‌برد",
    description:
      "راهنمای کاربردی راه‌اندازی چت‌بات مبتنی بر دانش کسب‌وکار شما که پاسخگو است و لید جمع می‌کند.",
    category: "چت‌بات",
    topic: "چت‌بات",
    dateLabel: "۱۰ خرداد ۱۴۰۵",
    readTime: "۸ دقیقه",
    coverSrc: "/assets/blog/chatbot.svg",
  },
  {
    slug: "google-my-business-local-seo",
    href: "/blog/google-my-business-local-seo",
    title: "گوگل مای بیزنس برای کسب‌وکار محلی؛ راهنمای کامل ۱۴۰۵",
    description:
      "چطور پروفایل Google Business Profile را بهینه کنید تا در نقشه گوگل بالا بیایید و مشتری محلی بیشتری جذب کنید.",
    category: "سئوی محلی",
    topic: "سئو",
    dateLabel: "۳۱ خرداد ۱۴۰۵",
    readTime: "۱۰ دقیقه",
    coverSrc: "/assets/blog/google-my-business.svg",
  },
  {
    slug: "website-speed-core-web-vitals",
    href: "/blog/website-speed-core-web-vitals",
    title: "سرعت سایت و Core Web Vitals؛ چرا مشتری را از دست می‌دهید",
    description:
      "هر ثانیه تأخیر در بارگذاری، مشتری می‌برد. بیاموزید Core Web Vitals چیست و سایت‌تان را سریع کنید.",
    category: "سئو تکنیکال",
    topic: "سئو",
    dateLabel: "۷ تیر ۱۴۰۵",
    readTime: "۱۱ دقیقه",
    coverSrc: "/assets/blog/core-web-vitals.svg",
  },
  {
    slug: "online-booking-system-for-clinics",
    href: "/blog/online-booking-system-for-clinics",
    title: "سیستم نوبت‌دهی آنلاین برای کلینیک و مطب؛ چرا و چطور",
    description:
      "چطور نوبت‌دهی آنلاین تماس‌های تلفنی را کم، بیماران را بیشتر و رضایت‌شان را بالا می‌برد.",
    category: "راهکار صنفی",
    topic: "راهکار صنفی",
    dateLabel: "۱۴ تیر ۱۴۰۵",
    readTime: "۹ دقیقه",
    coverSrc: "/assets/blog/online-booking.svg",
  },
  {
    slug: "clinic-solution",
    href: "/doctors",
    title: "طراحی سایت کلینیک و مطب با نوبت‌دهی",
    description:
      "ببینید چطور آرایه برای پزشکان و کلینیک‌ها سایتی می‌سازد که از جستجو تا رزرو، بیمار را جلو می‌برد.",
    category: "راهکار صنفی",
    topic: "راهکار صنفی",
    dateLabel: "راهکار",
    readTime: "صفحه خدمات",
    ctaLabel: "مشاهده راهکار",
  },
];
