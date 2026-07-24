import { describe, expect, it } from "vitest";
import {
  inferCampaignFromReferrer,
  normalizeUtmParams,
  normalizeUtmValue,
  trafficTypeFor,
} from "@/lib/utm";

describe("UTM attribution", () => {
  it("normalizes campaign naming without dropping Persian text", () => {
    expect(normalizeUtmValue(" Summer-Sale 2026 ")).toBe("summer_sale_2026");
    expect(normalizeUtmValue("کمپین تابستان")).toBe("کمپین_تابستان");
    expect(
      normalizeUtmParams({
        utm_source: "Google ",
        utm_medium: " Paid-Social ",
        utm_campaign: "Launch A",
      }),
    ).toEqual({
      utm_source: "google",
      utm_medium: "paid_social",
      utm_campaign: "launch_a",
    });
  });

  it("classifies search, social, referral and direct referrers", () => {
    expect(
      inferCampaignFromReferrer("https://www.google.com/search?q=araaye", "https://araaye.com"),
    ).toEqual({
      params: { utm_source: "google", utm_medium: "organic" },
      trafficType: "organic",
    });
    expect(
      inferCampaignFromReferrer("https://instagram.com/araaye", "https://araaye.com").trafficType,
    ).toBe("social");
    expect(
      inferCampaignFromReferrer("https://partner.example/page", "https://araaye.com"),
    ).toEqual({
      params: { utm_source: "partner.example", utm_medium: "referral" },
      trafficType: "referral",
    });
    expect(inferCampaignFromReferrer("", "https://araaye.com").trafficType).toBe("direct");
  });

  it("recognizes paid traffic by medium", () => {
    expect(trafficTypeFor({ utm_source: "google", utm_medium: "cpc" })).toBe("paid");
    expect(trafficTypeFor({ utm_source: "google", utm_medium: "organic" })).toBe("organic");
  });
});

