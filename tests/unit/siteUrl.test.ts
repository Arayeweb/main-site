import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  canonicalOrigin,
  canonicalUrl,
  isUnsafePublicOrigin,
  normalizePath,
  PRODUCTION_SITE_URL,
  resolvePublicOrigin,
  SITE_URL,
} from "@/lib/siteUrl";

describe("siteUrl", () => {
  it("SITE_URL is the fixed production apex origin", () => {
    expect(SITE_URL).toBe("https://araaye.com");
    expect(PRODUCTION_SITE_URL).toBe("https://araaye.com");
    expect(SITE_URL).not.toMatch(/xn--/i);
    expect(SITE_URL).not.toMatch(/www\./i);
    expect(SITE_URL).not.toMatch(/•/);
  });

  it("rejects bullet-masked and punycode origins (live incident)", () => {
    const bullets = `https://${"•".repeat(22)}`;
    expect(isUnsafePublicOrigin(bullets)).toBe(true);
    expect(isUnsafePublicOrigin("https://xn--nvgaaaaaaaaaaaaaaaaaaaaa")).toBe(true);
    expect(isUnsafePublicOrigin("https://www.araaye.com")).toBe(true);
    expect(isUnsafePublicOrigin("https://arayeweb.com")).toBe(true);
    expect(isUnsafePublicOrigin("https://foo.vercel.app")).toBe(true);
    expect(isUnsafePublicOrigin("http://localhost:3000")).toBe(true);
    expect(isUnsafePublicOrigin("https://araaye.com")).toBe(false);
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

  it("absoluteUrl and canonicalUrl always use araaye.com", () => {
    expect(absoluteUrl("/")).toBe("https://araaye.com");
    expect(canonicalUrl("/")).toBe("https://araaye.com");
    expect(absoluteUrl("/seo")).toBe("https://araaye.com/seo");
    expect(canonicalUrl("/doctors")).toBe("https://araaye.com/doctors");
    expect(absoluteUrl("/bizcard/")).toBe("https://araaye.com/bizcard");
  });

  it("resolvePublicOrigin ignores bullet-masked NEXT_PUBLIC_SITE_URL", () => {
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    const prevNode = process.env.NODE_ENV;
    const prevVercel = process.env.VERCEL_ENV;
    try {
      process.env.NEXT_PUBLIC_SITE_URL = `https://${"•".repeat(22)}`;
      process.env.NODE_ENV = "production";
      process.env.VERCEL_ENV = "production";
      expect(resolvePublicOrigin()).toBe("https://araaye.com");
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
      else process.env.NEXT_PUBLIC_SITE_URL = prev;
      process.env.NODE_ENV = prevNode;
      if (prevVercel === undefined) delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = prevVercel;
    }
  });
});
