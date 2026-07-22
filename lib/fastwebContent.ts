import type {
  FastWebBrief,
  FastWebCategoryKey,
  FastWebCoreKey,
  FastWebFaqItem,
  FastWebListingItem,
  FastWebOfferingItem,
  FastWebPreviewContent,
  FastWebPricingPlanItem,
  FastWebScheduleItem,
  FastWebSectionId,
  FastWebStatItem,
  FastWebStyleId,
  FastWebTeamMemberItem,
} from "@/lib/fastweb";
import {
  FASTWEB_AUDIENCE_PRESETS,
  FASTWEB_CORE_KEYS,
  FASTWEB_STYLES,
  isFastWebCategoryKey,
  suggestedSectionsForGoal,
} from "@/lib/fastweb";
import {
  defaultSectionsForCategory,
  pickCategoryKey,
  pickCoreKey,
} from "@/lib/fastwebCategories";

function asString(v: unknown, max = 500): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function asStringArray(v: unknown, maxItems = 8, maxLen = 200): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => asString(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function asOfferings(v: unknown): FastWebOfferingItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title, 80);
      const description = asString(row.description, 240);
      if (!title) return null;
      return { title, description };
    })
    .filter((x): x is FastWebOfferingItem => Boolean(x))
    .slice(0, 7);
}

function asFaq(v: unknown): FastWebFaqItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const question = asString(row.question, 160);
      const answer = asString(row.answer, 400);
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter((x): x is FastWebFaqItem => Boolean(x))
    .slice(0, 6);
}

function asTestimonials(
  v: unknown
): { name: string; text: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = asString(row.name, 60);
      const text = asString(row.text, 280);
      if (!name || !text) return null;
      return { name, text };
    })
    .filter((x): x is { name: string; text: string } => Boolean(x))
    .slice(0, 4);
}

function asPricingPlans(v: unknown): FastWebPricingPlanItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = asString(row.name, 60);
      if (!name) return null;
      return {
        name,
        price: asString(row.price, 40),
        description: asString(row.description, 160),
        features: asStringArray(row.features, 6, 100),
      };
    })
    .filter((x): x is FastWebPricingPlanItem => Boolean(x))
    .slice(0, 4);
}

function asTeamMembers(v: unknown): FastWebTeamMemberItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const name = asString(row.name, 60);
      if (!name) return null;
      return {
        name,
        role: asString(row.role, 60),
        bio: asString(row.bio, 200),
      };
    })
    .filter((x): x is FastWebTeamMemberItem => Boolean(x))
    .slice(0, 6);
}

function asListings(v: unknown): FastWebListingItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title, 80);
      if (!title) return null;
      return {
        title,
        price: asString(row.price, 40),
        meta: asString(row.meta, 100),
      };
    })
    .filter((x): x is FastWebListingItem => Boolean(x))
    .slice(0, 6);
}

function asSchedule(v: unknown): FastWebScheduleItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = asString(row.title, 80);
      if (!title) return null;
      return {
        day: asString(row.day, 40),
        time: asString(row.time, 40),
        title,
      };
    })
    .filter((x): x is FastWebScheduleItem => Boolean(x))
    .slice(0, 8);
}

function asStats(v: unknown): FastWebStatItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const value = asString(row.value, 20);
      const label = asString(row.label, 60);
      if (!value || !label) return null;
      return { value, label };
    })
    .filter((x): x is FastWebStatItem => Boolean(x))
    .slice(0, 4);
}

const ALL_SECTION_IDS = new Set<FastWebSectionId>([
  "hero",
  "services",
  "products",
  "menu",
  "pricing",
  "gallery",
  "listings",
  "portfolio",
  "caseStudies",
  "about",
  "credentials",
  "team",
  "stats",
  "clients",
  "schedule",
  "testimonials",
  "faq",
  "booking",
  "contact",
]);

function asSections(v: unknown): FastWebSectionId[] {
  if (!Array.isArray(v)) return ["hero", "about", "contact"];
  const out: FastWebSectionId[] = [];
  for (const item of v) {
    if (typeof item === "string" && ALL_SECTION_IDS.has(item as FastWebSectionId)) {
      out.push(item as FastWebSectionId);
    }
  }
  if (!out.includes("hero")) out.unshift("hero");
  if (!out.includes("contact")) out.push("contact");
  return out.slice(0, 12);
}

function asCategoryKey(v: unknown): FastWebCategoryKey {
  if (isFastWebCategoryKey(v)) return v;
  return "service-business";
}

