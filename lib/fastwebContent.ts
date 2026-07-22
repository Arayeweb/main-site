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
  FASTWEB_CORE_KEYS,
  FASTWEB_STYLES,
  isFastWebCategoryKey,
  suggestedSectionsForGoal,
} from "@/lib/fastweb";
import {
  defaultSectionsForCategory,
  getFastWebCategory,
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
    aboutText: asString(row.aboutText, 600) || "درباره کسب‌وکار به‌زودی تکمیل می‌شود.",
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
    name: "پلن پایه",
    price: "قیمت را در نسخه نهایی وارد کنید",
    description: "مناسب برای شروع",
    features: ["ویژگی اول", "ویژگی دوم"],
  },
  {
    name: "پلن حرفه‌ای",
    price: "قیمت را در نسخه نهایی وارد کنید",
    description: "برای استفاده منظم",
    features: ["همه امکانات پلن پایه", "امکانات بیشتر"],
  },
];

const DEFAULT_TEAM_MEMBERS: FastWebTeamMemberItem[] = [
  { name: "نام و نام خانوادگی", role: "تخصص یا سمت", bio: "توضیح کوتاه در نسخه نهایی تکمیل می‌شود." },
];

const DEFAULT_LISTINGS: FastWebListingItem[] = [
  { title: "فایل نمونه", price: "قیمت توافقی", meta: "جزئیات در نسخه نهایی تکمیل می‌شود" },
];

const DEFAULT_SCHEDULE: FastWebScheduleItem[] = [
  { day: "شنبه تا چهارشنبه", time: "۹ تا ۱۸", title: "ساعات کاری" },
];

const DEFAULT_STATS: FastWebStatItem[] = [
  { value: "+۱۰۰", label: "مشتری راضی" },
  { value: "+۵", label: "سال تجربه" },
];

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

  const offeringsRaw = (brief.offerings || "")
    .split(/[\n,،]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  const offerings: FastWebOfferingItem[] =
    offeringsRaw.length > 0
      ? offeringsRaw.map((title) => ({
          title,
          description: advantage || "توضیح این مورد در نسخه نهایی تکمیل می‌شود.",
        }))
      : [
          {
            title: "خدمت یا محصول اصلی",
            description: shortDescription || "توضیح کوتاه در نسخه نهایی تکمیل می‌شود.",
          },
        ];

  const style = (brief.style || "modern") as FastWebStyleId;
  const categoryKey = pickCategoryKey(brief);
  const templateKey = pickCoreKey(brief);
  const category = getFastWebCategory(categoryKey);
  const sections = (
    brief.sections?.length
      ? brief.sections
      : defaultSectionsForCategory(categoryKey).length
        ? defaultSectionsForCategory(categoryKey)
        : suggestedSectionsForGoal(brief.goal)
  ).slice(0, 12) as FastWebSectionId[];

  const faq: FastWebFaqItem[] = [
    {
      question: "چطور می‌توانم با شما تماس بگیرم؟",
      answer: "از طریق شماره تماس، واتساپ یا فرم درخواست در همین صفحه.",
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

  return {
    headline: city ? `${name} در ${city}` : name,
    subheadline:
      shortDescription ||
      advantage ||
      category?.pitch ||
      "معرفی خدمات و راه‌های ارتباط سریع با ما",
    aboutText:
      shortDescription ||
      `${name} آماده ارائه خدمات به ${brief.audience?.trim() || "مشتریان"} است.`,
    offerings,
    portfolioNotes: [],
    testimonials: [],
    faq,
    ctaText: "ثبت درخواست",
    formTitle: "فرم درخواست",
    seoTitle: city ? `${name} | ${city}` : name,
    seoDescription: (shortDescription || `سایت معرفی ${name}`).slice(0, 150),
    categoryKey,
    templateKey,
    styleKey: style,
    brandColor: brief.brandColor || "#0F4C5C",
    sections,
    pricingPlans: sections.includes("pricing") ? DEFAULT_PRICING_PLANS : [],
    teamMembers: sections.includes("team") ? DEFAULT_TEAM_MEMBERS : [],
    galleryNotes: [],
    listings: sections.includes("listings") ? DEFAULT_LISTINGS : [],
    schedule: sections.includes("schedule") ? DEFAULT_SCHEDULE : [],
    stats: sections.includes("stats") ? DEFAULT_STATS : [],
    clients: [],
  };
}