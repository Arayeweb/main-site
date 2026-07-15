import { describe, expect, it } from "vitest";
import { MODARES_FAQ } from "@/lib/modaresData";
import { MODARES_SEO, modaresJsonLd } from "@/lib/modaresSeo";

describe("modaresSeo", () => {
  it("exposes the production title and description", () => {
    expect(MODARES_SEO.title).toBe("طراحی سایت مدرس و معلم خصوصی | آرایه");
    expect(MODARES_SEO.description).toContain("طراحی سایت اختصاصی برای مدرسان");
    expect(MODARES_SEO.path).toBe("/modares");
  });

  it("includes Service and FAQPage structured data without ratings", () => {
    const graph = modaresJsonLd["@graph"] as Array<Record<string, unknown>>;
    const service = graph.find((node) => node["@type"] === "Service");
    const faq = graph.find((node) => node["@type"] === "FAQPage");

    expect(service).toBeDefined();
    expect(faq).toBeDefined();
    expect(JSON.stringify(modaresJsonLd)).not.toContain("AggregateRating");
    expect(JSON.stringify(modaresJsonLd)).not.toContain("Review");

    const offers = service?.offers as Array<Record<string, unknown>>;
    expect(offers).toHaveLength(2);
    expect(offers[0]?.name).toBe("سایت حرفه‌ای مدرس");
    expect(offers[1]?.name).toBe("سایت فروش دوره");
  });

  it("matches visible FAQ copy exactly", () => {
    const faq = modaresJsonLd["@graph"].find(
      (node: Record<string, unknown>) => node["@type"] === "FAQPage",
    ) as { mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }> };

    expect(faq.mainEntity).toHaveLength(MODARES_FAQ.length);
    faq.mainEntity.forEach((item, index) => {
      expect(item.name).toBe(MODARES_FAQ[index]?.q);
      expect(item.acceptedAnswer.text).toBe(MODARES_FAQ[index]?.a);
    });
  });
});
