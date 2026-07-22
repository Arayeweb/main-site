import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  FASTWEB_EXCLUSIVE_SLUGS,
  FASTWEB_INDUSTRIES,
  FASTWEB_PROOF_SLUGS,
  getAllFastWebIndustries,
  getFastWebExamplePath,
  getFastWebIndustry,
  getFastWebIndustryPath,
  getIndexableFastWebIndustries,
  getIndustryOrderHref,
  getProofFastWebIndustries,
  getPublishedFastWebExamplePaths,
  getPublishedFastWebIndustryPaths,
  isFastWebIndustrySlug,
  isIndexableFastWebIndustry,
  mapIndustryToCategoryKey,
  validateFastWebIndustryRegistry,
} from "@/lib/fastweb/industries";
import { evaluateIndustryQualityGate } from "@/lib/fastweb/qualityGate";
import { getPublishedIndustryPages } from "@/lib/seo/programmaticPages";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";
import { canonicalUrl } from "@/lib/siteUrl";
import {
  assertConsistentWebsitePrices,
  FASTWEB_START_PRICE_TOMAN,
} from "@/lib/websitePricing";
import { FASTWEB_PACKAGES } from "@/lib/fastweb";
import { safeParseFastWebIndustry } from "@/lib/fastweb/industrySchema";

const ROOT = process.cwd();

function readSource(relPath: string): string {
  return readFileSync(join(ROOT, relPath), "utf8");
}

