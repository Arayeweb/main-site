// =========================================================
// منبع واحد قیمت‌گذاری و مصرف کردیت — Araaye AI
// پلن‌ها، قیمت checkout، هزینه مدل‌ها، و محدودیت دسترسی.
// =========================================================

import type { ModelTier } from "./aiModels";

/** شناسه‌های پایدار پلن */
export const PLAN_IDS = {
  FREE: "free",
  STARTER: "starter",
  PLUS: "plus",
  PRO: "pro",
  MAX: "max",
  TEAM_MINI: "team_mini",
  BUSINESS: "business",
} as const;

export type AIPlan = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

export const FREE_SIGNUP_CREDITS = 10;

/** تیم‌پلن self-serve هنوز پیاده‌سازی نشده */
export const TEAM_PURCHASE_ENABLED = false;

export interface AIPackage {
  id: string;
  name: string;
  /** برچسب فارسی UI */
  nameFa?: string;
  priceToman: number;
  /** برای Business: «از X تومان» */
  startingPrice?: boolean;
  credits: number;
  /** تعداد کاربر (فقط تیم) */
  users?: number;
  grantsPlan: Exclude<AIPlan, "free">;
  desc: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  checkoutEnabled: boolean;
  /** تماس برای خرید به‌جای درگاه */
  contactOnly?: boolean;
  visibility: "public" | "hidden";
}

const STARTER_FEATURES = [
  "دسترسی به همه مدل‌های چت",
  "پرداخت فقط به‌اندازه مصرف واقعی",
  "گفتگو و مقایسه مدل‌ها",
  "اعتبار ۱۲ ماهه",
];

const PLUS_FEATURES = [
  "همه امکانات شروع",
  "کردیت بیشتر برای مدل‌های قوی‌تر",
  "مناسب چت، مقایسه و تصویر",
  "مصرف روزمره راحت‌تر",
];

const PRO_FEATURES = [
  "همه امکانات پلاس",
  "بهترین تعادل قیمت و کردیت",
  "اولویت در پاسخ‌دهی",
  "مناسب مصرف حرفه‌ای",
];

const MAX_FEATURES = [
  "همه امکانات حرفه‌ای",
  "بیشترین کردیت به‌ازای تومان",
  "مناسب مصرف بالا",
  "کنترل بهتر هزینه برای تیم کوچک",
];

/** پلن‌های قابل خرید از درگاه */
export const AI_PACKAGES: Record<string, AIPackage> = {
  starter: {
    id: PLAN_IDS.STARTER,
    name: "Starter",
    nameFa: "شروع",
    priceToman: 99_000,
    credits: 80,
    grantsPlan: PLAN_IDS.STARTER,
    desc: "مناسب تست و استفاده سبک",
    features: STARTER_FEATURES,
    checkoutEnabled: true,
    visibility: "public",
  },
  plus: {
    id: PLAN_IDS.PLUS,
    name: "Plus",
    nameFa: "پلاس",
    priceToman: 299_000,
    credits: 260,
    grantsPlan: PLAN_IDS.PLUS,
    desc: "مناسب استفاده روزمره",
    features: PLUS_FEATURES,
    checkoutEnabled: true,
    visibility: "public",
  },
  pro: {
    id: PLAN_IDS.PRO,
    name: "Pro",
    nameFa: "حرفه‌ای",
    priceToman: 649_000,
    credits: 600,
    grantsPlan: PLAN_IDS.PRO,
    desc: "بهترین گزینه برای اکثر کاربران",
    features: PRO_FEATURES,
    featured: true,
    badge: "محبوب‌ترین",
    checkoutEnabled: true,
    visibility: "public",
  },
  max: {
    id: PLAN_IDS.MAX,
    name: "Max",
    nameFa: "مکس",
    priceToman: 1_290_000,
    credits: 1250,
    grantsPlan: PLAN_IDS.MAX,
    desc: "مناسب مصرف بالا و کاربران جدی",
    features: MAX_FEATURES,
    checkoutEnabled: true,
    visibility: "hidden",
  },
  team_mini: {
    id: PLAN_IDS.TEAM_MINI,
    name: "Team Mini",
    nameFa: "تیم کوچک",
    priceToman: 1_900_000,
    credits: 2500,
    users: 3,
    grantsPlan: PLAN_IDS.TEAM_MINI,
    desc: "مناسب تیم‌های کوچک با مدیریت مصرف",
    features: [
      "۲۵۰۰ کردیت مشترک",
      "۳ کاربر",
      "مدیریت مصرف تیم",
      "پشتیبانی اولویت‌دار",
    ],
    checkoutEnabled: TEAM_PURCHASE_ENABLED,
    contactOnly: !TEAM_PURCHASE_ENABLED,
    visibility: "public",
  },
};