function asCoreKey(v: unknown): FastWebCoreKey {
  if (typeof v === "string" && (FASTWEB_CORE_KEYS as readonly string[]).includes(v)) {
    return v as FastWebCoreKey;
  }
  return "service";
}

function asStyleKey(v: unknown): FastWebStyleId {
  if (
    typeof v === "string" &&
    FASTWEB_STYLES.some((s) => s.id === v)
  ) {
    return v as FastWebStyleId;
  }
  return "modern";
}

function asColor(v: unknown, fallback = "#0F4C5C"): string {
  const s = asString(v, 20);
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s;
  return fallback;
}

export function parseFastWebPreviewContent(
  raw: unknown
): { ok: true; content: FastWebPreviewContent } | { ok: false; errors: string[] } {
  if (!raw || typeof raw !== "object") {
    return { ok: false, errors: ["content_not_object"] };
  }
  const row = raw as Record<string, unknown>;
  const errors: string[] = [];
  const headline = asString(row.headline, 120);
  const subheadline = asString(row.subheadline, 220);
  if (!headline) errors.push("headline_required");
  if (!subheadline) errors.push("subheadline_required");

  const content: FastWebPreviewContent = {
    headline: headline || "کسب‌وکار شما",
    subheadline: subheadline || "معرفی خدمات و راه‌های تماس",
    aboutText: asString(row.aboutText, 600) || "تجربه، کیفیت و توجه به نیاز مشتری پایه اصلی فعالیت این مجموعه است.",
    offerings: asOfferings(row.offerings),
    portfolioNotes: asStringArray(row.portfolioNotes, 6, 160),
    testimonials: asTestimonials(row.testimonials),
    faq: asFaq(row.faq),
    ctaText: asString(row.ctaText, 60) || "درخواست مشاوره",
    formTitle: asString(row.formTitle, 80) || "فرم درخواست",
    seoTitle: asString(row.seoTitle, 70) || headline || "سایت کسب‌وکار",
    seoDescription:
      asString(row.seoDescription, 160) ||
      subheadline ||
      "سایت معرفی کسب‌وکار",
    categoryKey: asCategoryKey(row.categoryKey),
    templateKey: asCoreKey(row.templateKey),
    styleKey: asStyleKey(row.styleKey),
    brandColor: asColor(row.brandColor),
    sections: asSections(row.sections),
    pricingPlans: asPricingPlans(row.pricingPlans),
    teamMembers: asTeamMembers(row.teamMembers),
    galleryNotes: asStringArray(row.galleryNotes, 8, 120),
    listings: asListings(row.listings),
    schedule: asSchedule(row.schedule),
    stats: asStats(row.stats),
    clients: asStringArray(row.clients, 8, 60),
  };

  if (content.offerings.length === 0) {
    content.offerings = [
      { title: "خدمت اصلی", description: "توضیح کوتاه خدمت یا محصول" },
    ];
  }
  if (content.faq.length === 0) {
    content.faq = [
      {
        question: "چطور می‌توانم درخواست بدهم؟",
        answer: "از طریق فرم تماس یا واتساپ با ما در ارتباط باشید.",
      },
    ];
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, content };
}

export function hasPreviewContent(
  content: Partial<FastWebPreviewContent> | null | undefined
): boolean {
  return Boolean(content?.headline && content?.subheadline);
}

const DEFAULT_PRICING_PLANS: FastWebPricingPlanItem[] = [
  {
    name: "شروع",
    price: "استعلام قیمت",
    description: "مناسب برای نیازهای پایه و شروع سریع",
    features: ["مشاوره اولیه", "پیشنهاد متناسب با نیاز"],
  },
  {
    name: "انتخاب حرفه‌ای",
    price: "پیشنهاد اختصاصی",
    description: "برای کسانی که نتیجه کامل‌تری می‌خواهند",
    features: ["همه امکانات شروع", "پشتیبانی و همراهی بیشتر"],
  },
];

const DEFAULT_TEAM_MEMBERS: FastWebTeamMemberItem[] = [
  { name: "تیم متخصص مجموعه", role: "اجرای حرفه‌ای خدمات", bio: "با تجربه، دقیق و متعهد به ارائه بهترین نتیجه برای هر مشتری." },
];

const DEFAULT_LISTINGS: FastWebListingItem[] = [
  { title: "فایل منتخب و آماده بازدید", price: "قیمت روز", meta: "اطلاعات تأییدشده • شرایط مناسب • هماهنگی بازدید" },
];

const DEFAULT_SCHEDULE: FastWebScheduleItem[] = [
  { day: "شنبه تا چهارشنبه", time: "۹ تا ۱۸", title: "ساعات کاری" },
];

