// =========================================================
// سایت فوری آرایه (FastWeb) — domain types & helpers
// =========================================================

export const FASTWEB_PACKAGES = {
  fast: {
    key: "fast" as const,
    name: "سایت فوری",
    priceToman: 4_900_000,
    maxPages: 1,
    revisions: 1,
    features: [
      "سایت یک‌صفحه‌ای",
      "نسخه اول تا ۲۴ ساعت کاری",
      "دامنه ir در صورت آزادبودن",
      "میزبانی یک‌ساله",
      "فرم و راه‌های تماس",
      "سئوی پایه",
      "یک مرحله اصلاح",
    ],
  },
  plus: {
    key: "plus" as const,
    name: "سایت فوری پلاس",
    priceToman: 7_900_000,
    maxPages: 5,
    revisions: 2,
    features: [
      "تا ۵ صفحه",
      "همه امکانات سایت فوری",
      "صفحات خدمات",
      "اتصال آمار و سرچ کنسول",
      "دو مرحله اصلاح",
      "پشتیبانی سه‌ماهه",
    ],
  },
} as const;

export type FastWebPackageKey = keyof typeof FASTWEB_PACKAGES;

export const FASTWEB_GOALS = [
  { id: "leads", label: "تماس و درخواست مشتری" },
  { id: "services", label: "معرفی خدمات" },
  { id: "portfolio", label: "نمایش نمونه‌کار" },
  { id: "products", label: "معرفی محصولات" },
  { id: "presence", label: "حضور رسمی در اینترنت" },
] as const;

export type FastWebGoalId = (typeof FASTWEB_GOALS)[number]["id"];

export const FASTWEB_SECTIONS = [
  { id: "hero", label: "معرفی اصلی", required: true },
  { id: "services", label: "خدمات" },
  { id: "products", label: "محصولات" },
  { id: "about", label: "درباره ما" },
  { id: "portfolio", label: "نمونه‌کار" },
  { id: "testimonials", label: "نظرات مشتریان" },
  { id: "faq", label: "سؤالات متداول" },
  { id: "contact", label: "تماس و نقشه", required: true },
] as const;

export type FastWebSectionId = (typeof FASTWEB_SECTIONS)[number]["id"];

export const FASTWEB_STYLES = [
  { id: "formal", label: "رسمی و مطمئن", hint: "مناسب پزشک، وکیل، شرکت و خدمات حرفه‌ای" },
  { id: "modern", label: "مدرن و ساده", hint: "خطوط تمیز، فضای سفید، حس تکنولوژی" },
  { id: "warm", label: "گرم و صمیمی", hint: "مناسب زیبایی، رستوران، کسب‌وکار محلی" },
] as const;

export type FastWebStyleId = (typeof FASTWEB_STYLES)[number]["id"];

export const FASTWEB_TEMPLATE_KEYS = [
  "local-business",
  "clinic-service",
  "portfolio-services",
] as const;

export type FastWebTemplateKey = (typeof FASTWEB_TEMPLATE_KEYS)[number];

export const PAYMENT_STATUSES = ["draft", "pending", "paid", "failed"] as const;
export type FastWebPaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_STATUSES = [
  "draft",
  "received",
  "copy_structure",
  "design",
  "qa",
  "first_version",
  "awaiting_approval",
  "published",
] as const;

export type FastWebFulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];

export const FULFILLMENT_LABELS: Record<FastWebFulfillmentStatus, string> = {
  draft: "پیش‌نویس",
  received: "اطلاعات دریافت شد",
  copy_structure: "متن و ساختار در حال آماده‌سازی",
  design: "طراحی در حال انجام",
  qa: "کنترل کیفیت",
  first_version: "نسخه اول آماده",
  awaiting_approval: "در انتظار تأیید",
  published: "منتشر شد",
};

