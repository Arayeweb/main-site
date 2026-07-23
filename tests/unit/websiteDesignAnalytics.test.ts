import { describe, expect, it, vi, beforeEach } from "vitest";

const pushGtmEvent = vi.fn();

vi.mock("@/lib/gtm", () => ({
  pushGtmEvent: (...args: unknown[]) => pushGtmEvent(...args),
}));

describe("website design analytics tracking", () => {
  beforeEach(() => {
    pushGtmEvent.mockClear();
  });

  it("tracking plan covers funnel stages", async () => {
    const { WEBSITE_DESIGN_TRACKING_PLAN, WEBSITE_DESIGN_FUNNEL } = await import(
      "@/lib/analytics/websiteDesignTracking"
    );
    expect(WEBSITE_DESIGN_FUNNEL).toEqual([
      "hub_view",
      "pricing_view",
      "cta_click",
      "form_start",
      "lead_submit",
    ]);
    expect(WEBSITE_DESIGN_TRACKING_PLAN.length).toBeGreaterThanOrEqual(6);
    expect(WEBSITE_DESIGN_TRACKING_PLAN.some((e) => e.event === "website_lead_submit")).toBe(true);
  });

  it("fires hub view and offer click through helpers", async () => {
    const {
      trackWebsiteDesignHubView,
      trackWebsiteDesignOfferClick,
      trackWebsiteDesignCtaClick,
      trackWebsiteDesignScrollDepth,
    } = await import("@/lib/analytics/websiteDesignTracking");

    trackWebsiteDesignHubView();
    trackWebsiteDesignCtaClick({
      button_text: "دریافت برآورد رایگان",
      cta_position: "hero",
      offer: "custom",
    });
    trackWebsiteDesignOfferClick({
      offer: "fastweb",
      offer_id: "fastweb",
      location: "cost_offer_card",
    });
    trackWebsiteDesignScrollDepth(50, "/website-design");

    const names = pushGtmEvent.mock.calls.map((c) => c[0]);
    expect(names).toContain("website_hub_view");
    expect(names).toContain("website_cta_click");
    expect(names).toContain("website_design_cta_click");
    expect(names).toContain("website_offer_click");
    expect(names).toContain("website_scroll_depth");
  });
});
