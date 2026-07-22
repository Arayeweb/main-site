import { describe, expect, it } from "vitest";
import {
  buildSlugCandidate,
  normalizeIranPhone,
  suggestedSectionsForGoal,
} from "@/lib/fastweb";
import {
  defaultSectionsForCategory,
  getAllFastWebCategories,
  getFastWebCategory,
  pickCategoryKey,
  pickCoreKey,
} from "@/lib/fastwebCategories";
import {
  buildDraftPreview,
  parseFastWebPreviewContent,
} from "@/lib/fastwebContent";
import { buildThemeFromBrand } from "@/lib/fastwebTemplates";

describe("fastweb helpers", () => {
  it("suggests sections from goal", () => {
    expect(suggestedSectionsForGoal("portfolio")).toContain("portfolio");
    expect(suggestedSectionsForGoal("leads")).toContain("services");
  });

  it("exposes exactly 10 sellable categories", () => {
    expect(getAllFastWebCategories()).toHaveLength(10);
  });

  it("picks professional category + core for medical industry", () => {
    expect(pickCategoryKey({ industry: "کلینیک پوست", goal: "leads" })).toBe(
      "professional"
    );
    expect(pickCoreKey({ industry: "کلینیک پوست", goal: "leads" })).toBe(
      "professional"
    );
  });

  it("picks gym-fitness category for fitness industry", () => {
    expect(pickCategoryKey({ industry: "باشگاه بدنسازی" })).toBe("gym-fitness");
    expect(getFastWebCategory("gym-fitness")?.core).toBe("service");
  });

  it("picks law-firm category and defaults its blocks", () => {
    expect(pickCategoryKey({ industry: "دفتر وکالت" })).toBe("law-firm");
    const sections = defaultSectionsForCategory("law-firm");
    expect(sections).toContain("caseStudies");
    expect(sections).toContain("credentials");
    expect(sections).toContain("hero");
    expect(sections).toContain("contact");
  });

  it("respects an explicit categoryKey override", () => {
    expect(
      pickCategoryKey({ industry: "کلینیک پوست", categoryKey: "beauty-salon" })
    ).toBe("beauty-salon");
  });

  it("normalizes iran phone", () => {
    expect(normalizeIranPhone("09121234567")).toBe("09121234567");
    expect(normalizeIranPhone("9121234567")).toBe("09121234567");
    expect(normalizeIranPhone("989121234567")).toBe("09121234567");
    expect(normalizeIranPhone("123")).toBeNull();
  });

  it("builds slug candidate", () => {
    expect(buildSlugCandidate("My Cafe")).toMatch(/my-cafe|cafe/i);
    expect(buildSlugCandidate("کافه محلی")).toMatch(/^biz-/);
    expect(buildSlugCandidate("My Cafe", "custom-shop")).toBe("custom-shop");
  });

  it("suggests expertise sections", () => {
    expect(suggestedSectionsForGoal("expertise")).toContain("portfolio");
  });

  it("parses preview content", () => {
    const result = parseFastWebPreviewContent({
      headline: "عنوان",
      subheadline: "زیرتیتر",
      aboutText: "درباره",
      offerings: [{ title: "خدمت", description: "توضیح" }],
      faq: [{ question: "سوال؟", answer: "جواب" }],
      ctaText: "تماس",
      formTitle: "فرم",
      seoTitle: "سئو",
      seoDescription: "توضیح سئو",
      categoryKey: "service-business",
      templateKey: "service",
      styleKey: "modern",
      brandColor: "#0F4C5C",
      sections: ["hero", "about", "contact"],
    });
    expect(result.ok).toBe(true);
  });

  it("builds a deterministic preview from a brief (no AI)", () => {
    const brief = {
      goal: "leads" as const,
      businessName: "کلینیک آریا",
      industry: "کلینیک پوست",
      city: "اصفهان",
      shortDescription: "کلینیک تخصصی پوست و زیبایی با کادر مجرب.",
      offerings: "درمان پوست\nلیزر\nمشاوره",
      style: "formal" as const,
      brandColor: "#123456",
    };
    const a = buildDraftPreview(brief);
    const b = buildDraftPreview(brief);
    expect(a).toEqual(b);
    expect(a.headline).toContain("کلینیک آریا");
    expect(a.headline).toContain("اصفهان");
    expect(a.offerings).toHaveLength(3);
    expect(a.categoryKey).toBe("professional");
    expect(a.templateKey).toBe("professional");
    expect(a.brandColor).toBe("#123456");
    expect(parseFastWebPreviewContent(a).ok).toBe(true);
  });

  it("builds a preview with category-specific blocks (gym membership + schedule)", () => {
    const preview = buildDraftPreview({
      businessName: "باشگاه پارس",
      industry: "باشگاه بدنسازی",
      categoryKey: "gym-fitness",
    });
    expect(preview.categoryKey).toBe("gym-fitness");
    expect(preview.sections).toContain("pricing");
    expect(preview.sections).toContain("schedule");
    expect(preview.pricingPlans.length).toBeGreaterThan(0);
    expect(preview.schedule.length).toBeGreaterThan(0);
  });

  it("preview falls back gracefully for an empty brief", () => {
    const preview = buildDraftPreview({});
    expect(preview.headline).toBeTruthy();
    expect(preview.subheadline).toBeTruthy();
    expect(preview.offerings.length).toBeGreaterThan(0);
    expect(preview.sections.length).toBeGreaterThan(0);
  });

  it("builds theme from brand color", () => {
    const theme = buildThemeFromBrand("#C45C26", "warm");
    expect(theme.brand.toLowerCase()).toBe("#c45c26");
    expect(theme.surface).toBeTruthy();
  });
});
