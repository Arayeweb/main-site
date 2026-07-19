import { describe, expect, it } from "vitest";
import {
  getPublishedIndustryPages,
  getPublishedIndustryPaths,
  isPublishedIndustryPage,
  PROGRAMMATIC_INDUSTRY_PAGES,
} from "@/lib/seo/programmaticPages";
import { getIndustryLandingPageContent } from "@/lib/seo/pageContent";
import { buildSitemapEntries, isSitemapExcludedPath } from "@/lib/sitemapRoutes";
import { PRODUCTION_SITE_URL, SITE_URL, canonicalUrl } from "@/lib/siteUrl";

describe("programmaticPages", () => {
  it("publishes website + seo industry pages per current registry", () => {
    expect(getPublishedIndustryPages("website").map((p) => p.slug).sort()).toEqual(
      [
        "architect",
        "beauty-clinic",
        "clinic",
        "consultant",
        "dentist",
        "instagram-business",
        "lawyer",
        "photographer",
        "private-tutor",
        "service-company",
      ].sort(),
    );
    expect(getPublishedIndustryPages("seo").map((p) => p.slug).sort()).toEqual(
      ["beauty-clinic", "clinic", "dentist", "doctor", "lawyer"].sort(),
    );
    expect(isPublishedIndustryPage("website", "doctor")).toBe(false);
  });

  it("marks draft industries as noindex candidates", () => {
    expect(isPublishedIndustryPage("website", "cafe")).toBe(false);
    expect(isPublishedIndustryPage("website", "restaurant")).toBe(false);
    expect(isPublishedIndustryPage("seo", "restaurant")).toBe(false);
    expect(isPublishedIndustryPage("website", "dentist")).toBe(true);
    expect(isPublishedIndustryPage("seo", "lawyer")).toBe(true);
  });

  it("every published page has unique title and description", () => {
    const metas = getPublishedIndustryPaths("website")
      .concat(getPublishedIndustryPaths("seo"))
      .map((path) => {
        const [, product, slug] = path.split("/");
        return getIndustryLandingPageContent(product as "website" | "seo", slug as never).meta;
      });
    const titles = metas.map((m) => m.title);
    const descriptions = metas.map((m) => m.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("draft pages are excluded from sitemap paths", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    expect(urls).not.toContain(canonicalUrl("/website/cafe"));
    expect(urls).not.toContain(canonicalUrl("/seo/restaurant"));
    expect(urls).toContain(canonicalUrl("/website/dentist"));
    expect(urls).toContain(canonicalUrl("/seo/lawyer"));
  });

  it("registry has no duplicate product+slug pairs", () => {
    const keys = PROGRAMMATIC_INDUSTRY_PAGES.map((p) => `${p.productType}:${p.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("canonical domain safety", () => {
  it("SITE_URL in tests resolves to production origin", () => {
    expect(SITE_URL).toBe(PRODUCTION_SITE_URL);
  });

  it("canonical domain safety", () => {
    expect(SITE_URL).toBe(PRODUCTION_SITE_URL);
    expect(SITE_URL).not.toMatch(/xn--/i);
    expect(SITE_URL).not.toMatch(/localhost/i);
    expect(SITE_URL).not.toMatch(/www\./i);
  });

  it("canonical URLs for key pages use araaye.com", () => {
    const paths = [
      "/",
      "/seo",
      "/seo/doctor",
      "/seo/dentist",
      "/website-design",
      "/doctors",
      "/website/lawyer",
      "/fastweb",
      "/modares",
    ];
    for (const path of paths) {
      const url = canonicalUrl(path);
      expect(url).toMatch(/^https:\/\/araaye\.com/);
      expect(url).not.toMatch(/xn--|localhost|www\.araaye/i);
    }
  });

  it("sitemap entries never contain unsafe domains", () => {
    for (const entry of buildSitemapEntries()) {
      expect(entry.url).not.toMatch(/xn--|localhost|www\.araaye/i);
      expect(entry.url.startsWith(PRODUCTION_SITE_URL)).toBe(true);
    }
  });

  it("does not flag published industry paths as excluded", () => {
    expect(isSitemapExcludedPath("/seo/dentist")).toBe(false);
    expect(isSitemapExcludedPath("/website/beauty-clinic")).toBe(false);
    expect(isSitemapExcludedPath("/seo/cafe")).toBe(false);
  });
});
