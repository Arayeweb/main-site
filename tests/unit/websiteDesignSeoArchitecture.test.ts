import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getPublishedIndustryPages,
  getPublishedIndustryPaths,
  isPublishedIndustryPage,
  PROGRAMMATIC_INDUSTRY_PAGES,
} from "@/lib/seo/programmaticPages";
import { getIndustryLandingPageContent } from "@/lib/seo/pageContent";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";
import { PRODUCTION_SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import {
  assertConsistentWebsitePrices,
  FASTWEB_START_PRICE_TOMAN,
  WEBSITE_PRICING_OFFERS,
  websiteDesignPricingPlans,
} from "@/lib/websitePricing";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

describe("website design SEO architecture", () => {
  it("publishes phase-1 verticals plus cafe and online-shop; keeps restaurant/doctor draft", () => {
    const slugs = getPublishedIndustryPages("website").map((p) => p.slug).sort();
    expect(slugs).toEqual(
      [
        "architect",
        "beauty-clinic",
        "cafe",
        "clinic",
        "consultant",
        "dentist",
        "instagram-business",
        "lawyer",
        "online-shop",
        "photographer",
        "private-tutor",
        "service-company",
      ].sort(),
    );
    expect(isPublishedIndustryPage("website", "doctor")).toBe(false);
    expect(isPublishedIndustryPage("website", "restaurant")).toBe(false);
    expect(isPublishedIndustryPage("website", "real-estate")).toBe(false);
  });

  it("keeps unique primary keywords across published website + seo pages", () => {
    const keywords = PROGRAMMATIC_INDUSTRY_PAGES.filter((p) => p.status === "published").map(
      (p) => p.primaryKeyword,
    );
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("hub and offer titles avoid double brand suffix", () => {
    const websiteDesign = readSource("app/website-design/page.tsx");
    const fastweb = readSource("app/fastweb/page.tsx");
    const cost = readSource("app/website-design/cost/page.tsx");

    for (const src of [websiteDesign, fastweb, cost]) {
      expect(src).toMatch(/title:\s*\{\s*absolute:/);
      expect(src).not.toMatch(/\| آرایه \| آرایه/);
    }

    expect(websiteDesign).toContain("طراحی سایت حرفه‌ای و فروش‌محور | شرکت آرایه");
    expect(fastweb).toContain("طراحی سایت ارزان و فوری | تحویل ۲۴ ساعته | آرایه");
    expect(cost).toContain("قیمت طراحی سایت | تعرفه سایت فوری و اختصاصی | آرایه");
  });

  it("website-design H1 targets طراحی سایت and keeps prior subheading concept", () => {
    const hero = readSource("components/website-design/website-design-hero.tsx");
    const h1Matches = hero.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
    expect(h1Matches).toHaveLength(1);
    expect(h1Matches[0]).toContain("طراحی سایت حرفه‌ای که مشتری را به تماس و سفارش برساند");
    expect(hero).toContain("دریافت برآورد رایگان");
    expect(hero).toContain("مشاهده نمونه‌کارها");
  });

  it("fastweb H1 targets فوری/سایت سریع intent", () => {
    const landing = readSource("components/fastweb/FastWebLanding.tsx");
    const h1Matches = landing.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
    expect(h1Matches).toHaveLength(1);
    expect(h1Matches[0]).toMatch(/۲۴ ساعت|فوری|ارزان/);
  });

  it("canonical helpers stay on araaye.com for new routes", () => {
    const paths = [
      "/website-design",
      "/website-design/cost",
      "/fastweb",
      "/website/private-tutor",
      "/website/instagram-business",
      "/blog/website-design-order-checklist",
      "/blog/instagram-page-to-website",
    ];
    for (const path of paths) {
      const url = canonicalUrl(path);
      expect(url.startsWith(PRODUCTION_SITE_URL)).toBe(true);
      expect(url).not.toMatch(/xn--|localhost|www\.araaye/i);
    }
  });

  it("indexable phase-1 URLs appear in sitemap exactly once", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    const required = [
      "/website-design/cost",
      "/website/private-tutor",
      "/website/consultant",
      "/website/architect",
      "/website/photographer",
      "/website/service-company",
      "/website/instagram-business",
      "/blog/website-design-order-checklist",
      "/blog/instagram-page-to-website",
    ].map((p) => canonicalUrl(p));

    for (const url of required) {
      expect(urls.filter((u) => u === url)).toHaveLength(1);
    }

    expect(urls).not.toContain(canonicalUrl("/website/doctor"));
    expect(urls).toContain(canonicalUrl("/website/cafe"));
    expect(urls).toContain(canonicalUrl("/website/online-shop"));
    expect(urls).not.toContain(canonicalUrl("/website/real-estate"));
  });

  it("sitemap has no duplicate URLs", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("redirect config still maps /website/doctor to /doctors permanently", () => {
    const config = readSource("next.config.js");
    expect(config).toMatch(
      /source:\s*"\/website\/doctor"[\s\S]*?destination:\s*"\/doctors"[\s\S]*?permanent:\s*true/,
    );
  });

  it("keeps shared pricing source of truth consistent", () => {
    const prices = assertConsistentWebsitePrices();
    expect(prices.fastweb).toBe(FASTWEB_PACKAGES.fast.priceToman);
    expect(prices.fastweb).toBe(4_900_000);
    expect(prices.business).toBe(25_000_000);
    expect(prices.professional).toBe(45_000_000);
    expect(prices.shop).toBe(80_000_000);

    const offerFast = WEBSITE_PRICING_OFFERS.find((o) => o.id === "fastweb");
    expect(offerFast?.priceFromToman).toBe(FASTWEB_START_PRICE_TOMAN);
    expect(websiteDesignPricingPlans.map((p) => p.priceFrom)).toEqual([
      25_000_000,
      45_000_000,
      80_000_000,
    ]);
  });

  it("new industry metas are unique and use absolute brand once", () => {
    const metas = getPublishedIndustryPaths("website").map((path) => {
      const slug = path.split("/")[2] as Parameters<typeof getIndustryLandingPageContent>[1];
      return getIndustryLandingPageContent("website", slug).meta;
    });
    const titles = metas.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const title of titles) {
      expect(title).not.toMatch(/\| آرایه \| آرایه/);
      expect(title.endsWith("| آرایه") || title.includes("| شرکت آرایه")).toBe(true);
    }
  });

  it("private-tutor CTA points to /modares", () => {
    const page = getIndustryLandingPageContent("website", "private-tutor");
    expect(page.hero.primaryCtaLabel).toBe("مشاهده سایت مخصوص مدرس‌ها");
    expect(page.hero.primaryCtaHref).toBe("/modares");
    expect(page.hero.h1).toContain("طراحی سایت برای مدرس خصوصی");
  });
});
