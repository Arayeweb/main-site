// =========================================================
// سایت فوری آرایه (FastWeb) — 10 sellable categories on top of 5 cores
// =========================================================
//
// Architecture: "10 templates" are NOT 10 separate codebases. Each category
// below picks one of the 5 reusable Cores (FastWebCoreKey) for its overall
// layout/tone, then turns on a handful of optional blocks (FastWebSectionId)
// that make it feel purpose-built for that trade. FastWebSiteView renders
// the Core layout and conditionally renders each block — see that file.
//
//   Beauty Salon      = Service Core      + gallery + booking + portfolio
//   Gym & Fitness      = Service Core      + pricing(membership) + team(trainers) + schedule
//   Law Firm          = Professional Core + caseStudies + credentials + booking
//   ...
//
// This file is the single source of truth for category → core/blocks mapping,
// marketing copy (label/description/target market) and auto-detect keywords
// used by pickCategoryKey() so the wizard can pre-select a category from the
// customer's free-text industry/description without forcing them to know our
// internal taxonomy.

import {
  FASTWEB_CATEGORY_KEYS,
  type FastWebBrief,
  type FastWebCategoryKey,
  type FastWebCoreKey,
  type FastWebSectionId,
  type FastWebStyleId,
} from "@/lib/fastweb";

export interface FastWebCategoryMeta {
  key: FastWebCategoryKey;
  label: string;
  /** Short marketing subtitle shown on cards/landing ("برای پزشکان سایت بساز") */
  pitch: string;
  /** Longer description of who this is for. */
  description: string;
  /** Free-text examples of the target market, shown as chips. */
  targetMarket: string[];
  core: FastWebCoreKey;
  recommendedStyle: FastWebStyleId;
  defaultBrandColor: string;
  /** Blocks turned on by default for this category (hero/contact always included by FastWebSiteView). */
  defaultSections: FastWebSectionId[];
  /** Lucide icon name — resolved in UI via a local icon map, kept as string here to avoid a client import. */
  icon: string;
  /** Regex tested against brief.industry + shortDescription (case-insensitive) for auto-detection. */
  detectPattern: RegExp;
}

