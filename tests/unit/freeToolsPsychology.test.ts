import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  getFeaturedToolPages,
  getPublishedToolPages,
} from "@/lib/tools/toolRegistry";
import ToolHubIndex from "@/components/tools/ToolHubIndex";
import ToolProgrammaticLanding from "@/components/tools/ToolProgrammaticLanding";
import QrTool from "@/components/qr/QrTool";
import ShortenerTool from "@/components/shortener/ShortenerTool";

const ROOT = process.cwd();

function source(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("free-tool choice architecture", () => {
  it("loads all optimized tool components", () => {
    expect(typeof ToolHubIndex).toBe("function");
    expect(typeof ToolProgrammaticLanding).toBe("function");
    expect(typeof QrTool).toBe("function");
    expect(typeof ShortenerTool).toBe("function");
  });

  it("offers six focused defaults per free-tool hub", () => {
    for (const hub of ["bizcard", "qr", "shortener"] as const) {
      const featured = getFeaturedToolPages(hub);
      expect(featured).toHaveLength(6);
      expect(new Set(featured.map((page) => page.slug)).size).toBe(6);
      expect(featured.every((page) => page.status === "published")).toBe(true);
    }
  });

  it("features six googlesabt industries without dumping the full directory", () => {
    const featured = getFeaturedToolPages("googlesabt");
    expect(featured).toHaveLength(6);
    expect(featured.every((page) => page.pageType === "industry")).toBe(true);
  });

  it("keeps all published pages discoverable beyond featured defaults", () => {
    for (const hub of ["bizcard", "qr", "shortener"] as const) {
      const published = getPublishedToolPages(hub);
      const featured = getFeaturedToolPages(hub);
      expect(published.length).toBeGreaterThanOrEqual(featured.length);
      for (const page of featured) {
        expect(published.some((candidate) => candidate.slug === page.slug)).toBe(true);
      }
    }
  });
});

describe("free-tool ethical psychology copy", () => {
  it("states zero price and low friction without fake urgency", () => {
    const sources = [
      source("components/qr/QrHero.tsx"),
      source("components/shortener/ShortenerHero.tsx"),
      source("components/bizcard/BizcardHero.tsx"),
    ].join("\n");

    expect(sources).toContain("۰ تومان");
    expect(sources).toContain("بدون ثبت‌نام");
    expect(sources).not.toMatch(/فقط امروز|فرصت محدود|آخرین فرصت/);
  });

  it("uses immediate-result and progress cues in interactive tools", () => {
    const qr = source("components/qr/QrTool.tsx");
    const shortener = source("components/shortener/ShortenerTool.tsx");

    expect(qr).toContain("نتیجه فوری");
    expect(qr).toMatch(/۰۳\s*\/\s*دانلود|۳\.\s*دانلود/);
    expect(shortener).toContain("نتیجه فوری");
    expect(shortener).toContain("۳. کپی");
  });

  it("does not display an unsupported star rating in bizcard hero", () => {
    expect(source("components/bizcard/BizcardHero.tsx")).not.toContain("★★★★★");
  });
});

describe("free-tool editorial design system", () => {
  it("uses dedicated tool rhythm classes instead of generic section-py on hubs", () => {
    const pages = [
      source("app/qr/page.tsx"),
      source("app/shortener/page.tsx"),
      source("app/bizcard/page.tsx"),
    ].join("\n");

    expect(pages).toContain('className="tool-page"');
  });

  it("keeps shared shell and hub index on editorial tokens", () => {
    const landing = source("components/tools/ToolProgrammaticLanding.tsx");
    const index = source("components/tools/ToolHubIndex.tsx");
    const css = source("app/globals.css");

    expect(landing).toContain("tool-page");
    expect(landing).toContain('id="tool-cta"');
    expect(index).toContain("ToolEditorialHeader");
    expect(css).toContain(".tool-section");
    expect(css).toContain(".tool-panel");
    expect(css).toContain("prefers-reduced-motion");
  });

  it("places interactive tools immediately after heroes on free hubs", () => {
    expect(source("app/qr/page.tsx")).toMatch(/<QrHero \/>\s*<QrTool \/>/);
    expect(source("app/shortener/page.tsx")).toMatch(
      /<ShortenerHero \/>\s*<ShortenerTool \/>/,
    );
    expect(source("app/bizcard/page.tsx")).toMatch(
      /<BizcardHero[\s\S]*?\/>\s*<BizcardBuilder \/>/,
    );
  });

  it("tracks free-tool funnel events for start and completion", () => {
    const tracking = source("lib/analytics/freeToolTracking.ts");
    const qr = source("components/qr/QrTool.tsx");
    const shortener = source("components/shortener/ShortenerTool.tsx");
    const bizcard = source("components/bizcard/BizcardBuilder.tsx");

    expect(tracking).toContain('pushGtmEvent("free_tool_event"');
    expect(qr).toContain('trackFreeToolEvent("qr", "start")');
    expect(qr).toContain('trackFreeToolEvent("qr", "complete"');
    expect(shortener).toContain('trackFreeToolEvent("shortener", "complete"');
    expect(bizcard).toContain('trackFreeToolEvent("bizcard", "complete"');
  });
});
