import { describe, expect, it } from "vitest";
import { ALL_PROMPTS, getAllPromptSlugs, getPromptBySlug } from "@/lib/prompts/promptData";
import { getIndexablePromptPaths, isPromptComplete, isPromptIndexable } from "@/lib/prompts/indexable";
import { buildAraayeComparePromptUrl, buildAraayePromptUrl } from "@/lib/prompts/buildAraayeUrl";
import { PROMPT_CATEGORIES } from "@/lib/prompts/promptTypes";

const EXPECTED_SLUGS = [
  "python-debug",
  "sql-query",
  "code-review",
  "javascript-function",
  "regex-generator",
  "resume",
  "cover-letter",
  "linkedin-bio",
  "interview-prep",
  "job-description",
  "instagram-caption",
  "telegram-post",
  "seo-article",
  "ad-copy",
  "product-description",
  "contract-draft",
  "business-plan",
  "customer-message",
  "sales-follow-up",
  "google-review-reply",
  "proposal",
  "email",
  "translation",
  "summarize",
  "rewrite",
  "idea-generation",
  "logo-image",
  "product-photo",
  "instagram-poster",
  "avatar",
  "realistic-photo",
] as const;

describe("prompt catalog", () => {
  it("has exactly 31 unique prompts", () => {
    expect(ALL_PROMPTS).toHaveLength(31);
    const slugs = getAllPromptSlugs();
    expect(new Set(slugs).size).toBe(31);
    expect(slugs.sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("has unique meta titles and descriptions", () => {
    const titles = ALL_PROMPTS.map((p) => p.metaTitle);
    const descriptions = ALL_PROMPTS.map((p) => p.metaDescription);
    expect(new Set(titles).size).toBe(31);
    expect(new Set(descriptions).size).toBe(31);
  });

  it("marks all MVP prompts complete and indexable", () => {
    for (const prompt of ALL_PROMPTS) {
      expect(isPromptComplete(prompt), prompt.slug).toBe(true);
      expect(isPromptIndexable(prompt.slug), prompt.slug).toBe(true);
      expect(prompt.canonicalPath).toBe(`/prompts/${prompt.slug}`);
      expect(prompt.faq.length).toBeGreaterThanOrEqual(5);
      expect(prompt.relatedPrompts.every((slug) => Boolean(getPromptBySlug(slug)))).toBe(true);
    }
    expect(getIndexablePromptPaths()).toContain("/prompts");
    expect(getIndexablePromptPaths()).toHaveLength(32);
  });

  it("builds compare URLs with side_by_side mode", () => {
    const url = buildAraayeComparePromptUrl("test prompt", "google-review-reply");
    const params = new URLSearchParams(url.slice(4));
    expect(params.get("mode")).toBe("side_by_side");
    expect(params.get("promptSlug")).toBe("google-review-reply");
  });

  it("covers all six categories", () => {
    for (const cat of PROMPT_CATEGORIES) {
      expect(ALL_PROMPTS.some((p) => p.category === cat.id)).toBe(true);
    }
  });

  it("builds Araaye prefill URLs with source attribution", () => {
    const url = buildAraayePromptUrl("hello world", "resume");
    expect(url.startsWith("/ai?")).toBe(true);
    const params = new URLSearchParams(url.slice(4));
    expect(params.get("prompt")).toBe("hello world");
    expect(params.get("source")).toBe("prompts");
    expect(params.get("promptSlug")).toBe("resume");
  });

  it("logo-image targets consolidated logo prompt cluster", () => {
    const logo = getPromptBySlug("logo-image");
    expect(logo).toBeDefined();
    expect(logo!.searchIntent).toBe("پرامپت ساخت لوگو");
    expect(logo!.metaTitle).toContain("پرامپت ساخت و طراحی لوگو");
    expect(logo!.title).toContain("پرامپت ساخت لوگو");
    expect(logo!.promptVariations?.length).toBeGreaterThanOrEqual(3);
    expect(logo!.basePrompt).toMatch(/Minimal flat vector logo/i);
    expect(logo!.canonicalPath).toBe("/prompts/logo-image");
  });
});