const DEFAULT_STATS: FastWebStatItem[] = [
  { value: "+۱۰۰", label: "مشتری راضی" },
  { value: "+۵", label: "سال تجربه" },
];

type DemoPreset = {
  promise: string;
  about: string;
  offeringDescriptions: string[];
  offerings: string[];
  portfolioNotes: string[];
  testimonials: { name: string; text: string }[];
  faq: FastWebFaqItem[];
  pricingPlans: FastWebPricingPlanItem[];
  teamMembers: FastWebTeamMemberItem[];
  galleryNotes: string[];
  listings: FastWebListingItem[];
  schedule: FastWebScheduleItem[];
  stats: FastWebStatItem[];
  clients: string[];
  ctaText: string;
  formTitle: string;
};

const DEMO_PRESETS: Record<FastWebCategoryKey, DemoPreset> = {
  "service-business": {
    promise: "خدمات مطمئن، اجرای دقیق و پاسخ‌گویی سریع؛ درست وقتی که به آن نیاز دارید.",
    about: "با تکیه بر تجربه اجرایی و تعهد به کیفیت، هر درخواست از بررسی اولیه تا تحویل نهایی با دقت پیگیری می‌شود.",
    offerings: ["بازدید و عیب‌یابی", "اجرا و تعمیر تخصصی", "سرویس و پشتیبانی"],
    offeringDescriptions: ["بررسی دقیق نیاز و ارائه راه‌حل شفاف پیش از شروع کار.", "اجرای اصولی توسط نیروی متخصص با تضمین کیفیت.", "پیگیری پس از انجام کار و پشتیبانی در صورت نیاز."],
    portfolioNotes: ["اجرای کامل پروژه مسکونی", "رفع ایراد و تحویل در همان روز", "سرویس دوره‌ای مجموعه اداری"],
    testimonials: [{ name: "یکی از مشتریان محلی", text: "از تماس اول تا پایان کار، همه‌چیز منظم، شفاف و حرفه‌ای پیش رفت." }],
    faq: [{ question: "هزینه خدمات چگونه مشخص می‌شود؟", answer: "پس از بررسی نیاز، هزینه و زمان اجرا شفاف اعلام می‌شود و کار فقط با تأیید شما آغاز خواهد شد." }],
    pricingPlans: [], teamMembers: [], galleryNotes: ["اجرای تمیز و اصولی", "تجهیزات حرفه‌ای", "قبل و بعد پروژه", "تیم آماده خدمت"], listings: [], schedule: [],
    stats: [{ value: "+۱۰۰", label: "درخواست انجام‌شده" }, { value: "سریع", label: "زمان پاسخ‌گویی" }], clients: [],
    ctaText: "درخواست بازدید رایگان", formTitle: "جزئیات درخواست شما",
  },
  professional: {
    promise: "ترکیبی از دانش تخصصی، تجربه و توجه انسانی برای تصمیمی مطمئن‌تر.",
    about: "هر مراجعه‌کننده شرایط منحصربه‌فردی دارد؛ به همین دلیل مسیر مشاوره و ارائه خدمات بر پایه شناخت دقیق نیازهای شما شکل می‌گیرد.",
    offerings: ["ارزیابی و مشاوره تخصصی", "خدمات و درمان اختصاصی", "پیگیری و همراهی"],
    offeringDescriptions: ["بررسی دقیق شرایط و پاسخ روشن به پرسش‌های شما.", "انتخاب بهترین مسیر متناسب با نیاز و هدف شما.", "همراهی منظم برای رسیدن به نتیجه‌ای پایدار."],
    portfolioNotes: [], testimonials: [{ name: "یکی از مراجعه‌کنندگان", text: "توضیحات بسیار شفاف بود و از همان جلسه اول احساس کردم در مسیر درستی قرار گرفته‌ام." }],
    faq: [{ question: "جلسه اول چگونه برگزار می‌شود؟", answer: "در جلسه نخست، شرایط و هدف شما بررسی می‌شود و مناسب‌ترین مسیر به‌صورت شفاف توضیح داده خواهد شد." }],
    pricingPlans: [], teamMembers: [{ name: "متخصص مجموعه", role: "مشاور ارشد", bio: "با تجربه حرفه‌ای و رویکردی دقیق و نتیجه‌محور." }],
    galleryNotes: ["فضای آرام مجموعه", "اتاق مشاوره", "تجهیزات تخصصی", "تجربه مراجعه"], listings: [], schedule: [{ day: "شنبه تا چهارشنبه", time: "۹ تا ۱۹", title: "پذیرش با تعیین وقت" }],
    stats: [{ value: "+۱۰", label: "سال تجربه تخصصی" }, { value: "+۵۰۰", label: "مراجعه موفق" }], clients: [],
    ctaText: "رزرو جلسه مشاوره", formTitle: "درخواست وقت مشاوره",
  },
  "online-store": {
    promise: "محصولاتی انتخاب‌شده برای کسانی که به کیفیت، اصالت و جزئیات اهمیت می‌دهند.",
    about: "مجموعه‌ای دقیق و باکیفیت را گردآوری کرده‌ایم تا خرید آنلاین برای شما ساده، مطمئن و لذت‌بخش باشد.",
    offerings: ["محصول منتخب", "پرفروش این هفته", "انتخاب ویژه هدیه"],
    offeringDescriptions: ["کیفیت ممتاز با جزئیاتی که از نزدیک هم چشمگیر است.", "انتخاب محبوب مشتریان با ارسال سریع.", "بسته‌بندی زیبا و مناسب برای یک هدیه ماندگار."],
    portfolioNotes: [], testimonials: [{ name: "خریدار تأییدشده", text: "کیفیت محصول دقیقاً مطابق تصاویر بود و بسته‌بندی خیلی حرفه‌ای به دستم رسید." }],
    faq: [{ question: "ارسال سفارش چقدر زمان می‌برد؟", answer: "سفارش‌ها پس از تأیید، بسته به مقصد طی ۲ تا ۴ روز کاری ارسال می‌شوند." }],
    pricingPlans: [{ name: "محصول منتخب", price: "برای قیمت تماس بگیرید", description: "کیفیت ممتاز و ضمانت اصالت", features: ["ارسال امن", "امکان تعویض", "پشتیبانی خرید"] }],
    teamMembers: [], galleryNotes: ["جزئیات محصول", "بسته‌بندی اختصاصی", "انتخاب‌های تازه", "محبوب مشتریان"], listings: [], schedule: [],
    stats: [{ value: "۱۰۰٪", label: "ضمانت اصالت" }, { value: "سریع", label: "ارسال سفارش" }], clients: [],
    ctaText: "ثبت سفارش", formTitle: "سفارش و راهنمای خرید",
  },
  "restaurant-cafe": {
    promise: "طعم‌های تازه، فضای گرم و لحظه‌هایی که دوست دارید دوباره تجربه‌شان کنید.",
    about: "اینجا هر جزئیات، از انتخاب مواد اولیه تا سرو نهایی، برای ساختن یک تجربه خوش‌طعم و به‌یادماندنی طراحی شده است.",
    offerings: ["قهوه و نوشیدنی ویژه", "صبحانه و غذای تازه", "دسر روز"],
    offeringDescriptions: ["تهیه‌شده با مواد تازه و ترکیب اختصاصی مجموعه.", "سفارش‌هایی تازه، خوش‌عطر و آماده برای یک شروع خوب.", "هر روز تازه و در تعداد محدود برای بهترین کیفیت."],
    portfolioNotes: [], testimonials: [{ name: "یکی از مهمانان", text: "هم طعم غذا عالی بود و هم فضا آن‌قدر دلنشین که حتماً دوباره برمی‌گردیم." }],
    faq: [{ question: "برای رزرو میز چه‌کار کنم؟", answer: "از فرم همین صفحه یا واتساپ، تعداد نفرات و زمان موردنظر را ارسال کنید." }],
    pricingPlans: [], teamMembers: [], galleryNotes: ["فضای گرم و صمیمی", "بشقاب‌های تازه", "قهوه تخصصی", "دسر روز"], listings: [], schedule: [{ day: "هر روز", time: "۸ تا ۲۳", title: "پذیرایی از مهمانان" }],
    stats: [{ value: "تازه", label: "مواد اولیه روز" }, { value: "هر روز", label: "آماده پذیرایی" }], clients: [],
    ctaText: "رزرو میز", formTitle: "رزرو میز و سفارش",
  },
  "company-b2b": {
    promise: "ظرفیت اجرایی قابل اتکا برای همکاری‌های بزرگ، دقیق و بلندمدت.",
    about: "با تمرکز بر کیفیت پایدار، کنترل دقیق فرایند و تعهد به زمان تحویل، شریک اجرایی قابل اعتماد کسب‌وکارها هستیم.",
    offerings: ["تولید و اجرای سفارشی", "تأمین سازمانی", "کنترل کیفیت و پشتیبانی"],
    offeringDescriptions: ["طراحی و اجرا متناسب با مشخصات فنی و نیاز پروژه.", "تأمین مستمر با ظرفیت برنامه‌ریزی‌شده و تحویل منظم.", "کنترل مرحله‌به‌مرحله و مستندسازی کیفیت خروجی."],
    portfolioNotes: ["پروژه تأمین صنعتی", "بهینه‌سازی خط تولید", "همکاری بلندمدت سازمانی"],
    testimonials: [{ name: "مدیر تأمین یکی از مشتریان", text: "ثبات کیفیت و پایبندی به برنامه تحویل، این مجموعه را به یکی از شرکای مطمئن ما تبدیل کرده است." }],
    faq: [{ question: "امکان تولید یا اجرای سفارشی وجود دارد؟", answer: "بله، پس از دریافت مشخصات فنی، امکان‌سنجی، زمان‌بندی و پیشنهاد همکاری ارائه می‌شود." }],
    pricingPlans: [], teamMembers: [{ name: "تیم مهندسی", role: "طراحی و کنترل پروژه", bio: "متخصص در اجرای پروژه‌های دقیق و مقیاس‌پذیر." }],
    galleryNotes: ["زیرساخت تولید", "کنترل کیفیت", "تیم اجرایی", "پروژه‌های انجام‌شده"], listings: [], schedule: [],
    stats: [{ value: "+۱۵", label: "سال تجربه" }, { value: "+۴۰", label: "مشتری سازمانی" }, { value: "ISO", label: "فرایند کنترل کیفیت" }], clients: ["همکار صنعتی", "تأمین‌کننده منتخب", "مشتری سازمانی"],
    ctaText: "دریافت پروپوزال همکاری", formTitle: "درخواست همکاری سازمانی",
  },
  "beauty-salon": {
    promise: "زیبایی طبیعی شما، با اجرای ظریف، مواد حرفه‌ای و تجربه‌ای کاملاً شخصی.",
    about: "پیش از هر خدمات، سلیقه و ویژگی‌های شما را می‌شناسیم تا نتیجه نهایی فقط زیبا نباشد؛ دقیقاً مناسب خود شما باشد.",
    offerings: ["رنگ و استایل مو", "خدمات تخصصی ناخن", "مراقبت پوست و زیبایی"],
    offeringDescriptions: ["انتخاب رنگ و فرم متناسب با چهره و استایل شما.", "اجرای ظریف با رعایت کامل بهداشت و ماندگاری بالا.", "پروتکل اختصاصی برای شفافیت و سلامت پوست."],
    portfolioNotes: ["تغییر استایل طبیعی و درخشان", "طراحی ظریف برای مراسم", "مراقبت حرفه‌ای و نتیجه ماندگار"],
    testimonials: [{ name: "یکی از مشتریان سالن", text: "نتیجه حتی بهتر از چیزی شد که تصور می‌کردم؛ همه‌چیز با حوصله و ظرافت انجام شد." }],
    faq: [{ question: "چطور خدمات مناسبم را انتخاب کنم؟", answer: "قبل از رزرو نهایی، مشاوره کوتاهی برای شناخت سلیقه و شرایط شما انجام می‌شود." }],
    pricingPlans: [], teamMembers: [{ name: "تیم زیبایی", role: "متخصص مو و زیبایی", bio: "آموزش‌دیده، دقیق و به‌روز با جدیدترین تکنیک‌ها." }],
    galleryNotes: ["رنگ و لایت حرفه‌ای", "طراحی ناخن", "مراقبت پوست", "فضای اختصاصی سالن"], listings: [], schedule: [{ day: "شنبه تا پنجشنبه", time: "۱۰ تا ۲۰", title: "رزرو خدمات" }],
    stats: [{ value: "+۵۰۰", label: "مشتری خوشحال" }, { value: "اورجینال", label: "مواد مصرفی" }], clients: [],
    ctaText: "رزرو نوبت زیبایی", formTitle: "نوبت اختصاصی شما",
  },
  "gym-fitness": {
    promise: "تمرین هدفمند، مربی همراه و برنامه‌ای که نتیجه‌اش را در زندگی واقعی می‌بینید.",
    about: "از ارزیابی اولیه تا برنامه تمرین و پیگیری پیشرفت، همه‌چیز متناسب با بدن، سبک زندگی و هدف واقعی شما طراحی می‌شود.",
    offerings: ["بدنسازی و تناسب اندام", "تمرین خصوصی", "کلاس‌های گروهی"],
    offeringDescriptions: ["تجهیزات کامل و برنامه تمرینی متناسب با سطح شما.", "تمرین یک‌به‌یک با تمرکز کامل روی تکنیک و نتیجه.", "انرژی گروهی بالا با مربی حرفه‌ای و ظرفیت محدود."],
    portfolioNotes: ["شروع مسیر تناسب اندام", "پیگیری تغییرات واقعی", "جامعه‌ای پرانرژی"],
    testimonials: [{ name: "یکی از ورزشکاران", text: "برای اولین بار برنامه‌ای داشتم که واقعاً با شرایط من هماهنگ بود و توانستم ادامه‌اش بدهم." }],
    faq: [{ question: "از چه سطحی می‌توانم شروع کنم؟", answer: "پس از ارزیابی اولیه، برنامه از سطح فعلی شما آغاز می‌شود؛ تجربه قبلی لازم نیست." }],
    pricingPlans: [{ name: "عضویت پایه", price: "ماهانه", description: "دسترسی به سالن و ارزیابی اولیه", features: ["تجهیزات کامل", "مشاوره شروع", "پیگیری ماهانه"] }, { name: "مربی اختصاصی", price: "پلن ویژه", description: "برنامه کاملاً شخصی", features: ["ارزیابی تخصصی", "برنامه تمرین", "پیگیری هفتگی"] }],
    teamMembers: [{ name: "مربی ارشد", role: "بدنسازی و تناسب اندام", bio: "مربی رسمی با تمرکز بر تمرین ایمن و نتیجه پایدار." }],
    galleryNotes: ["سالن تمرین مجهز", "تمرین با مربی", "کلاس گروهی", "تجهیزات حرفه‌ای"], listings: [], schedule: [{ day: "شنبه، دوشنبه، چهارشنبه", time: "۱۸ تا ۲۰", title: "کلاس گروهی" }, { day: "هر روز", time: "۶ تا ۲۲", title: "تمرین آزاد" }],
    stats: [{ value: "+۲۰۰", label: "عضو فعال" }, { value: "۷ روز", label: "فعال در هفته" }], clients: [],
    ctaText: "شروع جلسه آزمایشی", formTitle: "شروع مسیر تمرینی",
  },
  "law-firm": {
    promise: "تحلیل روشن، راهبرد حقوقی دقیق و همراهی مسئولانه در تصمیم‌های مهم.",
    about: "هر پرونده با شنیدن دقیق مسئله، بررسی مستندات و ارائه تصویری شفاف از مسیرهای پیش رو آغاز می‌شود.",
    offerings: ["مشاوره و تحلیل پرونده", "دعاوی و قراردادها", "پیگیری تخصصی"],
    offeringDescriptions: ["شناخت ابعاد مسئله و ارائه راهکارهای قابل اجرا.", "تنظیم و دفاع حقوقی با توجه کامل به جزئیات.", "گزارش منظم وضعیت و همراهی تا پایان مسیر."],
    portfolioNotes: ["حل‌وفصل اختلاف از مسیر مذاکره", "دفاع موفق در پرونده قراردادی", "تنظیم قرارداد پیشگیرانه"],
    testimonials: [{ name: "یکی از موکلان", text: "مسیر پرونده از ابتدا کاملاً شفاف توضیح داده شد و در تمام مراحل احساس اطمینان داشتم." }],
    faq: [{ question: "پیش از جلسه چه مدارکی آماده کنم؟", answer: "شرح کوتاه موضوع و اسناد مرتبط را آماده کنید تا جلسه اول با بررسی دقیق‌تری انجام شود." }],
    pricingPlans: [], teamMembers: [{ name: "وکیل پایه یک دادگستری", role: "مشاور و وکیل پرونده", bio: "با تجربه در تحلیل پرونده‌های پیچیده و مذاکره حقوقی." }],
    galleryNotes: ["جلسه مشاوره", "بررسی مستندات", "فضای حرفه‌ای دفتر", "همراهی حقوقی"], listings: [], schedule: [{ day: "شنبه تا چهارشنبه", time: "۹ تا ۱۸", title: "جلسات حضوری و آنلاین" }],
    stats: [{ value: "+۱۰", label: "سال سابقه" }, { value: "محرمانه", label: "تمام مشاوره‌ها" }], clients: [],
    ctaText: "درخواست مشاوره محرمانه", formTitle: "شرح اولیه موضوع حقوقی",
  },
  "real-estate": {
    promise: "فایل واقعی، تحلیل دقیق بازار و همراهی مطمئن تا امضای یک انتخاب خوب.",
    about: "به‌جای نمایش صدها فایل نامرتبط، نیاز و بودجه شما را می‌شناسیم و انتخاب‌هایی واقعی و قابل بررسی پیشنهاد می‌کنیم.",
    offerings: ["خرید و فروش ملک", "رهن و اجاره", "ارزیابی و مشاوره سرمایه‌گذاری"],
    offeringDescriptions: ["جست‌وجوی هدفمند و مذاکره برای یک معامله مطمئن.", "فایل‌های به‌روز متناسب با محدوده و بودجه شما.", "بررسی ارزش واقعی و ظرفیت رشد هر انتخاب."],
    portfolioNotes: [], testimonials: [{ name: "یکی از خریداران", text: "فقط فایل‌های واقعی و متناسب دیدیم و بدون اتلاف وقت به گزینه مناسب رسیدیم." }],
    faq: [{ question: "چطور فایل مناسب دریافت کنم؟", answer: "بودجه، محدوده و اولویت‌هایتان را ثبت کنید تا گزینه‌های واقعی و نزدیک به نیاز شما معرفی شوند." }],
    pricingPlans: [], teamMembers: [], galleryNotes: ["خانه‌های منتخب", "فضای داخلی باکیفیت", "محله‌های ارزشمند", "فرصت‌های سرمایه‌گذاری"],
    listings: [{ title: "آپارتمان خوش‌نقشه در محدوده منتخب", price: "قیمت روز", meta: "نور عالی • سند کامل • آماده بازدید" }, { title: "فرصت سرمایه‌گذاری ویژه", price: "شرایط مناسب", meta: "موقعیت روبه‌رشد • کارشناسی‌شده" }, { title: "خانه مناسب خانواده", price: "تماس بگیرید", meta: "دسترسی عالی • محیط آرام" }],
    schedule: [], stats: [{ value: "واقعی", label: "فایل‌های تأییدشده" }, { value: "همراه", label: "تا امضای قرارداد" }], clients: [],
    ctaText: "دریافت فایل‌های مناسب من", formTitle: "ملک موردنظر شما",
  },
  education: {
    promise: "یادگیری هدفمند با استادان حرفه‌ای و مسیری روشن از شروع تا نتیجه.",
    about: "کلاس‌های کم‌جمعیت، ارزیابی مستمر و پشتیبانی آموزشی کمک می‌کند هر زبان‌آموز با ریتم مناسب خودش پیشرفت کند.",
    offerings: ["دوره‌های عمومی", "کلاس خصوصی و فشرده", "آمادگی آزمون"],
    offeringDescriptions: ["مسیر سطح‌بندی‌شده برای ساخت مهارت‌های پایدار.", "برنامه منعطف و تمرکز کامل روی نیاز شما.", "تمرین هدفمند، آزمون آزمایشی و تحلیل عملکرد."],
    portfolioNotes: ["مسیر پیشرفت زبان‌آموزان", "کارگاه‌های مهارتی", "نتایج آزمون‌های بین‌المللی"],
    testimonials: [{ name: "یکی از زبان‌آموزان", text: "برنامه کلاس دقیق و منظم بود و بالاخره توانستم پیشرفتم را به‌صورت واقعی احساس کنم." }],
    faq: [{ question: "چطور سطح مناسبم مشخص می‌شود؟", answer: "پس از یک تعیین سطح کوتاه، دوره و برنامه مناسب هدف و زمان شما پیشنهاد می‌شود." }],
    pricingPlans: [], teamMembers: [{ name: "مدرس ارشد", role: "طراح مسیر آموزشی", bio: "با تجربه تدریس و رویکردی کاربردی و نتیجه‌محور." }],
    galleryNotes: ["کلاس‌های تعاملی", "اساتید حرفه‌ای", "فضای یادگیری", "موفقیت زبان‌آموزان"], listings: [], schedule: [{ day: "شنبه تا چهارشنبه", time: "۱۶ تا ۲۱", title: "کلاس‌های عصر" }, { day: "پنجشنبه", time: "۹ تا ۱۴", title: "دوره‌های فشرده" }],
    stats: [{ value: "+۱۰۰۰", label: "زبان‌آموز" }, { value: "+۲۰", label: "مدرس منتخب" }], clients: [],
    ctaText: "تعیین سطح رایگان", formTitle: "شروع مسیر یادگیری",
  },
};

