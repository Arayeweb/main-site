import { describe, expect, it } from "vitest";
import { buildSitemapEntries } from "@/lib/sitemapRoutes";
import { buildToolProgrammaticPage } from "@/lib/tools/toolPageContent";
import {
  buildToolProgrammaticJsonLd,
  toolProgrammaticMetadata,
} from "@/lib/tools/toolSeo";
import {
  getPublishedToolPages,
  getPublishedToolPaths,
} from "@/lib/tools/toolRegistry";

describe("free-tool programmatic SEO", () => {
  it("builds published pages for core free-tool hubs", () => {
    const samples = [
      ["bizcard", "restaurant"],
      ["qr", "instagram"],
      ["shortener", "bio-link"],
    ] as const;

    for (const [hub, slug] of samples) {
      const page = buildToolProgrammaticPage(hub, slug);
      expect(page).not.toBeNull();
      expect(page?.meta.canonicalPath).toBe(`/${hub}/${slug}`);
      expect(page?.hero.h1).toBeTruthy();
      expect(page?.faqs.length).toBeGreaterThan(0);
      expect(page?.toolCta.href).toBeTruthy();
    }
  });

  it("keeps metadata and JSON-LD intact for free tools", () => {
    const page = buildToolProgrammaticPage("qr", "instagram");
    expect(page).not.toBeNull();
    if (!page) return;

    const meta = toolProgrammaticMetadata(page);
    expect(meta.alternates?.canonical).toBe("/qr/instagram");
    const title =
      typeof meta.title === "string"
        ? meta.title
        : meta.title && typeof meta.title === "object" && "absolute" in meta.title
          ? String(meta.title.absolute)
          : "";
    expect(title).toContain("آرایه");

    const jsonLd = buildToolProgrammaticJsonLd(page);
    const types = jsonLd["@graph"].map((node) => node["@type"]);
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("WebPage");
    expect(types).toContain("FAQPage");
    expect(types).toContain("HowTo");
    expect(types).toContain("WebApplication");
  });

  it("includes free-tool paths in sitemap entries", () => {
    const paths = getPublishedToolPaths();
    expect(paths).toContain("/bizcard/restaurant");
    expect(paths).toContain("/qr/instagram");
    expect(paths).toContain("/shortener/bio-link");

    const urls = buildSitemapEntries().map((entry) => entry.url);
    for (const path of ["/bizcard/restaurant", "/qr/instagram", "/shortener/bio-link"]) {
      expect(urls.some((url) => url.endsWith(path))).toBe(true);
    }
  });

  it("keeps all published free-tool pages status=published", () => {
    for (const hub of ["bizcard", "qr", "shortener"] as const) {
      const pages = getPublishedToolPages(hub);
      expect(pages.length).toBeGreaterThan(10);
      expect(pages.every((page) => page.status === "published")).toBe(true);
    }
  });
});