describe("fastweb industry programmatic SEO architecture", () => {
  it("registers proof industries plus legacy drafts", () => {
    expect(getProofFastWebIndustries()).toHaveLength(3);
    expect(FASTWEB_PROOF_SLUGS).toEqual(["beauty-salon", "gym", "law-firm"]);
    expect(getAllFastWebIndustries().length).toBeGreaterThanOrEqual(3);
    for (const slug of FASTWEB_PROOF_SLUGS) {
      expect(isFastWebIndustrySlug(slug)).toBe(true);
    }
  });

  it("validates every industry against Zod schema", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      const parsed = safeParseFastWebIndustry(industry);
      expect(parsed.success).toBe(true);
    }
  });

  it("only quality-gated industries are indexable and in sitemap", () => {
    const indexable = getIndexableFastWebIndustries();
    expect(indexable.map((i) => i.slug).sort()).toEqual([...FASTWEB_PROOF_SLUGS].sort());

    for (const industry of FASTWEB_INDUSTRIES) {
      const gate = evaluateIndustryQualityGate(industry);
      expect(isIndexableFastWebIndustry(industry.slug)).toBe(gate.pass);
    }

    const urls = buildSitemapEntries().map((e) => e.url);
    for (const slug of FASTWEB_PROOF_SLUGS) {
      expect(urls).toContain(canonicalUrl(`/fastweb/${slug}`));
      expect(urls).toContain(canonicalUrl(`/fastweb/examples/${slug}`));
    }
    for (const industry of FASTWEB_INDUSTRIES) {
      if (!FASTWEB_PROOF_SLUGS.includes(industry.slug as (typeof FASTWEB_PROOF_SLUGS)[number])) {
        expect(urls).not.toContain(canonicalUrl(`/fastweb/${industry.slug}`));
      }
    }
  });

  it("registry uniqueness and gate validation pass for proof set", () => {
    const result = validateFastWebIndustryRegistry();
    expect(result.ok).toBe(true);
    expect(result.uniquenessFailures).toEqual([]);
  });

  it("proof industries have unique titles, H1s, intents, CTAs, and section orders", () => {
    const proof = getProofFastWebIndustries();
    expect(new Set(proof.map((i) => i.metadata.title)).size).toBe(3);
    expect(new Set(proof.map((i) => i.metadata.h1)).size).toBe(3);
    expect(new Set(proof.map((i) => i.searchIntent)).size).toBe(3);
    expect(new Set(proof.map((i) => i.primaryCta)).size).toBe(3);
    expect(new Set(proof.map((i) => i.hero.description)).size).toBe(3);
    expect(new Set(proof.map((i) => i.sectionOrder.join(">"))).size).toBe(3);
    expect(new Set(proof.map((i) => i.blueprint.join(">"))).size).toBe(3);
    expect(new Set(proof.map((i) => i.pageTone)).size).toBe(3);
  });

  it("rejects unknown slugs and returns paths correctly", () => {
    expect(isFastWebIndustrySlug("beauty-salon")).toBe(true);
    expect(isFastWebIndustrySlug("unknown-industry")).toBe(false);
    expect(getFastWebIndustry("fast-psychologist")).toBeUndefined();
    expect(getFastWebIndustryPath("gym")).toBe("/fastweb/gym");
    expect(getFastWebExamplePath("law-firm")).toBe("/fastweb/examples/law-firm");
  });

  it("titles avoid double brand suffix", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      expect(industry.metadata.title).not.toMatch(/\| آرایه \| آرایه/);
    }
  });

  it("canonical paths use /fastweb/[slug] pattern", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      expect(getFastWebIndustryPath(industry.slug)).toBe(`/fastweb/${industry.slug}`);
      expect(canonicalUrl(getFastWebIndustryPath(industry.slug))).toMatch(
        /^https:\/\/araaye\.com\/fastweb\//,
      );
    }
  });

  it("sitemap has no duplicate fastweb industry or example URLs", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    const fastwebUrls = urls.filter((u) => u.includes("/fastweb/"));
    expect(new Set(fastwebUrls).size).toBe(fastwebUrls.length);
  });

  it("indexable pages have lastmod from updatedAt", () => {
    const entries = buildSitemapEntries();
    for (const slug of FASTWEB_PROOF_SLUGS) {
      const entry = entries.find((e) => e.url === canonicalUrl(`/fastweb/${slug}`));
      expect(entry?.lastModified).toBeDefined();
      const lastMod = entry!.lastModified!;
      const iso = lastMod instanceof Date ? lastMod.toISOString() : String(lastMod);
      expect(iso.startsWith("2026-07-22")).toBe(true);
    }
  });

  it("published path helpers match quality gate", () => {
    expect(getPublishedFastWebIndustryPaths().sort()).toEqual(
      FASTWEB_PROOF_SLUGS.map((s) => `/fastweb/${s}`).sort(),
    );
    expect(getPublishedFastWebExamplePaths().sort()).toEqual(
      FASTWEB_PROOF_SLUGS.map((s) => `/fastweb/examples/${s}`).sort(),
    );
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
  });

  it("route files use absolute title, quality-gate robots, and 404 for unknown", () => {
    const page = readSource("app/fastweb/[industry]/page.tsx");
    expect(page).toMatch(/title:\s*\{\s*absolute:/);
    expect(page).toContain("notFound()");
    expect(page).toContain("isFastWebIndustrySlug");
    expect(page).toContain("isIndexableFastWebIndustry");

    const examplePage = readSource("app/fastweb/examples/[industry]/page.tsx");
    expect(examplePage).toContain("notFound()");
    expect(examplePage).toContain("isIndexableFastWebIndustry");
  });

  it("industry landing has exactly one H1 and section-order renderer", () => {
    const landing = readSource("components/fastweb/FastWebIndustryLanding.tsx");
    const h1Matches = landing.match(/<h1[\s\S]*?<\/h1>/g) ?? [];
    expect(h1Matches).toHaveLength(1);
    expect(landing).toContain("sectionOrder");
    expect(landing).toContain("BreadcrumbList");
  });

  it("hub page links to industry registry", () => {
    const hub = readSource("components/fastweb/FastWebLanding.tsx");
    expect(hub).toContain("سایت فوری برای چه کسب‌وکارهایی مناسب است؟");
    expect(hub).toContain("getAllFastWebIndustries");
    expect(hub).toContain("getFastWebIndustryPath");
  });

  it("each proof industry has unique problems, FAQs, and example concept", () => {
    const proof = getProofFastWebIndustries();
    const painPointSets = proof.map((i) => i.problems.map((p) => p.title).join("|"));
    const faqSets = proof.map((i) => i.faqs.map((f) => f.question).join("|"));
    const exampleNames = proof.map((i) => i.examples[0]?.conceptName);
    expect(new Set(painPointSets).size).toBe(painPointSets.length);
    expect(new Set(faqSets).size).toBe(faqSets.length);
    expect(new Set(exampleNames).size).toBe(exampleNames.length);
  });

  it("related industries reference valid slugs", () => {
    for (const industry of FASTWEB_INDUSTRIES) {
      for (const related of industry.relatedIndustries) {
        expect(isFastWebIndustrySlug(related)).toBe(true);
      }
    }
  });

  it("order wizard href preselects industry and category", () => {
    const href = getIndustryOrderHref("beauty-salon", "fastweb_industry_page");
    expect(href).toContain("/fastweb/new?");
    expect(href).toContain("industry=beauty-salon");
    expect(href).toContain("category=beauty-salon");
    expect(href).toContain("source=fastweb_industry_page");
    expect(mapIndustryToCategoryKey("gym")).toBe("gym-fitness");
    expect(mapIndustryToCategoryKey("law-firm")).toBe("law-firm");
  });

  it("wizard reads industry query param", () => {
    const wizard = readSource("components/fastweb/FastWebWizard.tsx");
    expect(wizard).toContain('searchParams.get("industry")');
    expect(wizard).toContain("mapIndustryToCategoryKey");
    expect(wizard).toContain("fastweb_industry_select");
  });

  it("draft industries fail quality gate even if someone flips indexable", () => {
    const draft = getFastWebIndustry("psychologist");
    expect(draft).toBeDefined();
    expect(draft!.reviewed).toBe(false);
    expect(evaluateIndustryQualityGate(draft!).pass).toBe(false);
  });

  it("proof industries contain no placeholder markers", () => {
    for (const industry of getProofFastWebIndustries()) {
      const blob = JSON.stringify(industry).toLowerCase();
      expect(blob).not.toContain("lorem");
      expect(blob).not.toContain("todo");
      expect(blob).not.toContain("placeholder");
      expect(blob).not.toContain("متن نمونه");
    }
  });
});
