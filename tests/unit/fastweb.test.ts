import { describe, expect, it } from "vitest";
import {
  buildSlugCandidate,
  normalizeIranPhone,
  pickTemplateKey,
  suggestedSectionsForGoal,
} from "@/lib/fastweb";
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

  it("picks clinic template for medical industry", () => {
    expect(
      pickTemplateKey({ industry: "کلینیک پوست", goal: "leads" })
    ).toBe("clinic-service");
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
      templateKey: "local-business",
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
    expect(a.templateKey).toBe("clinic-service");
    expect(a.brandColor).toBe("#123456");
    expect(parseFastWebPreviewContent(a).ok).toBe(true);
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
