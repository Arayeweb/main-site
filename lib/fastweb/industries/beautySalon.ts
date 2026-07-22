import type { FastWebIndustry } from "@/lib/fastweb/industrySchema";

const UPDATED = "2026-07-22";

/**
 * Beauty salon — search intent: service showcase + before/after + booking request.
 * Section order emphasizes gallery/outcomes before problems (trust-first).
 */
export const beautySalonIndustry: FastWebIndustry = {
  slug: "beauty-salon",
  name: "سالن زیبایی",
  shortName: "سالن",
  categoryKey: "beauty-salon",
  searchTerms: [
    "طراحی سایت سالن زیبایی",
    "سایت آرایشگاه",
    "سایت رزرو سالن زیبایی",
    "طراحی سایت آرایشگاه زنانه",
  ],
  searchIntent:
    "صاحب سالن می‌خواهد خدماتی مثل کوتاهی، رنگ و ناخن را نشان دهد، نمونه‌کار قبل/بعد بگذارد و درخواست رزرو بگیرد — نه فروشگاه محصول و نه تقویم چند پرسنل.",
  audience: ["سالن زیبایی", "آرایشگاه زنانه", "مرکز ناخن و میکاپ"],
  primaryGoal: "دریافت درخواست رزرو نوبت از طریق فرم یا واتساپ",
  primaryCta: "پیش‌نمایش سایت سالن زیبایی من",
  secondaryCta: "دیدن نمونه سالن",
  hero: {
    eyebrow: "سایت فوری برای سالن زیبایی",
    title: "خدمات، نمونه‌کار و درخواست رزرو — در یک صفحه",
    description:
      "مشتری قبل از رزرو می‌خواهد بداند چه خدماتی دارید، کیفیت کار چگونه است و چطور نوبت بگیرد. نسخه اول را در ۲۴ ساعت کاری می‌بینید.",
  },
  problems: [
    {
      title: "خدمات در دایرکت پراکنده است",
      description:
        "کوتاهی، رنگ، میکاپ و ناخن در استوری گم می‌شود؛ مشتری جدید نمی‌فهمد کدام خدمت را باید انتخاب کند.",
    },
    {
      title: "نمونه‌کار قبل و بعد دیده نمی‌شود",
      description:
        "بدون گالری منظم، مقایسه کیفیت با سالن‌های دیگر سخت است و اعتماد ساخته نمی‌شود.",
    },
    {
      title: "رزرو فقط در اینستاگرام گم می‌شود",
      description:
        "پیام‌های رزرو بین لایک و کامنت دفن می‌شوند؛ پاسخ دیر یعنی از دست دادن نوبت.",
    },
  ],
  outcomes: [
    {
      title: "لیست خدمات شفاف",
      description: "هر خدمت با توضیح کوتاه و بازه قیمت تقریبی در دسترس است.",
    },
    {
      title: "گالری قبل و بعد",
      description: "نمونه‌کارهای منتخب اعتماد می‌سازند قبل از اولین تماس.",
    },
    {
      title: "مسیر رزرو مشخص",
      description: "فرم درخواست نوبت و واتساپ در همان صفحه، بدون سردرگمی.",
    },
  ],
  sectionOrder: [
    "hero",
    "outcomes",
    "example",
    "requiredBlocks",
    "blueprint",
    "designDirections",
    "problems",
    "deliverables",
    "exclusions",
    "process",
    "pricing",
    "faq",
    "related",
    "finalCta",
  ],
  blueprint: ["services", "gallery", "beforeAfter", "pricing", "booking", "hours", "contact", "faq"],
  requiredBlocks: [
    {
      key: "services",
      title: "لیست خدمات",
      description: "کوتاهی، رنگ، میکاپ، ناخن و خدمات ویژه با توضیح کوتاه",
    },
    {
      key: "beforeAfter",
      title: "قبل و بعد",
      description: "نمایش تغییر واقعی روی چند کار منتخب",
    },
    {
      key: "gallery",
      title: "گالری نمونه‌کار",
      description: "فضا، تیم و کارهای اخیر سالن",
    },
    {
      key: "booking",
      title: "درخواست رزرو",
      description: "فرم با انتخاب خدمت و زمان ترجیحی",
    },
    {
      key: "hours",
      title: "ساعات و آدرس",
      description: "ساعات کاری و مسیر رسیدن به سالن",
    },
    {
      key: "contact",
      title: "تماس و واتساپ",
      description: "مسیر سریع برای رزرو فوری",
    },
  ],
  optionalBlocks: ["team", "testimonials", "pricing"],
  designDirections: [
    {
      key: "warm",
      label: "گرم و صمیمی",
      description: "رنگ‌های ملایم، تصاویر نزدیک از کار دست، حس مراقبت.",
      bestFor: "سالن‌های محلی با مشتری ثابت",
    },
    {
      key: "editorial",
      label: "نشریه‌ای و شیک",
      description: "تیپوگرافی درشت، فضای سفید، تصاویر تمام‌قاب از میکاپ و رنگ.",
      bestFor: "برندهای زیبایی با تمرکز روی تصویر",
    },
    {
      key: "modern",
      label: "مدرن و مینیمال",
      description: "خطوط تمیز، کنتراست ملایم، تمرکز روی خدمات و رزرو.",
      bestFor: "سالن‌های شهری با مشتری جوان",
    },
  ],
  imageDirection: {
    photographyStyle: "نزدیک، واقعی، تمرکز روی دست، مو و نتیجه کار",
    lighting: "نور نرم طبیعی یا رینگ‌لایت کنترل‌شده",
    composition: "قبل/بعد جفت، کلوزآپ خدمات، فضای سالن از زاویه چشم مشتری",
    colorPalette: "کرم، رزگلد ملایم، مشکی نرم — بدون نئون تبلیغاتی",
    avoid: ["استوک مدل‌های خارجی بی‌ربط", "فیلترهای اغراق‌شده", "کلاژ شلوغ اینستاگرامی"],
  },
  deliverables: [
    "صفحه خدمات با توضیح هر خدمت",
    "گالری و بخش قبل/بعد",
    "فرم درخواست رزرو",
    "آدرس، ساعات کاری و واتساپ",
    "نسخه موبایل و سئوی پایه",
    "نسخه اول در ۲۴ ساعت کاری",
  ],
  exclusions: [
    "رزرو آنلاین با تقویم لحظه‌ای چند پرسنل",
    "فروشگاه محصولات زیبایی",
    "سیستم وفاداری و امتیاز",
    "پنل مدیریت نوبت پیشرفته",
  ],
  examples: [
    {
      slug: "negah-beauty",
      conceptName: "سالن نگار",
      isConceptual: true,
      disclaimer: "نمونه طراحی فرضی است و کسب‌وکار واقعی نیست.",
      businessGoal: "نمایش خدمات رنگ و کوتاهی + دریافت درخواست رزرو از موبایل",
      visualStyle: "گرم و صمیمی با تأکید روی گالری قبل/بعد",
      whyStructure:
        "برای سالن، اعتماد از تصویر ساخته می‌شود؛ بنابراین گالری و قبل/بعد قبل از فرم رزرو آمده‌اند و ساعات کاری کنار تماس قرار گرفته است.",
      includedBlocks: ["services", "beforeAfter", "gallery", "booking", "hours", "contact"],
      desktopCaption: "نمای دسکتاپ — خدمات و گالری در یک نگاه",
      mobileCaption: "نمای موبایل — رزرو و واتساپ در دسترس فوری",
    },
  ],
  faqs: [
    {
      question: "آیا می‌توانم قیمت خدمات را در سایت بگذارم؟",
      answer:
        "بله. بازه قیمت خدمات پرتکرار را می‌توانید نمایش دهید تا مشتری قبل از تماس تصمیم بگیرد. قیمت دقیق نهایی معمولاً بعد از مشاوره حضوری اعلام می‌شود.",
    },
    {
      question: "آیا رزرو آنلاین با تقویم هم دارید؟",
      answer:
        "FastWeb فرم درخواست رزرو و واتساپ دارد. تقویم لحظه‌ای چند پرسنل خارج از این بسته است و در طراحی اختصاصی اضافه می‌شود.",
    },
    {
      question: "چند عکس نمونه‌کار می‌توانم بگذارم؟",
      answer:
        "در بسته پایه گالری محدود دارید؛ در پلاس فضای بیشتری برای قبل/بعد و گالری خدمات خواهید داشت.",
    },
    {
      question: "سایت سالن زیبایی با پیج اینستاگرام چه فرقی دارد؟",
      answer:
        "سایت یک آدرس ثابت با خدمات مرتب، نمونه‌کار و مسیر رزرو است؛ اینستاگرام برای محتوا و تعامل روزانه می‌ماند، نه جایگزین صفحه معرفی.",
    },
  ],
  relatedIndustries: ["gym", "law-firm"],
  relatedGuides: [],
  metadata: {
    title: "طراحی سایت سالن زیبایی در ۲۴ ساعت | FastWeb آرایه",
    description:
      "سایت سالن زیبایی با خدمات، گالری قبل/بعد و درخواست رزرو. نسخه اول در ۲۴ ساعت کاری، از ۴.۹ میلیون تومان.",
    h1: "طراحی سایت سالن زیبایی؛ خدمات، نمونه‌کار و درخواست رزرو",
  },
  pageTone: "warm",
  hubAnchor: "سایت فوری سالن زیبایی",
  advancedProjectRoute: "/website-design",
  updatedAt: UPDATED,
  indexable: true,
  reviewed: true,
  reviewedAt: UPDATED,
};