/** Customer-facing pipeline after payment (excludes draft). */
export const FULFILLMENT_PIPELINE: FastWebFulfillmentStatus[] = [
  "received",
  "copy_structure",
  "design",
  "qa",
  "first_version",
  "awaiting_approval",
  "published",
];

export interface FastWebContacts {
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  address?: string;
  hours?: string;
  locationUrl?: string;
  email?: string;
}

export interface FastWebBrief {
  goal?: FastWebGoalId | string;
  businessName?: string;
  industry?: string;
  city?: string;
  shortDescription?: string;
  offerings?: string;
  mainAdvantage?: string;
  audience?: string;
  sections?: FastWebSectionId[];
  style?: FastWebStyleId;
  brandColor?: string;
  logoUrl?: string;
  imageNotes?: string;
  favoriteSites?: string;
  contacts?: FastWebContacts;
  slugPreference?: string;
  domainChoice?: "subdomain" | "custom";
  customDomain?: string;
}

export interface FastWebFaqItem {
  question: string;
  answer: string;
}

export interface FastWebOfferingItem {
  title: string;
  description: string;
}

export interface FastWebPreviewContent {
  headline: string;
  subheadline: string;
  aboutText: string;
  offerings: FastWebOfferingItem[];
  portfolioNotes: string[];
  testimonials: { name: string; text: string }[];
  faq: FastWebFaqItem[];
  ctaText: string;
  formTitle: string;
  seoTitle: string;
  seoDescription: string;
  templateKey: FastWebTemplateKey;
  styleKey: FastWebStyleId;
  brandColor: string;
  sections: FastWebSectionId[];
}

export interface FastWebOrder {
  id: string;
  slug: string;
  phone: string | null;
  businessName: string | null;
  package: FastWebPackageKey;
  amountToman: number;
  paymentStatus: FastWebPaymentStatus;
  fulfillmentStatus: FastWebFulfillmentStatus;
  brief: FastWebBrief;
  previewContent: Partial<FastWebPreviewContent>;
  publishedContent: Partial<FastWebPreviewContent>;
  templateKey: FastWebTemplateKey | null;
  styleKey: FastWebStyleId | null;
  brandColor: string | null;
  revisionCount: number;
  revisionNotes: string | null;
  domainRequest: string | null;
  adminNotes: string | null;
  zibalTrackId: string | null;
  paidAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Public temporary URL path */
  publicPath: string;
  /** Display subdomain hint for UI */
  temporaryHostHint: string;
}

export const FASTWEB_ORDER_COLUMNS =
  "id, access_token, slug, phone, business_name, package, amount_toman, " +
  "payment_status, fulfillment_status, brief, preview_content, published_content, " +
  "template_key, style_key, brand_color, revision_count, revision_notes, " +
  "domain_request, admin_notes, zibal_track_id, paid_at, published_at, created_at, updated_at";

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export function isFastWebPackageKey(v: unknown): v is FastWebPackageKey {
  return v === "fast" || v === "plus";
}

export function isFulfillmentStatus(v: unknown): v is FastWebFulfillmentStatus {
  return (
    typeof v === "string" &&
    (FULFILLMENT_STATUSES as readonly string[]).includes(v)
  );
}

export function suggestedSectionsForGoal(
  goal: string | undefined
): FastWebSectionId[] {
  const base: FastWebSectionId[] = ["hero", "about", "faq", "contact"];
  switch (goal) {
    case "leads":
      return ["hero", "services", "about", "faq", "contact"];
    case "services":
      return ["hero", "services", "about", "testimonials", "faq", "contact"];
    case "portfolio":
      return ["hero", "portfolio", "about", "testimonials", "faq", "contact"];
    case "products":
      return ["hero", "products", "about", "faq", "contact"];
    case "presence":
      return ["hero", "services", "about", "portfolio", "faq", "contact"];
    default:
      return base;
  }
}

