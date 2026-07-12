import { describe, expect, it } from "vitest";
import { WebsiteBriefRecommendationService } from "@/lib/websiteBrief/recommendation";
import type { WebsiteBriefInput } from "@/lib/websiteBrief/types";

function base(overrides: Partial<WebsiteBriefInput> = {}): WebsiteBriefInput {
  return {
    business_name: "کلینیک نمونه",
    business_summary: "خدمات زیبایی و پوست ارائه می‌دهیم.",
    customer_scope: "local_city",
    primary_location: "تهران",
    primary_conversion_goal: "phone_call",
    required_sections: ["contact_consultation_form", "quick_call_whatsapp"],
    acquisition_channels: ["instagram"],
    current_assets: ["active_instagram", "business_whatsapp"],
    primary_business_problem: "only_need_professional_website",
    content_readiness: "partially_ready",
    contact_name: "کاربر تست",
    contact_phone: "+989121234567",
    ...overrides,
  };
}

describe("WebsiteBriefRecommendationService", () => {
  it("scenario 1: scattered leads → lead_management", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        primary_business_problem: "scattered_leads",
        lead_followup_status: "scattered",
        required_sections: ["contact_consultation_form"],
      })
    );
    expect(result.recommendedService).toBe("lead_management");
  });

  it("scenario 2: active ads + contact goal → adready", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        primary_business_problem: "poor_advertising_conversion",
        advertising_status: "active",
        primary_conversion_goal: "phone_call",
        acquisition_channels: ["online_advertising"],
      })
    );
    expect(result.recommendedService).toBe("adready");
  });

  it("scenario 3: local business + maps not registered → maps", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        customer_scope: "local_city",
        primary_conversion_goal: "appointment_booking",
        current_assets: ["active_instagram"],
        google_maps_status: "not_registered",
        primary_business_problem: "not_visible_in_search_and_maps",
      })
    );
    expect(result.recommendedService).toBe("maps");
  });

  it("scenario 4: repetitive questions + guidance need → chatbot", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        customer_scope: "nationwide",
        primary_business_problem: "repetitive_questions",
        customer_guidance_need: "faq",
        current_assets: ["google_maps_listing", "active_instagram"],
      })
    );
    expect(result.recommendedService).toBe("chatbot");
  });

  it("scenario 5: instagram dependency + low google leads → seo", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        customer_scope: "nationwide",
        primary_business_problem: "dependent_on_instagram_and_referrals",
        google_lead_status: "very_low",
        acquisition_channels: ["instagram"],
        advertising_status: "no_plan",
        current_assets: ["google_maps_listing", "active_instagram"],
      })
    );
    expect(result.recommendedService).toBe("seo");
  });

  it("scenario 6: no clear need → none", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        primary_business_problem: "only_need_professional_website",
        google_lead_status: "regular",
        lead_followup_status: "centralized_system",
        current_assets: ["google_maps_listing", "lead_management_system"],
      })
    );
    expect(result.recommendedService).toBe("none");
  });

  it("scenario 7: priority order when multiple match — lead_management wins", () => {
    const result = WebsiteBriefRecommendationService.recommend(
      base({
        primary_business_problem: "scattered_leads",
        lead_followup_status: "scattered",
        required_sections: ["contact_consultation_form"],
        customer_scope: "local_city",
        google_maps_status: "not_registered",
        primary_conversion_goal: "phone_call",
        advertising_status: "active",
        acquisition_channels: ["online_advertising"],
        google_lead_status: "none",
      })
    );
    expect(result.recommendedService).toBe("lead_management");
  });
});
