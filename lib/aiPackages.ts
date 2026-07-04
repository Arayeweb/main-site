// =========================================================
// پکیج‌های اعتباری Araaye Arena — قابل فروش با درگاه زیبال
// قیمت‌ها به تومان. با تغییر این فایل، pricing و checkout هماهنگ می‌مانند.
// =========================================================

export type AIPlan = "free" | "starter" | "pro" | "business";

export interface AIPackage {
  id: string;
  name: string;
  priceToman: number;
  credits: number;
  /** پلنی که بعد از خرید به کاربر داده می‌شود (اگر بالاتر از پلن فعلی باشد) */
  grantsPlan: Exclude<AIPlan, "free">;
  desc: string;
  features: string[];
  featured?: boolean;
  badge?: string;
}

export const AI_PACKAGES: Record<string, AIPackage> = {
  starter: {
    id: "starter",
    name: "استارتر",
    priceToman: 79_000,
    credits: 50,
    grantsPlan: "starter",
    desc: "برای شروع و استفاده شخصی.",
    features: [
      "≈ ۵۰ پرسش چت",
      "۵ شخصیت هوش مصنوعی (دقیق، منتقد، خلاق، سریع، اقتصادی)",
      "استودیو تصویر جدا (از ۳ کردیت)",
      "استودیو ویدیو سبک (از ۱۰ کردیت)",
      "رونویسی صوت (۲ کردیت/دقیقه)",
      "گفتگو، مقایسه و نبرد مدل‌ها",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceToman: 229_000,
    credits: 180,
    grantsPlan: "pro",
    desc: "برای فریلنسرها و کسب‌وکارهای کوچک.",
    features: [
      "≈ ۱۸۰ پرسش",
      "همه شخصیت‌ها + پرچم‌دارها (دقیق، منتقد، خلاق)",
      "استودیو ویدیو Sora و Veo",
      "اولویت در پاسخ‌دهی",
    ],
    featured: true,
    badge: "محبوب‌ترین",
  },
  business: {
    id: "business",
    name: "Business",
    priceToman: 549_000,
    credits: 500,
    grantsPlan: "business",
    desc: "برای تیم‌ها و استفاده حرفه‌ای.",
    features: [
      "≈ ۵۰۰ پرسش",
      "کامل‌ترین دسترسی به مدل‌های پرچم‌دار",
      "کمترین قیمت به‌ازای هر پرسش",
    ],
  },
};

export const PACKAGE_LIST: AIPackage[] = Object.values(AI_PACKAGES);

const PLAN_RANK: Record<AIPlan, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  business: 3,
};

export function planRank(plan: string): number {
  return PLAN_RANK[plan as AIPlan] ?? 0;
}

/** پلن بالاتر را برمی‌گرداند (بعد از خرید، پلن کاربر هرگز پایین نمی‌آید) */
export function higherPlan(current: string, granted: AIPlan): AIPlan {
  return planRank(granted) > planRank(current)
    ? granted
    : ((current as AIPlan) || "free");
}

export const PLAN_LABELS: Record<AIPlan, string> = {
  free: "رایگان",
  starter: "استارتر",
  pro: "Pro",
  business: "Business",
};
