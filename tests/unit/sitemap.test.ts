import { describe, expect, it } from "vitest";
import {
  buildSitemapEntries,
  isSitemapExcludedPath,
  SITEMAP_PATHS,
} from "@/lib/sitemapRoutes";
import { SITE_URL } from "@/lib/siteUrl";

describe("sitemapRoutes", () => {
  it("includes core marketing and SEO paths", () => {
    expect(SITEMAP_PATHS).toContain("/");
    expect(SITEMAP_PATHS).toContain("/seo");
    expect(SITEMAP_PATHS).toContain("/doctors");
    expect(SITEMAP_PATHS).toContain("/bizcard");
    expect(SITEMAP_PATHS).toContain("/adready");
    expect(SITEMAP_PATHS).toContain("/googlesabt");
    expect(SITEMAP_PATHS).toContain("/seo/doctor");
    expect(SITEMAP_PATHS).toContain("/free-seo-audit");
    expect(SITEMAP_PATHS).toContain("/prompts");
  });

  it("does not list noindex or internal routes", () => {
    const urls = SITEMAP_PATHS.join(" ");
    expect(urls).not.toMatch(/\/admin/);
    expect(urls).not.toMatch(/\/demo/);
    expect(urls).not.toMatch(/\/ai\/runs/);
    expect(urls).not.toMatch(/\/ai\/battle/);
    expect(urls).not.toMatch(/\/ai\/share/);
    expect(urls).not.toMatch(/\/b\//);
    expect(SITEMAP_PATHS).not.toContain("/seo/restaurant");
    expect(SITEMAP_PATHS).not.toContain("/website/lawyer");
  });

  it("flags excluded path patterns", () => {
    expect(isSitemapExcludedPath("/admin/sales")).toBe(true);
    expect(isSitemapExcludedPath("/demo/clinic")).toBe(true);
    expect(isSitemapExcludedPath("/ai/runs/abc")).toBe(true);
    expect(isSitemapExcludedPath("/ai/battle/1")).toBe(true);
    expect(isSitemapExcludedPath("/ai/share/foo")).toBe(true);
    expect(isSitemapExcludedPath("/b/my-card")).toBe(true);
    expect(isSitemapExcludedPath("/seo/restaurant")).toBe(true);
    expect(isSitemapExcludedPath("/seo/doctor")).toBe(false);
  });

  it("buildSitemapEntries uses SITE_URL for every entry", () => {
    const entries = buildSitemapEntries();
    expect(entries.length).toBeGreaterThanOrEqual(SITEMAP_PATHS.length);
    for (const entry of entries) {
      expect(entry.url.startsWith(SITE_URL)).toBe(true);
    }
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/seo`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/doctors`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/bizcard`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/adready`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/googlesabt`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/prompts`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/prompts/resume`);
    expect(entries.map((e) => e.url)).toContain(`${SITE_URL}/prompts/python-debug`);
  });
});
