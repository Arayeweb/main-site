import { describe, expect, it } from "vitest";
import {
  canonicalEventName,
  funnelStageForEvent,
  productAreaFromPath,
  shouldTrackPath,
} from "@/lib/analytics/core";

describe("analytics core taxonomy", () => {
  it("maps legacy conversion events without changing product-specific detail", () => {
    expect(canonicalEventName("generate_lead")).toBe("lead_submitted");
    expect(canonicalEventName("begin_checkout")).toBe("checkout_started");
    expect(canonicalEventName("website_design_lead_submit")).toBe("lead_submitted");
    expect(canonicalEventName("doctors_pricing_view")).toBe("pricing_viewed");
    expect(canonicalEventName("prompt_copy")).toBe("prompt_copy");
  });

  it("assigns funnel stages consistently", () => {
    expect(funnelStageForEvent("page_view")).toBe("awareness");
    expect(funnelStageForEvent("form_started")).toBe("intent");
    expect(funnelStageForEvent("generate_lead")).toBe("lead");
    expect(funnelStageForEvent("purchase")).toBe("revenue");
  });

  it("classifies all major Araaye product surfaces", () => {
    expect(productAreaFromPath("/ai/chat")).toBe("ai");
    expect(productAreaFromPath("/app/acme/home")).toBe("growth_hub");
    expect(productAreaFromPath("/fastweb/order")).toBe("fastweb");
    expect(productAreaFromPath("/website-design")).toBe("website_design");
    expect(productAreaFromPath("/qr")).toBe("free_tools");
  });

  it("excludes internal operational routes", () => {
    expect(shouldTrackPath("/admin/manager")).toBe(false);
    expect(shouldTrackPath("/dev/events")).toBe(false);
    expect(shouldTrackPath("/ai")).toBe(true);
  });
});