/**
 * Deterministic preview built directly from the brief — no AI.
 * Since the final site is produced by hand, this shows the real Core layout,
 * the category's default blocks, brand color and the customer's own inputs
 * as a structural mockup. The team writes the polished copy during manual
 * delivery.
 */
export function buildDraftPreview(brief: FastWebBrief): FastWebPreviewContent {
  const name = brief.businessName?.trim() || "کسب‌وکار شما";
  const city = brief.city?.trim();
  const advantage = brief.mainAdvantage?.trim();
  const shortDescription = brief.shortDescription?.trim();
  const categoryKey = pickCategoryKey(brief);
  const preset = DEMO_PRESETS[categoryKey];

  const offeringsRaw = (brief.offerings || "")
    .split(/[\n,،]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  const offerings: FastWebOfferingItem[] =
    offeringsRaw.length > 0
      ? offeringsRaw.map((title, index) => ({
          title,
          description:
            preset.offeringDescriptions[index % preset.offeringDescriptions.length],
        }))
      : preset.offerings.map((title, index) => ({
          title,
          description: preset.offeringDescriptions[index],
        }));

  const style = (brief.style || "modern") as FastWebStyleId;
  const templateKey = pickCoreKey(brief);
  const sections = (
    brief.sections?.length
      ? brief.sections
      : defaultSectionsForCategory(categoryKey).length
        ? defaultSectionsForCategory(categoryKey)
        : suggestedSectionsForGoal(brief.goal)
  ).slice(0, 12) as FastWebSectionId[];

  const commonFaq: FastWebFaqItem[] = [
    {
      question: "چطور می‌توانم با شما تماس بگیرم؟",
      answer: `از طریق شماره تماس، واتساپ یا فرم درخواست همین صفحه با ${name} در ارتباط باشید.`,
    },
    {
      question: "محدوده فعالیت کجاست؟",
      answer: city ? `عمدتاً در ${city} و اطراف آن.` : "برای محدوده دقیق با ما تماس بگیرید.",
    },
    {
      question: "برای شروع چه کنم؟",
      answer: "فرم درخواست را پر کنید؛ در اولین فرصت پاسخ می‌دهیم.",
    },
  ];
  const headlineByCategory: Record<FastWebCategoryKey, string> = {
    "service-business": "کار درست، از همان بار اول",
    professional: "تخصصی که می‌توانید به آن اعتماد کنید",
    "online-store": "انتخاب‌هایی برای سلیقه‌های متفاوت",
    "restaurant-cafe": "طعم خوب، حال خوب",
    "company-b2b": "ساخته‌شده برای همکاری‌های بزرگ",
    "beauty-salon": "زیبایی‌ای که شبیه خود شماست",
    "gym-fitness": "قوی‌تر از دیروز",
    "law-firm": "آرامش، پشت یک تصمیم حقوقی درست",
    "real-estate": "خانه‌ای نزدیک به تصویر زندگی شما",
    education: "یادگیری‌ای که شما را جلو می‌برد",
  };
  const locationPhrase = city ? `در ${city}` : "";
  const audiencePresetLabels = (brief.audiencePresets || [])
    .map(
      (id) =>
        FASTWEB_AUDIENCE_PRESETS.find((preset) => preset.id === id)?.label
    )
    .filter(Boolean);
  const audience = brief.audience?.trim() || audiencePresetLabels.join(" و ");
  const audiencePhrase = audience
    ? `برای ${audience}`
    : "";

  return {
    headline: `${name}${city ? ` در ${city}` : ""}؛ ${headlineByCategory[categoryKey]}`,
    subheadline:
      advantage ||
      [preset.promise, locationPhrase, audiencePhrase].filter(Boolean).join(" "),
    aboutText:
      [shortDescription, `${name} ${locationPhrase} فعالیت می‌کند.`, preset.about]
        .filter(Boolean)
        .join(" "),
    offerings,
    portfolioNotes: preset.portfolioNotes,
    testimonials: preset.testimonials,
    faq: [...preset.faq, ...commonFaq].slice(0, 4),
    ctaText: preset.ctaText,
    formTitle: preset.formTitle,
    seoTitle: city ? `${name} | ${city}` : name,
    seoDescription: (shortDescription || advantage || preset.promise).slice(0, 150),
    categoryKey,
    templateKey,
    styleKey: style,
    brandColor: brief.brandColor || "#0F4C5C",
    sections,
    pricingPlans: sections.includes("pricing")
      ? preset.pricingPlans.length
        ? preset.pricingPlans
        : DEFAULT_PRICING_PLANS
      : [],
    teamMembers: sections.includes("team")
      ? preset.teamMembers.length
        ? preset.teamMembers
        : DEFAULT_TEAM_MEMBERS
      : [],
    galleryNotes: preset.galleryNotes,
    listings: sections.includes("listings")
      ? preset.listings.length
        ? preset.listings
        : DEFAULT_LISTINGS
      : [],
    schedule: sections.includes("schedule")
      ? preset.schedule.length
        ? preset.schedule
        : DEFAULT_SCHEDULE
      : [],
    stats: sections.includes("stats")
      ? preset.stats.length
        ? preset.stats
        : DEFAULT_STATS
      : [],
    clients: preset.clients,
  };
}