export const FASTWEB_CATEGORIES: FastWebCategoryMeta[] = [
  {
    key: "service-business",
    label: "کسب‌وکار خدماتی",
    pitch: "برای تعمیرات، خدمات فنی و پیمانکاری سایت بساز",
    description:
      "تعمیرات، خدمات فنی منزل، آموزشگاه‌های آزاد، مشاوران و پیمانکاران که نیاز به معرفی خدمات و دریافت درخواست دارند.",
    targetMarket: ["تعمیرگاه", "خدمات منزل", "آموزشگاه آزاد", "مشاور", "پیمانکار"],
    core: "service",
    recommendedStyle: "modern",
    defaultBrandColor: "#0F4C5C",
    defaultSections: ["services", "about", "testimonials", "faq", "booking"],
    icon: "Wrench",
    detectPattern:
      /تعمیر|خدمات فنی|نصب|تاسیسات|پیمانکار|برق‌کار|لوله‌کش|نقاش|خدماتی|service/i,
  },
  {
    key: "professional",
    label: "خدمات حرفه‌ای و فریلنسری",
    pitch: "برای پزشکان، مشاوران و فریلنسرها سایت بساز",
    description:
      "پزشکان، روانشناسان، مربیان و فریلنسرهایی که با معرفی تخصص، رزومه و مدارک اعتماد می‌سازند و درخواست مشاوره می‌گیرند.",
    targetMarket: ["پزشک", "روانشناس", "مربی", "فریلنسر", "مشاور مستقل"],
    core: "professional",
    recommendedStyle: "formal",
    defaultBrandColor: "#1E3A5F",
    defaultSections: ["about", "credentials", "services", "testimonials", "faq", "booking"],
    icon: "Stethoscope",
    detectPattern:
      /پزشک|دکتر|روانشناس|مشاور|فریلنسر|freelanc|دندان|مطب|کلینیک|درمانگر/i,
  },
  {
    key: "online-store",
    label: "فروشگاه آنلاین",
    pitch: "برای فروش محصول و صنایع دستی سایت بساز",
    description:
      "فروش محصول، پوشاک، صنایع دستی و فروش خانگی که می‌خواهند محصولات و قیمت را حرفه‌ای نمایش دهند.",
    targetMarket: ["فروش پوشاک", "صنایع دستی", "فروش خانگی", "محصولات دیجیتال"],
    core: "commerce",
    recommendedStyle: "modern",
    defaultBrandColor: "#B8542F",
    defaultSections: ["products", "pricing", "gallery", "testimonials", "faq"],
    icon: "ShoppingBag",
    detectPattern: /فروشگاه|پوشاک|صنایع دستی|فروش محصول|shop|store|محصول/i,
  },
  {
    key: "restaurant-cafe",
    label: "رستوران و کافه",
    pitch: "برای رستوران و کافه‌ات سایت بساز",
    description:
      "رستوران، کافه، فست‌فود و شیرینی‌فروشی‌هایی که منو، فضا و مسیر سفارش را باید در یک صفحه نشان دهند.",
    targetMarket: ["رستوران", "کافه", "فست‌فود", "شیرینی‌فروشی"],
    core: "local",
    recommendedStyle: "warm",
    defaultBrandColor: "#8B3A3A",
    defaultSections: ["menu", "gallery", "about", "testimonials", "faq", "booking"],
    icon: "UtensilsCrossed",
    detectPattern: /رستوران|کافه|فست‌فود|فست فود|شیرینی|کافی‌شاپ|café|restaurant|cafe/i,
  },
  {
    key: "company-b2b",
    label: "شرکت و B2B",
    pitch: "برای شرکت و کارخانه‌ات سایت بساز",
    description:
      "شرکت‌ها، تولیدکننده‌ها و کارخانه‌هایی که باید توان تولید، مشتریان و اعتبار B2B را نمایش دهند.",
    targetMarket: ["شرکت تولیدی", "کارخانه", "شرکت صنعتی", "تامین‌کننده B2B"],
    core: "company",
    recommendedStyle: "formal",
    defaultBrandColor: "#1F3B4D",
    defaultSections: ["services", "stats", "clients", "team", "about", "testimonials", "faq", "booking"],
    icon: "Building2",
    detectPattern:
      /شرکت|کارخانه|تولیدی|صنعتی|holding|هلدینگ|تامین‌کننده|b2b/i,
  },
  {
    key: "beauty-salon",
    label: "سالن زیبایی",
    pitch: "برای آرایشگاه و سالن زیبایی‌ات سایت بساز",
    description:
      "آرایشگاه، کلینیک زیبایی، ناخن، پوست و مو — با گالری نمونه‌کار و درخواست رزرو سریع.",
    targetMarket: ["آرایشگاه", "کلینیک زیبایی", "سالن ناخن", "پوست و مو"],
    core: "service",
    recommendedStyle: "warm",
    defaultBrandColor: "#A6416F",
    defaultSections: ["services", "gallery", "portfolio", "about", "testimonials", "faq", "booking"],
    icon: "Sparkles",
    detectPattern: /آرایشگاه|سالن زیبایی|زیبایی|ناخن|میکاپ|آرایش|beauty|salon/i,
  },
  {
    key: "gym-fitness",
    label: "باشگاه و ورزش",
    pitch: "برای باشگاه و برنامه تمرینی‌ات سایت بساز",
    description:
      "باشگاه، مربی ورزشی، یوگا و بدنسازی — با پلن‌های عضویت، معرفی مربیان و برنامه کلاس‌ها.",
    targetMarket: ["باشگاه بدنسازی", "مربی ورزشی", "یوگا", "پیلاتس"],
    core: "service",
    recommendedStyle: "modern",
    defaultBrandColor: "#1A5C3E",
    defaultSections: ["pricing", "team", "schedule", "gallery", "about", "testimonials", "faq", "booking"],
    icon: "Dumbbell",
    detectPattern: /باشگاه|بدنسازی|مربی ورزشی|یوگا|پیلاتس|فیتنس|crossfit|gym|fitness/i,
  },
  {
    key: "law-firm",
    label: "دفتر وکالت",
    pitch: "برای دفتر وکالتت سایت بساز",
    description:
      "وکلا و موسسات حقوقی که با حوزه‌های تخصصی، نمونه پرونده‌ها و مسیر مشاوره اعتماد می‌سازند.",
    targetMarket: ["وکیل", "موسسه حقوقی", "مشاور حقوقی"],
    core: "professional",
    recommendedStyle: "formal",
    defaultBrandColor: "#2C3E50",
    defaultSections: ["services", "caseStudies", "credentials", "about", "testimonials", "faq", "booking"],
    icon: "Scale",
    detectPattern: /وکیل|وکالت|حقوقی|دادگستری|law|lawyer|attorney/i,
  },
  {
    key: "real-estate",
    label: "املاک و ساخت‌وساز",
    pitch: "برای دفتر املاک‌ات سایت بساز",
    description:
      "املاک، مشاورین ملک و شرکت‌های ساخت‌وساز — با نمایش فایل‌های منتخب و ثبت درخواست خرید/فروش.",
    targetMarket: ["مشاور املاک", "بنگاه املاک", "شرکت ساختمانی"],
    core: "local",
    recommendedStyle: "modern",
    defaultBrandColor: "#5C4A2E",
    defaultSections: ["listings", "services", "gallery", "about", "testimonials", "faq", "booking"],
    icon: "Home",
    detectPattern: /املاک|بنگاه|مشاور املاک|ساخت‌وساز|ساختمانی|real estate|realtor/i,
  },
  {
    key: "education",
    label: "آموزشگاه",
    pitch: "برای آموزشگاهت سایت بساز",
    description:
      "آموزشگاه زبان، کنکور و دوره‌های آنلاین که باید دوره‌ها، اساتید و مسیر ثبت‌نام را نشان دهند.",
    targetMarket: ["آموزشگاه زبان", "آموزشگاه کنکور", "دوره آنلاین"],
    core: "professional",
    recommendedStyle: "modern",
    defaultBrandColor: "#2E5C6E",
    defaultSections: ["services", "team", "schedule", "about", "testimonials", "faq", "booking"],
    icon: "GraduationCap",
    detectPattern: /آموزشگاه|زبان|کنکور|دوره آنلاین|مدرسه|آکادمی|academy|course/i,
  },
];

