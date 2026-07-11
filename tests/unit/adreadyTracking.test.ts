import { describe, expect, it } from "vitest";
import {
  formStartDedupKey,
  pageViewDedupKey,
  trackCampaignEvent,
} from "@/lib/adreadyTracking";

describe("adreadyTracking", () => {
  it("builds dedup keys per slug", () => {
    expect(pageViewDedupKey("my-campaign")).toBe("__ar_pv_my-campaign");
    expect(formStartDedupKey("my-campaign")).toBe("__ar_fs_my-campaign");
  });

  it("pushes structured events to dataLayer when window exists", () => {
    const dataLayer: Record<string, unknown>[] = [];
    const originalWindow = globalThis.window;
    // @ts-expect-error test shim
    globalThis.window = { dataLayer };

    trackCampaignEvent("campaign_page_view", {
      slug: "demo",
      visitorId: "v1",
    });

    expect(dataLayer).toEqual([
      { event: "campaign_page_view", slug: "demo", visitorId: "v1" },
    ]);

    globalThis.window = originalWindow;
  });
});
