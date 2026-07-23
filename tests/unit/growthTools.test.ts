import { describe, expect, it } from "vitest";
import {
  buildGoogleReviewUrl,
  calculateSeoRoi,
  toLatinNumber,
} from "@/lib/tools/growthToolCalculations";
import {
  getHubLabel,
  getPublishedToolPages,
  getPublishedToolPaths,
} from "@/lib/tools/toolRegistry";
import { buildToolProgrammaticPage } from "@/lib/tools/toolPageContent";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";
import { canonicalUrl } from "@/lib/siteUrl";

describe("growthToolCalculations", () => {
  it("parses Persian digits", () => {
    expect(toLatinNumber("۳۰۰۰۰۰۰")).toBe(3000000);
    expect(toLatinNumber("25٪")).toBe(25);
  });

  it("builds Google review URLs from Place ID or full link", () => {
    expect(buildGoogleReviewUrl("ChIJtestPlaceId01")).toBe(
      "https://search.google.com/local/writereview?placeid=ChIJtestPlaceId01",
    );
    expect(buildGoogleReviewUrl("https://g.page/r/abc")).toBe("https://g.page/r/abc");
    expect(buildGoogleReviewUrl("not-a-link")).toBeNull();
    expect(buildGoogleReviewUrl("short")).toBeNull();
    expect(buildGoogleReviewUrl("")).toBeNull();
  });

  it("calculates ROI and break-even leads", () => {
    const result = calculateSeoRoi({
      customerValue: 4_000_000,
      monthlyLeads: 20,
      closeRatePercent: 25,
      marginPercent: 50,
      seoCost: 10_000_000,
    });

    expect(result.expectedCustomers).toBe(5);
    expect(result.grossProfit).toBe(10_000_000);
    expect(result.netProfit).toBe(0);
    expect(result.roi).toBe(0);
    expect(result.breakEvenLeads).toBe(20);
  });
});

describe("growth tool programmatic SEO", () => {
  const hubs = ["review-link", "local-seo-check", "seo-roi-calculator"] as const;

  it("publishes five industry pages per growth hub", () => {
    for (const hub of hubs) {
      const pages = getPublishedToolPages(hub);
      expect(pages.map((page) => page.slug).sort()).toEqual(
        ["clinic", "dentist", "doctor", "lawyer", "restaurant"].sort(),
      );
      expect(getHubLabel(hub).length).toBeGreaterThan(3);
    }
  });

  it("builds unique metadata and deep content for each industry page", () => {
    const titles: string[] = [];
    for (const hub of hubs) {
      for (const page of getPublishedToolPages(hub)) {
        const content = buildToolProgrammaticPage(hub, page.slug);
        expect(content).not.toBeNull();
        expect(content!.faqs.length).toBeGreaterThanOrEqual(5);
        expect(content!.bodyParagraphs.join(" ").length).toBeGreaterThan(400);
        expect(content!.meta.canonicalPath).toBe(`/${hub}/${page.slug}`);
        titles.push(content!.meta.title);
      }
    }
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("includes growth hubs and industry pages in sitemap", () => {
    const urls = buildSitemapEntries().map((entry) => entry.url);
    for (const hub of hubs) {
      expect(urls).toContain(canonicalUrl(`/${hub}`));
    }
    for (const path of getPublishedToolPaths().filter((item) =>
      hubs.some((hub) => item.startsWith(`/${hub}/`)),
    )) {
      expect(urls).toContain(canonicalUrl(path));
    }
  });
});