/** پلن رایگان — فقط نمایش */
export const FREE_PACKAGE: AIPackage = {
  id: PLAN_IDS.FREE,
  name: "Free",
  nameFa: "رایگان",
  priceToman: 0,
  credits: FREE_SIGNUP_CREDITS,
  grantsPlan: PLAN_IDS.STARTER,
  desc: "رایگان امتحان کنید — چند گفت‌وگوی اولیه برای آشنایی با آرایه AI",
  features: [
    "رایگان امتحان کنید",
    "چند گفت‌وگوی اولیه",
    "فقط مدل‌های اقتصادی",
  ],
  checkoutEnabled: false,
  visibility: "public",
};

/** پلن سازمانی — فقط تماس با فروش */
export const BUSINESS_PACKAGE: AIPackage = {
  id: PLAN_IDS.BUSINESS,
  name: "Business",
  nameFa: "سازمانی",
  priceToman: 4_900_000,
  startingPrice: true,
  credits: 6500,
  grantsPlan: PLAN_IDS.BUSINESS,
  desc: "تیم، پشتیبانی، مصرف بالا، اتصال اختصاصی",
  features: [
    "۶۵۰۰+ کردیت ماهانه",
    "تیم و مدیریت مصرف",
    "مدل‌های اختصاصی در صورت اتصال واقعی provider",
    "پشتیبانی و اتصال اختصاصی",
  ],
  checkoutEnabled: false,
  contactOnly: true,
  visibility: "hidden",
};

/** همه پلن‌های عمومی برای صفحه قیمت‌گذاری */
export const PUBLIC_PLAN_LIST: AIPackage[] = [
  FREE_PACKAGE,
  AI_PACKAGES.starter,
  AI_PACKAGES.plus,
  AI_PACKAGES.pro,
  AI_PACKAGES.max,
];

/** پلن‌های قابل checkout — سازگاری با importهای قدیمی */
export const PACKAGE_LIST: AIPackage[] = Object.values(AI_PACKAGES).filter(
  (p) => p.checkoutEnabled
);

const PLAN_RANK: Record<AIPlan, number> = {
  free: 0,
  starter: 1,
  plus: 2,
  pro: 3,
  max: 4,
  team_mini: 5,
  business: 6,
};

export function planRank(plan: string): number {
  return PLAN_RANK[plan as AIPlan] ?? 0;
}

export function higherPlan(current: string, granted: AIPlan): AIPlan {
  return planRank(granted) > planRank(current)
    ? granted
    : ((current as AIPlan) || PLAN_IDS.FREE);
}

export const PLAN_LABELS: Record<AIPlan, string> = {
  free: "رایگان",
  starter: "شروع",
  plus: "پلاس",
  pro: "حرفه‌ای",
  max: "مکس",
  team_mini: "تیم کوچک",
  business: "سازمانی",
};

export function formatPriceToman(amount: number, startingPrice?: boolean): string {
  const formatted = amount.toLocaleString("fa-IR");
  return startingPrice ? `از ${formatted}` : formatted;
}

export const PRICING_EXPLANATION_FA =
  "مصرف هر درخواست از هزینه واقعی API، نرخ دلار محاسباتی و حداقل مصرف مدل حساب می‌شود. مدل قوی‌تر فقط کردیت بیشتری مصرف می‌کند و همه کاربران پولی به مدل‌های چت دسترسی دارند. اعتبار خریداری‌شده ۱۲ ماه اعتبار دارد.";

// ---------- هزینه چت بر اساس مدل ----------

