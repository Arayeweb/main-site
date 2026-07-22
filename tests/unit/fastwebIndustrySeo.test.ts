import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FASTWEB_EXCLUSIVE_SLUGS,
  FASTWEB_INDUSTRIES,
  getAllFastWebIndustries,
  getFastWebIndustry,
  getFastWebIndustryPath,
  getIndexableFastWebIndustries,
  getPublishedFastWebIndustryPaths,
  isFastWebIndustrySlug,
  isIndexableFastWebIndustry,
} from "@/lib/fastweb/industries";
import { getPublishedIndustryPages } from "@/lib/seo/programmaticPages";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";
import { canonicalUrl } from "@/lib/siteUrl";
import {
  assertConsistentWebsitePrices,
  FASTWEB_START_PRICE_TOMAN,
} from "@/lib/websitePricing";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

const BATCH_1_SLUGS = [
  "psychologist",
  "beauty-salon",
  "accounting",
  "construction-company",
  "fitness-coach",
  "industrial-company",
] as const;

const BATCH_2_SLUGS = [
  "real-estate",
  "home-services",
  "car-repair",
  "language-school",
  "insurance",
  "travel-agency",
] as const;

describe("fastweb industry programmatic SEO", () => {
  it("registers exactly 12 industries", () => {
    expect(FASTWEB_INDUSTRIES).toHaveLength(12);
    expect(getAllFastWebIndustries()).toHaveLength(12);
  });

  it("batch 1 is indexable and batch 2 is noindex", () => {
    for (const slug of BATCH_1_SLUGS) {
      expect(isIndexableFastWebIndustry(slug)).toBe(true);
    }
    for (const slug of BATCH_2_SLUGS) {
      expect(isIndexableFastWebIndustry(slug)).toBe(false);
    }
    expect(getIndexableFastWebIndustries()).toHaveLength(6);
    expect(getPublishedFastWebIndustryPaths()).toHaveLength(6);
  });

  it("rejects unknown slugs", () => {
    expect(isFastWebIndustrySlug("psychologist")).toBe(true);
    expect(isFastWebIndustrySlug("unknown-industry")).toBe(false);
    expect(getFastWebIndustry("fast-psychologist")).toBeUndefined();
  });

  it("every industry has unique title, description, and primary keyword", () => {
    const titles = FASTWEB_INDUSTRIES.map((i) => i.title);
    const descriptions = FASTWEB_INDUSTRIES.map((i) => i.description);
    const keywords = FASTWEB_INDUSTRIES.map((i) => i.primaryKeyword);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
    expect(new Set(keywords).size).toBe(keywords.length);
  });

  it("titles avoid double brand suffix", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      expect(industry.title).not.toMatch(/\| آرایه \| آرایه/);
    }
  });

  it("canonical paths use /fastweb/[slug] pattern", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      const path = getFastWebIndustryPath(industry.slug);
      expect(path).toBe(`/fastweb/${industry.slug}`);
      expect(canonicalUrl(path)).toMatch(/^https:\/\/araaye\.com\/fastweb\//);
    }
  });

  it("indexable batch 1 pages appear in sitemap; batch 2 excluded", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    for (const slug of BATCH_1_SLUGS) {
      expect(urls).toContain(canonicalUrl(`/fastweb/${slug}`));
    }
    for (const slug of BATCH_2_SLUGS) {
      expect(urls).not.toContain(canonicalUrl(`/fastweb/${slug}`));
    }
  });

  it("sitemap has no duplicate fastweb industry URLs", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    const fastwebUrls = urls.filter((u) => u.includes("/fastweb/") && u !== canonicalUrl("/fastweb"));
    expect(new Set(fastwebUrls).size).toBe(fastwebUrls.length);
  });

  it("indexable pages have lastmod from updatedAt", () => {
    const entries = buildSitemapEntries();
    for (const slug of BATCH_1_SLUGS) {
      const entry = entries.find((e) => e.url === canonicalUrl(`/fastweb/${slug}`));
      expect(entry?.lastModified).toBeDefined();
      expect(entry?.lastModified?.toISOString().startsWith("2026-07-19")).toBe(true);
    }
  });

  it("no /website/[industry] equivalent exists for fastweb-exclusive slugs", () => {
    const websiteSlugs = getPublishedIndustryPages("website").map((p) => p.slug);
    for (const slug of FASTWEB_EXCLUSIVE_SLUGS) {
      expect(websiteSlugs).not.toContain(slug);
    }
  });

  it("pricing is consistent with FASTWEB_PACKAGES source of truth", () => {
    const prices = assertConsistentWebsitePrices();
    expect(prices.fastweb).toBe(FASTWEB_PACKAGES.fast.priceToman);
    expect(prices.fastweb).toBe(FASTWEB_START_PRICE_TOMAN);
    expect(FASTWEB_START_PRICE_TOMAN).toBe(4_900_000);
  });

  it("route file uses absolute title and 404 for unknown slugs", () => {
    const page = readSource("app/fastweb/[industry]/page.tsx");
    expect(page).toMatch(/title:\s*\{\s*absolute:/);
    expect(page).toContain("notFound()");
    expect(page).toContain("isFastWebIndustrySlug");
  });

  it("landing component has exactly one H1", () => {
    const landing = readSource("components/fastweb/FastWebIndustryLanding.tsx");
    const h1Matches = landing.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
    expect(h1Matches).toHaveLength(1);
  });

  it("hub page links to all 12 industry pages", () => {
    const hub = readSource("components/fastweb/FastWebLanding.tsx");
    expect(hub).toContain("سایت فوری برای چه کسب‌وکارهایی مناسب است؟");
    expect(hub).toContain("getAllFastWebIndustries");
    expect(hub).toContain("getFastWebIndustryPath");
    expect(FASTWEB_INDUSTRIES).toHaveLength(12);
  });

  it("each industry has unique pain points, FAQs, and mockup config", () => {
    const painPointSets = FASTWEB_INDUSTRIES.map((i) =>
      i.painPoints.map((p) => p.title).join("|"),
    );
    const faqSets = FASTWEB_INDUSTRIES.map((i) => i.faqs.map((f) => f.question).join("|"));
    const mockupLabels = FASTWEB_INDUSTRIES.map((i) => i.sampleConfig.label);
    expect(new Set(painPointSets).size).toBe(painPointSets.length);
    expect(new Set(faqSets).size).toBe(faqSets.length);
    expect(new Set(mockupLabels).size).toBe(mockupLabels.length);
  });

  it("related industries reference valid slugs", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      for (const related of industry.relatedIndustries) {
        expect(isFastWebIndustrySlug(related)).toBe(true);
      }
    }
  });
});
