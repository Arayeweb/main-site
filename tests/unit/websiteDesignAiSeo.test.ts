import { describe, expect, it } from "vitest";
import {
  buildLlmsTxt,
  buildPricingMarkdown,
  buildWebsiteDesignItemListJsonLd,
  getWebsiteDesignHubListItems,
} from "@/lib/seo/aiReadableWebsiteFiles";
import {
  WEBSITE_DESIGN_AI_VISIBILITY_QUERIES,
  buildAiVisibilityChecklistMarkdown,
  createEmptyAiVisibilityLog,
} from "@/lib/seo/websiteDesignAiVisibility";
import {
  FASTWEB_START_PRICE_TOMAN,
  WEBSITE_PRICING_UPDATED_AT,
} from "@/lib/websitePricing";
import { getLinkNode } from "@/lib/seo/internalLinkMap";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";
import { canonicalUrl } from "@/lib/siteUrl";

describe("AI-readable website files", () => {
  it("llms.txt includes hub, cost, fastweb and SoT prices", () => {
    const text = buildLlmsTxt();
    expect(text).toContain("/website-design");
    expect(text).toContain("/website-design/cost");
    expect(text).toContain("/fastweb");
    expect(text).toContain("/pricing.md");
    expect(text).toContain("4,900,000");
    expect(text).toContain("25,000,000");
    expect(text).toContain(WEBSITE_PRICING_UPDATED_AT);
  });

  it("pricing.md lists FastWeb and custom tiers from SoT", () => {
    const md = buildPricingMarkdown();
    expect(md).toContain("Pricing — طراحی سایت");
    expect(md).toContain("4,900,000");
    expect(md).toContain("25,000,000");
    expect(md).toContain("80,000,000");
    expect(md).toContain(`FastWeb start price constant: ${FASTWEB_START_PRICE_TOMAN}`);
    expect(md).toContain(WEBSITE_PRICING_UPDATED_AT);
  });

  it("ItemList covers hub sales overrides and published industries", () => {
    const items = getWebsiteDesignHubListItems();
    expect(items.some((i) => i.url.endsWith("/doctors"))).toBe(true);
    expect(items.some((i) => i.url.endsWith("/website-design/restaurant"))).toBe(true);
    expect(items.some((i) => i.url.includes("/website/clinic"))).toBe(true);

    const jsonLd = buildWebsiteDesignItemListJsonLd();
    expect(jsonLd["@type"]).toBe("ItemList");
    expect(jsonLd.numberOfItems).toBe(items.length);
    expect(jsonLd.itemListElement).toHaveLength(items.length);
  });

  it("sitemap includes llms.txt and pricing.md", () => {
    const urls = buildSitemapEntries().map((e) => e.url);
    expect(urls).toContain(canonicalUrl("/llms.txt"));
    expect(urls).toContain(canonicalUrl("/pricing.md"));
  });
});

describe("website-design internal link map", () => {
  it("registers hub, cost, fastweb and key industry nodes", () => {
    for (const url of [
      "/website-design",
      "/website-design/cost",
      "/fastweb",
      "/website/clinic",
      "/website/dentist",
      "/website/cafe",
      "/website/online-shop",
    ]) {
      expect(getLinkNode(url)?.url).toBe(url);
    }
  });
});

describe("AI visibility checklist", () => {
  it("defines exactly 20 queries", () => {
    expect(WEBSITE_DESIGN_AI_VISIBILITY_QUERIES).toHaveLength(20);
    const ids = WEBSITE_DESIGN_AI_VISIBILITY_QUERIES.map((q) => q.id);
    expect(new Set(ids).size).toBe(20);
  });

  it("builds empty log and markdown template", () => {
    const log = createEmptyAiVisibilityLog("2026-07-23");
    expect(log).toHaveLength(20);
    expect(log[0]?.platforms.chatgpt.araayeCited).toBe(false);

    const md = buildAiVisibilityChecklistMarkdown("2026-07");
    expect(md).toContain("قیمت طراحی سایت");
    expect(md).toContain("Total queries: 20");
  });
});