/** هزینه پایه هر پیام چت — بر اساس id مدل */
export const MODEL_CHAT_CREDITS: Record<string, number> = {
  // Direct personas
  economy: 1,
  fast: 2,
  creative: 5,
  precise: 15,
  critic: 15,
  // Compare / battle pool
  "cmp-deepseek-v4": 1,
  "cmp-gemini-flash": 1,
  "cmp-llama-70b": 1,
  "cmp-gpt-4o-mini": 2,
  "cmp-grok-4": 2,
  "cmp-mistral-medium": 2,
  "cmp-claude-haiku": 8,
  "cmp-gemini-pro": 5,
  "cmp-gpt-55": 15,
  "cmp-claude-opus": 15,
};

/** fallback وقتی id در جدول بالا نیست */
export const MODEL_TIER_CHAT_CREDITS: Record<ModelTier, number> = {
  economy: 1,
  mid: 2,
  premium: 8,
};

/** مدل‌های فقط Business / دستی */
export const BUSINESS_ONLY_MODEL_IDS = new Set<string>([
  // TODO: وقتی مدل اختصاصی واقعی به provider وصل شد، id را اینجا ثبت کنید.
]);

/** حداقل پلن برای tier چت */
export const TIER_MIN_PLAN: Record<ModelTier, AIPlan> = {
  economy: PLAN_IDS.FREE,
  mid: PLAN_IDS.STARTER,
  premium: PLAN_IDS.STARTER,
};

// ---------- وب‌سرچ ----------

export const WEB_SEARCH_CREDITS = {
  simple: 5,
  deep: { min: 8, max: 15 },
  multiStep: { min: 20, max: 50 },
} as const;

/** فعلاً همه جستجوهای وب = simple (+۵ کردیت) */
export function webSearchSurcharge(): number {
  return WEB_SEARCH_CREDITS.simple;
}

// ---------- تصویر ----------

export const IMAGE_CREDIT_BY_MODEL: Record<string, number> = {
  "image-lite": 20,
  "image-nano": 35,
  "image-gpt": 60,
};

// ---------- ویدیو ----------

export const VIDEO_CREDIT_RATES: Record<
  string,
  { creditsPerSecond: number; minCredits: number }
> = {
  "video-seedance": { creditsPerSecond: 12, minCredits: 50 },
  "video-kling": { creditsPerSecond: 30, minCredits: 120 },
  "video-sora": { creditsPerSecond: 75, minCredits: 250 },
  "video-veo": { creditsPerSecond: 80, minCredits: 300 },
};

/** حداقل پلن برای هر مدل ویدیو */
export const VIDEO_MIN_PLAN: Record<string, AIPlan> = {
  "video-seedance": PLAN_IDS.STARTER,
  "video-kling": PLAN_IDS.PLUS,
  "video-sora": PLAN_IDS.MAX,
  "video-veo": PLAN_IDS.MAX,
};

// ---------- پیام‌های خطا (فارسی) ----------

export const CREDIT_ERROR_MESSAGES = {
  insufficient: "کردیت کافی نیست.",
  modelNotAvailable: "این مدل برای پلن فعلی شما فعال نیست.",
  upgradeRequired: "برای استفاده از این قابلیت باید پلن خود را ارتقا دهید.",
} as const;

/**
 * TODO: صورتحساب مبتنی بر token — بازه‌های heavy task را به multiplier نگاشت کنید.
 * فعلاً هزینه ثابت per-message + surcharge ابزارها.
 */
export const HEAVY_TASK_CREDIT_RANGES = {
  economy: { min: 3, max: 5 },
  mid: { min: 6, max: 8 },
  premiumPro: { min: 10, max: 15 },
  sonnetGpt54: { min: 20, max: 30 },
  opusGpt55: { min: 40, max: 60 },
} as const;

export function chatModelCredit(modelId: string, tier: ModelTier): number {
  return MODEL_CHAT_CREDITS[modelId] ?? MODEL_TIER_CHAT_CREDITS[tier];
}

export function isCheckoutPackage(packageId: string): boolean {
  const pkg = AI_PACKAGES[packageId];
  return !!pkg?.checkoutEnabled;
}
