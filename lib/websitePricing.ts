/**
 * Shared pricing source of truth for website design products.
 * UI pages must read from here (or re-exports) — do not hardcode package prices elsewhere.
 */

import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import {
  formatWebsiteDesignPrice,
  websiteDesignPricingExtras,
  websiteDesignPricingPlans,
  type WebsiteDesignPricingPlan,
} from "@/data/website-design";

export { formatWebsiteDesignPrice, websiteDesignPricingExtras, websiteDesignPricingPlans };
export type { WebsiteDesignPricingPlan };

export const FASTWEB_START_PRICE_TOMAN = FASTWEB_PACKAGES.fast.priceToman;
export const FASTWEB_PLUS_PRICE_TOMAN = FASTWEB_PACKAGES.plus.priceToman;

export type WebsitePricingPath = "fastweb" | "custom" | "both";

export type WebsitePricingOffer = {
  id: string;
  title: string;
  path: WebsitePricingPath;
  audience: string;
  scope: string;
  includes: readonly string[];
  excludes: readonly string[];
  priceFromToman: number;
  timeline: string;
  revisions: string;
  support: string;
  separateCosts: readonly string[];
  ctaLabel: string;
  ctaHref: string;
};

/** Commercial comparison set used by /website-design/cost and hub pricing links. */
export const WEBSITE_PRICING_OFFERS: readonly WebsitePricingOffer[] = [
  {
    id: "fastweb",
    title: "سایت فوری (FastWeb)",
    path: "fastweb",
    audience: "کسب‌وکارهای کوچک که حضور رسمی سریع می‌خواهند، نه سیستم فروش پیچیده.",
    scope: `۱ صفحه در بسته پایه (تا ${FASTWEB_PACKAGES.plus.maxPages} صفحه در پلاس)`,
    includes: FASTWEB_PACKAGES.fast.features,
    excludes: [
      "فروشگاه و درگاه پیچیده",
      "پنل کاربری اختصاصی",
      "اتوماسیون و رزرو سفارشی",
      "طراحی کاملاً یونیک برند",
    ],
    priceFromToman: FASTWEB_START_PRICE_TOMAN,
    timeline: "نسخه اول در ۲۴ ساعت کاری پس از تکمیل اطلاعات",
    revisions: `${FASTWEB_PACKAGES.fast.revisions} مرحله اصلاح (پلاس: ${FASTWEB_PACKAGES.plus.revisions})`,
    support: "پشتیبانی طبق بسته انتخابی (پلاس: سه‌ماهه)",
    separateCosts: ["دامنه غیرایرانی در صورت نیاز", "توسعه امکانات سفارشی بعد از انتشار"],
    ctaLabel: "شروع سفارش سایت فوری",
    ctaHref: "/fastweb/new",
  },
  {
    id: "business",
    title: websiteDesignPricingPlans[0].title,
    path: "custom",
    audience: websiteDesignPricingPlans[0].audience,
    scope: "چند صفحه معرفی خدمات، درباره ما و تماس",
    includes: websiteDesignPricingPlans[0].features,
    excludes: [
      "فروشگاه کامل و مدیریت سفارش",
      "چندزبانه‌سازی",
      "سئوی مستمر ماهانه",
    ],
    priceFromToman: websiteDesignPricingPlans[0].priceFrom,
    timeline: websiteDesignPricingPlans[0].timeline,
    revisions: websiteDesignPricingPlans[0].revisions,
    support: websiteDesignPricingPlans[0].support,
    separateCosts: websiteDesignPricingExtras.separateFeatures,
    ctaLabel: "درخواست برآورد سایت معرفی",
    ctaHref: "/website-design#website-design-lead-form",
  },
  {
    id: "professional",
    title: websiteDesignPricingPlans[1].title,
    path: "custom",
    audience: websiteDesignPricingPlans[1].audience,
    scope: "چند خدمت، محتوا و مسیرهای تماس جدا",
    includes: websiteDesignPricingPlans[1].features,
    excludes: ["فروشگاه و سبد خرید کامل", "اتوماسیون سازمانی پیچیده"],
    priceFromToman: websiteDesignPricingPlans[1].priceFrom,
    timeline: websiteDesignPricingPlans[1].timeline,
    revisions: websiteDesignPricingPlans[1].revisions,
    support: websiteDesignPricingPlans[1].support,
    separateCosts: websiteDesignPricingExtras.separateFeatures,
    ctaLabel: "درخواست برآورد سایت حرفه‌ای",
    ctaHref: "/website-design#website-design-lead-form",
  },
  {
    id: "shop",
    title: websiteDesignPricingPlans[2].title,
    path: "custom",
    audience: websiteDesignPricingPlans[2].audience,
    scope: "کاتالوگ، سبد خرید و درگاه پرداخت",
    includes: websiteDesignPricingPlans[2].features,
    excludes: ["مارکت‌پلیس چندفروشنده", "اپلیکیشن موبایل بومی"],
    priceFromToman: websiteDesignPricingPlans[2].priceFrom,
    timeline: websiteDesignPricingPlans[2].timeline,
    revisions: websiteDesignPricingPlans[2].revisions,
    support: websiteDesignPricingPlans[2].support,
    separateCosts: [
      ...websiteDesignPricingExtras.separateFeatures,
      "کارمزد درگاه و هزینه سالانه دامنه/هاست",
    ],
    ctaLabel: "درخواست برآورد فروشگاه",
    ctaHref: "/website-design#website-design-lead-form",
  },
] as const;

export const WEBSITE_PRICING_UPDATED_AT = "2026-07-19";

export function getWebsiteOfferById(id: string): WebsitePricingOffer | undefined {
  return WEBSITE_PRICING_OFFERS.find((o) => o.id === id);
}

export function assertConsistentWebsitePrices(): {
  fastweb: number;
  business: number;
  professional: number;
  shop: number;
} {
  return {
    fastweb: FASTWEB_START_PRICE_TOMAN,
    business: websiteDesignPricingPlans[0].priceFrom,
    professional: websiteDesignPricingPlans[1].priceFrom,
    shop: websiteDesignPricingPlans[2].priceFrom,
  };
}
