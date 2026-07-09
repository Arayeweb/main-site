import { describe, expect, it } from "vitest";
import { ALL_PROMPTS, getAllPromptSlugs, getPromptBySlug } from "@/lib/prompts/promptData";
import { getIndexablePromptPaths, isPromptComplete, isPromptIndexable } from "@/lib/prompts/indexable";
import { buildAraayePromptUrl } from "@/lib/prompts/buildAraayeUrl";
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
  it("has exactly 30 unique prompts", () => {
    expect(ALL_PROMPTS).toHaveLength(30);
    const slugs = getAllPromptSlugs();
    expect(new Set(slugs).size).toBe(30);
    expect(slugs.sort()).toEqual([...EXPECTED_SLUGS].sort());
  });

  it("has unique meta titles and descriptions", () => {
    const titles = ALL_PROMPTS.map((p) => p.metaTitle);
    const descriptions = ALL_PROMPTS.map((p) => p.metaDescription);
    expect(new Set(titles).size).toBe(30);
    expect(new Set(descriptions).size).toBe(30);
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
    expect(getIndexablePromptPaths()).toHaveLength(31);
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
});
