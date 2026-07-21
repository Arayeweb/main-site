import { describe, expect, it } from "vitest";
import { ALL_PROMPTS, getAllPromptSlugs, getPromptBySlug } from "@/lib/prompts/promptData";
import {
  getIndexableCategoryPaths,
  getIndexablePromptPaths,
  isPromptComplete,
  isPromptIndexable,
} from "@/lib/prompts/indexable";
import { buildAraayeComparePromptUrl, buildAraayePromptUrl } from "@/lib/prompts/buildAraayeUrl";
import { PROMPT_CATEGORIES } from "@/lib/prompts/promptTypes";

const LEGACY_SLUGS = [
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
  it("keeps legacy prompts and adds seed prompts", () => {
    const slugs = getAllPromptSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(ALL_PROMPTS.length).toBeGreaterThanOrEqual(55);
    for (const slug of LEGACY_SLUGS) {
      expect(slugs).toContain(slug);
    }
  });

  it("has unique meta titles and descriptions", () => {
    const titles = ALL_PROMPTS.map((p) => p.metaTitle);
    const descriptions = ALL_PROMPTS.map((p) => p.metaDescription);
    expect(new Set(titles).size).toBe(ALL_PROMPTS.length);
    expect(new Set(descriptions).size).toBe(ALL_PROMPTS.length);
  });

  it("marks all prompts complete and indexable", () => {
    for (const prompt of ALL_PROMPTS) {
      expect(isPromptComplete(prompt), prompt.slug).toBe(true);
      expect(isPromptIndexable(prompt.slug), prompt.slug).toBe(true);
      expect(prompt.canonicalPath).toBe(`/prompts/${prompt.slug}`);
      expect(prompt.faq.length).toBeGreaterThanOrEqual(3);
      expect(prompt.relatedPrompts.every((slug) => Boolean(getPromptBySlug(slug)))).toBe(true);
    }
    const paths = getIndexablePromptPaths();
    expect(paths).toContain("/prompts");
    expect(paths).toHaveLength(1 + PROMPT_CATEGORIES.length + ALL_PROMPTS.length);
  });

  it("includes indexable category hub paths", () => {
    const categoryPaths = getIndexableCategoryPaths();
    expect(categoryPaths).toHaveLength(PROMPT_CATEGORIES.length);
    for (const cat of PROMPT_CATEGORIES) {
      expect(categoryPaths).toContain(`/prompts/category/${cat.id}`);
    }
  });

  it("builds compare URLs with side_by_side mode", () => {
    const url = buildAraayeComparePromptUrl("test prompt", "google-review-reply");
    const params = new URLSearchParams(url.slice(4));
    expect(params.get("mode")).toBe("side_by_side");
    expect(params.get("promptSlug")).toBe("google-review-reply");
  });

  it("covers all ten categories with at least one prompt", () => {
    expect(PROMPT_CATEGORIES).toHaveLength(10);
    for (const cat of PROMPT_CATEGORIES) {
      expect(
        ALL_PROMPTS.some((p) => p.category === cat.id),
        `missing prompts for ${cat.id}`
      ).toBe(true);
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
    expect(logo!.category).toBe("design");
    expect(logo!.tags).toContain("image");
    expect(logo!.searchIntent).toBe("پرامپت ساخت لوگو");
    expect(logo!.metaTitle).toContain("پرامپت ساخت و طراحی لوگو");
    expect(logo!.title).toContain("پرامپت ساخت لوگو");
    expect(logo!.promptVariations?.length).toBeGreaterThanOrEqual(3);
    expect(logo!.basePrompt).toMatch(/Minimal flat vector logo/i);
    expect(logo!.canonicalPath).toBe("/prompts/logo-image");
  });

  it("remaps career and social prompts into the new taxonomy", () => {
    expect(getPromptBySlug("resume")!.category).toBe("writing");
    expect(getPromptBySlug("instagram-caption")!.category).toBe("social");
    expect(getPromptBySlug("translation")!.category).toBe("language");
    expect(getPromptBySlug("idea-generation")!.category).toBe("productivity");
  });
});
