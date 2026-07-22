import type { FastWebIndustry } from "@/lib/fastweb/industrySchema";

const UPDATED = "2026-07-22";

/**
 * Gym — search intent: trial session + membership framing + schedule/coaches.
 * Section order leads with problems → trial CTA energy → schedule/blueprint.
 */
export const gymIndustry: FastWebIndustry = {
  slug: "gym",
  name: "باشگاه ورزشی",
  shortName: "باشگاه",
  categoryKey: "gym-fitness",
  searchTerms: [
    "طراحی سایت باشگاه بدنسازی",
    "سایت باشگاه ورزشی",
    "سایت رزرو جلسه آزمایشی باشگاه",
    "طراحی سایت باشگاه تناسب اندام",
  ],
  searchIntent:
    "مدیر باشگاه می‌خواهد برنامه کلاس‌ها، مربیان و مسیر ثبت‌نام جلسه آزمایشی را نشان دهد تا بازدیدکننده همان‌روز اقدام کند — نه فروشگاه مکمل و نه اپلیکیشن عضویت.",
  audience: ["باشگاه بدنسازی", "باشگاه تناسب اندام", "استودیو گروهی کوچک"],
  primaryGoal: "رزرو جلسه آزمایشی یا درخواست عضویت",
  primaryCta: "شروع سایت باشگاه من",
  secondaryCta: "دیدن نمونه باشگاه",
  hero: {
    eyebrow: "سایت فوری برای باشگاه",
    title: "جلسه آزمایشی، برنامه کلاس‌ها و مربیان — شفاف",
    description:
      "مراجعه‌کننده می‌خواهد بداند چه کلاس‌هایی دارید، کی شروع می‌شود و چطور جلسه اول را رزرو کند. نسخه اول را قبل از پرداخت می‌بینید.",
  },
  problems: [
    {
      title: "برنامه کلاس‌ها فقط در استوری است",
      description:
        "ساعت کلاس‌ها مدام عوض می‌شود و در هایلایت گم می‌ماند؛ مشتری جدید سردرگم می‌شود.",
    },
    {
      title: "مربیان معرفی نشده‌اند",
      description:
        "بدون معرفی کوتاه مربی و تخصص، تصمیم عضویت عقب می‌افتد.",
    },
    {
      title: "مسیر جلسه آزمایشی مبهم است",
      description:
        "اگر دکمه «جلسه اول» واضح نباشد، پیام‌ها در واتساپ تمام می‌شوند و نرخ تبدیل پایین می‌آید.",
    },
  ],
  outcomes: [
    {
      title: "فراخوان جلسه آزمایشی",
      description: "یک CTA مشخص برای رزرو اولین حضور در باشگاه.",
    },
    {
      title: "جدول کلاس‌ها",
      description: "روز و ساعت کلاس‌های پرتقاضا در یک نگاه.",
    },
    {
      title: "معرفی مربیان",
      description: "چهره، تخصص و مسیر ارتباط با تیم مربیگری.",
    },
  ],
  sectionOrder: [
    "hero",
    "problems",
    "outcomes",
    "blueprint",
    "requiredBlocks",
    "example",
    "designDirections",
    "deliverables",
    "exclusions",
    "pricing",
    "process",
    "faq",
    "related",
    "finalCta",
  ],
  blueprint: ["services", "schedule", "team", "transformations", "pricing", "booking", "contact", "faq"],
  requiredBlocks: [
    {
      key: "booking",
      title: "رزرو جلسه آزمایشی",
      description: "فرم کوتاه برای اولین حضور یا تماس با پذیرش",
    },
    {
      key: "schedule",
      title: "برنامه کلاس‌ها",
      description: "روز، ساعت و نوع کلاس‌های اصلی",
    },
    {
      key: "team",
      title: "مربیان",
      description: "معرفی کوتاه مربیان و حوزه‌های تخصص",
    },
    {
      key: "transformations",
      title: "نتایج اعضا",
      description: "نمونه‌های واقعی تغییر بدن یا سطح آمادگی (با رضایت)",
    },
    {
      key: "pricing",
      title: "پلن عضویت",
      description: "بازه قیمت پلن‌های ماهانه یا جلسه‌ای",
    },
    {
      key: "contact",
      title: "تماس و آدرس",
      description: "شماره پذیرش، واتساپ و موقعیت باشگاه",
    },
  ],
  optionalBlocks: ["gallery", "testimonials", "hours"],
  designDirections: [
    {
      key: "bold",
      label: "پرانرژی و پررنگ",
      description: "کنتراست بالا، تیترهای کوتاه، تأکید روی جلسه آزمایشی.",
      bestFor: "باشگاه‌های بدنسازی و کراس‌فیت",
    },
    {
      key: "modern",
      label: "مدرن و ورزشی",
      description: "فضای تمیز، عکس حرکت، جدول کلاس خوانا.",
      bestFor: "استودیوهای تناسب اندام شهری",
    },
    {
      key: "formal",
      label: "حرفه‌ای و آرام",
      description: "مناسب باشگاه‌هایی با تمرکز روی مربیگری خصوصی.",
      bestFor: "باشگاه‌های کوچک و مربی‌محور",
    },
  ],
  imageDirection: {
    photographyStyle: "حرکت واقعی اعضا، نه ژست تبلیغاتی اغراق‌شده",
    lighting: "نور سالن با کنتراست متوسط؛ اجتناب از تاریکی کامل",
    composition: "جدول کلاس در فوکوس، پرتره مربی، قبل/بعد با کادر ثابت",
    colorPalette: "زغال، سفید، یک رنگ انرژی (سبز یا قرمز کنترل‌شده)",
    avoid: ["عکس بدن‌های غیرواقعی استوک", "متون روی تصویر شلوغ", "لوگوهای اسپانسری زیاد"],
  },
  deliverables: [
    "صفحه معرفی باشگاه و پلن‌ها",
    "جدول کلاس‌ها و معرفی مربیان",
    "فرم رزرو جلسه آزمایشی",
    "بخش نتایج اعضا (در صورت ارائه محتوا)",
    "تماس، آدرس و نسخه موبایل",
    "نسخه اول در ۲۴ ساعت کاری",
  ],
  exclusions: [
    "اپلیکیشن عضویت و حضور و غیاب",
    "درگاه فروش مکمل و پوشاک",
    "رزرو کلاس با ظرفیت لحظه‌ای چند شعبه",
    "پنل مربی و برنامه تمرینی آنلاین",
  ],
  examples: [
    {
      slug: "pulse-gym",
      conceptName: "باشگاه پالس",
      isConceptual: true,
      disclaimer: "نمونه طراحی فرضی است و باشگاه واقعی نیست.",
      businessGoal: "افزایش رزرو جلسه آزمایشی از موبایل در همان روز بازدید",
      visualStyle: "پرانرژی با جدول کلاس و CTA جلسه اول در هیرو",
      whyStructure:
        "برای باشگاه، تصمیم سریع است؛ بنابراین فراخوان جلسه آزمایشی و برنامه کلاس زودتر از گالری تزئینی می‌آیند و مربیان اعتماد را تکمیل می‌کنند.",
      includedBlocks: ["booking", "schedule", "team", "pricing", "transformations", "contact"],
      desktopCaption: "نمای دسکتاپ — هیرو با فراخوان جلسه آزمایشی",
      mobileCaption: "نمای موبایل — جدول کلاس و دکمه رزرو چسبان",
    },
  ],
  faqs: [
    {
      question: "آیا می‌توانم پلن عضویت را در سایت بنویسم؟",
      answer:
        "بله. بازه قیمت پلن‌های اصلی را می‌توانید نمایش دهید. جزئیات تخفیف یا پلن سفارشی معمولاً در پذیرش نهایی می‌شود.",
    },
    {
      question: "جدول کلاس‌ها را خودمان به‌روز می‌کنیم؟",
      answer:
        "در نسخه اول، جدول را بر اساس اطلاعات شما می‌چینیم. به‌روزرسانی‌های پرتکرار هفتگی می‌تواند بعداً با طراحی اختصاصی یا پنل ساده اضافه شود.",
    },
    {
      question: "آیا اپلیکیشن باشگاه هم شامل است؟",
      answer:
        "خیر. FastWeb یک سایت معرفی و جذب جلسه آزمایشی است؛ اپ عضویت و حضور و غیاب خارج از محدوده این بسته است.",
    },
    {
      question: "عکس قبل و بعد اعضا مشکلی ندارد؟",
      answer:
        "فقط با رضایت کتبی عضو و بدون افشای اطلاعات پزشکی. اگر محتوا آماده نباشد، همان بخش را با توضیحات خدمات جایگزین می‌کنیم.",
    },
  ],
  relatedIndustries: ["beauty-salon", "law-firm"],
  relatedGuides: [],
  metadata: {
    title: "طراحی سایت باشگاه ورزشی و بدنسازی | FastWeb آرایه",
    description:
      "سایت باشگاه با جلسه آزمایشی، جدول کلاس و معرفی مربیان. نسخه اول در ۲۴ ساعت کاری، از ۴.۹ میلیون تومان.",
    h1: "طراحی سایت باشگاه؛ جلسه آزمایشی، کلاس‌ها و مربیان",
  },
  pageTone: "energetic",
  hubAnchor: "طراحی سایت باشگاه ورزشی",
  advancedProjectRoute: "/website-design",
  updatedAt: UPDATED,
  indexable: true,
  reviewed: true,
  reviewedAt: UPDATED,
};