export function pickTemplateKey(brief: FastWebBrief): FastWebTemplateKey {
  const industry = (brief.industry || "").toLowerCase();
  const goal = brief.goal;
  if (
    /پزشک|کلینیک|دندان|زیبایی|سلامت|مطب|clinic|doctor|beauty/.test(industry) ||
    goal === "leads"
  ) {
    if (/پزشک|کلینیک|دندان|مطب|clinic|doctor/.test(industry)) {
      return "clinic-service";
    }
  }
  if (goal === "portfolio" || /طراح|معمار|عکاس|portfolio|نمونه‌کار/.test(industry)) {
    return "portfolio-services";
  }
  return "local-business";
}

function slugifyFa(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06ff-]/gi, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export function buildSlugCandidate(businessName: string, fallback?: string): string {
  const base = slugifyFa(businessName) || slugifyFa(fallback || "") || "business";
  // Prefer latin-ish: if mostly Persian, use transliteration-lite hash suffix
  const hasLatin = /[a-z0-9]/.test(base);
  if (hasLatin) return base.replace(/[^\w-]/g, "").slice(0, 40) || "business";
  const suffix = Math.abs(
    Array.from(businessName).reduce((a, c) => a + c.charCodeAt(0), 0)
  )
    .toString(36)
    .slice(0, 6);
  return `biz-${suffix}`;
}

export function mapFastWebOrder(
  row: Record<string, unknown>,
  opts?: { includeAccessToken?: boolean }
): FastWebOrder & { accessToken?: string } {
  const slug = String(row.slug || "");
  const mapped: FastWebOrder & { accessToken?: string } = {
    id: String(row.id),
    slug,
    phone: typeof row.phone === "string" ? row.phone : null,
    businessName:
      typeof row.business_name === "string" ? row.business_name : null,
    package: isFastWebPackageKey(row.package) ? row.package : "fast",
    amountToman: Number(row.amount_toman) || FASTWEB_PACKAGES.fast.priceToman,
    paymentStatus: (row.payment_status as FastWebPaymentStatus) || "draft",
    fulfillmentStatus:
      (row.fulfillment_status as FastWebFulfillmentStatus) || "draft",
    brief: (row.brief && typeof row.brief === "object"
      ? row.brief
      : {}) as FastWebBrief,
    previewContent: (row.preview_content && typeof row.preview_content === "object"
      ? row.preview_content
      : {}) as Partial<FastWebPreviewContent>,
    publishedContent: (row.published_content &&
    typeof row.published_content === "object"
      ? row.published_content
      : {}) as Partial<FastWebPreviewContent>,
    templateKey: (row.template_key as FastWebTemplateKey) || null,
    styleKey: (row.style_key as FastWebStyleId) || null,
    brandColor: typeof row.brand_color === "string" ? row.brand_color : null,
    revisionCount: Number(row.revision_count) || 0,
    revisionNotes:
      typeof row.revision_notes === "string" ? row.revision_notes : null,
    domainRequest:
      typeof row.domain_request === "string" ? row.domain_request : null,
    adminNotes: typeof row.admin_notes === "string" ? row.admin_notes : null,
    zibalTrackId:
      typeof row.zibal_track_id === "string" ? row.zibal_track_id : null,
    paidAt: typeof row.paid_at === "string" ? row.paid_at : null,
    publishedAt: typeof row.published_at === "string" ? row.published_at : null,
    createdAt: String(row.created_at || ""),
    updatedAt: String(row.updated_at || ""),
    publicPath: `/s/${slug}`,
    temporaryHostHint: `${slug}.araaye.site`,
  };
  if (opts?.includeAccessToken && typeof row.access_token === "string") {
    mapped.accessToken = row.access_token;
  }
  return mapped;
}

export function normalizeIranPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("09")) return digits;
  if (digits.length === 10 && digits.startsWith("9")) return `0${digits}`;
  if (digits.length === 12 && digits.startsWith("989")) {
    return `0${digits.slice(2)}`;
  }
  return null;
}