const categoryMap = new Map(FASTWEB_CATEGORIES.map((c) => [c.key, c]));

export function getFastWebCategory(
  key: FastWebCategoryKey | string | undefined | null
): FastWebCategoryMeta | undefined {
  if (!key) return undefined;
  return categoryMap.get(key as FastWebCategoryKey);
}

export function getAllFastWebCategories(): FastWebCategoryMeta[] {
  return FASTWEB_CATEGORIES;
}

/**
 * Auto-detects a category from the customer's free-text industry/description,
 * falling back to goal-based heuristics, then a safe default. Used to
 * pre-select a category in the wizard; the customer can always override it.
 */
export function pickCategoryKey(brief: FastWebBrief): FastWebCategoryKey {
  if (brief.categoryKey && categoryMap.has(brief.categoryKey)) {
    return brief.categoryKey;
  }
  const haystack = `${brief.industry || ""} ${brief.shortDescription || ""}`.toLowerCase();
  for (const category of FASTWEB_CATEGORIES) {
    if (category.detectPattern.test(haystack)) return category.key;
  }
  const goal = brief.goal;
  if (goal === "products") return "online-store";
  if (goal === "portfolio" || goal === "expertise") return "professional";
  return "service-business";
}

export function pickCoreKey(brief: FastWebBrief): FastWebCoreKey {
  const category = getFastWebCategory(pickCategoryKey(brief));
  return category?.core || "service";
}

export function defaultSectionsForCategory(
  categoryKey: FastWebCategoryKey
): FastWebSectionId[] {
  const category = getFastWebCategory(categoryKey);
  const base = category?.defaultSections || [];
  const out: FastWebSectionId[] = ["hero", ...base];
  if (!out.includes("contact")) out.push("contact");
  return out;
}

export const FASTWEB_CATEGORY_COUNT = FASTWEB_CATEGORY_KEYS.length;
