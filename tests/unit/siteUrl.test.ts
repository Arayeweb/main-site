import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  canonicalOrigin,
  canonicalUrl,
  normalizePath,
  SITE_URL,
} from "@/lib/siteUrl";

describe("siteUrl", () => {
  it("SITE_URL has no trailing slash and is a valid origin", () => {
    expect(SITE_URL).toMatch(/^https?:\/\/[^/]+$/);
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("canonicalOrigin strips www and trailing slash", () => {
    expect(canonicalOrigin("https://www.araaye.com/")).toBe("https://araaye.com");
    expect(canonicalOrigin("https://araaye.com")).toBe("https://araaye.com");
    expect(canonicalOrigin("http://www.localhost:3000/")).toBe("http://localhost:3000");
  });

  it("canonicalOrigin adds https when protocol is missing", () => {
    expect(canonicalOrigin("araaye.com")).toBe("https://araaye.com");
    expect(() => new URL(canonicalOrigin("araaye.com"))).not.toThrow();
  });

  it("normalizePath keeps root and removes trailing slashes", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("")).toBe("/");
    expect(normalizePath("/seo/")).toBe("/seo");
    expect(normalizePath("seo")).toBe("/seo");
  });

  it("absoluteUrl and canonicalUrl match for site paths", () => {
    expect(absoluteUrl("/")).toBe(SITE_URL);
    expect(canonicalUrl("/")).toBe(SITE_URL);
    expect(absoluteUrl("/seo")).toBe(`${SITE_URL}/seo`);
    expect(canonicalUrl("/doctors")).toBe(`${SITE_URL}/doctors`);
    expect(absoluteUrl("/bizcard/")).toBe(`${SITE_URL}/bizcard`);
  });
});
