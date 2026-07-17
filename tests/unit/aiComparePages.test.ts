import { describe, expect, it } from "vitest";
import {
  COMPARE_PAGES,
  getAllCompareSlugs,
  getComparePage,
  resolveCompareModels,
} from "@/lib/aiComparePageData";

describe("aiComparePageData", () => {
  it("has unique slugs for all compare pages", () => {
    const slugs = getAllCompareSlugs();
    expect(slugs.length).toBe(7);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("includes the four primary pair comparisons and three usecase pages", () => {
    expect(getComparePage("chatgpt-vs-gemini")?.kind).toBe("pair");
    expect(getComparePage("chatgpt-vs-claude")?.kind).toBe("pair");
    expect(getComparePage("claude-vs-gemini")?.kind).toBe("pair");
    expect(getComparePage("chatgpt-vs-deepseek")?.kind).toBe("pair");
    expect(getComparePage("best-ai-for-coding")?.kind).toBe("usecase");
    expect(getComparePage("best-ai-for-persian")?.kind).toBe("usecase");
    expect(getComparePage("best-ai-for-content")?.kind).toBe("usecase");
  });

  it("resolves valid compare model ids for every page", () => {
    for (const page of COMPARE_PAGES) {
      const { modelA, modelB } = resolveCompareModels(page);
      expect(modelA?.id).toBe(page.modelAId);
      expect(modelB?.id).toBe(page.modelBId);
      expect(page.dimensions).toHaveLength(6);
      expect(page.relatedSlugs.every((s) => getComparePage(s))).toBe(true);
    }
  });
});
