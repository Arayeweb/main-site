import { describe, expect, it } from "vitest";
import {
  ADREADY_PACKAGES,
  getAdReadyExpiry,
  isAdReadyPackageKey,
} from "@/lib/adreadyPackages";

describe("AdReady packages", () => {
  it("exposes the launch prices", () => {
    expect(ADREADY_PACKAGES.monthly.priceToman).toBe(1_500_000);
    expect(ADREADY_PACKAGES.lifetime.priceToman).toBe(3_100_000);
    expect(ADREADY_PACKAGES.lifetime.listPriceToman).toBe(6_200_000);
  });

  it("validates package keys", () => {
    expect(isAdReadyPackageKey("monthly")).toBe(true);
    expect(isAdReadyPackageKey("lifetime")).toBe(true);
    expect(isAdReadyPackageKey("done_for_you")).toBe(false);
  });

  it("adds 30 days for monthly and extends an active term", () => {
    const paidAt = new Date("2026-07-01T00:00:00.000Z");
    expect(getAdReadyExpiry("monthly", paidAt)).toBe(
      "2026-07-31T00:00:00.000Z"
    );
    expect(
      getAdReadyExpiry(
        "monthly",
        paidAt,
        "2026-07-15T00:00:00.000Z"
      )
    ).toBe("2026-08-14T00:00:00.000Z");
  });

  it("does not expire lifetime publication", () => {
    expect(getAdReadyExpiry("lifetime")).toBeNull();
  });
});
