import { describe, expect, it } from "vitest";
import {
  buildPricingSnapshot,
  creditsForProviderCost,
  getPricingConfig,
  minCreditsForModel,
  providerCostToCredits,
  resolveProviderCostUsd,
} from "@/lib/ai/pricing/costToCredits";

describe("costToCredits — cost-based AI pricing", () => {
  const config = {
    usdToToman: 220_000,
    multiplier: 2.2,
    creditValueToman: 1_000,
    minGrossMargin: 0.45,
  };

  it("converts provider USD cost to credits", () => {
    expect(providerCostToCredits(0.02, config)).toBe(10);
  });

  it("applies model minimum credits", () => {
    expect(minCreditsForModel("economy")).toBe(1);
    expect(minCreditsForModel("precise")).toBe(7);
    expect(minCreditsForModel("critic")).toBe(10);
    expect(creditsForProviderCost("precise", 0.0001, 10, 10, config)).toBe(7);
  });

  it("builds immutable pricing snapshots", () => {
    const snapshot = buildPricingSnapshot({
      modelId: "precise",
      providerCostUsd: 0.02,
      creditsCharged: 10,
      config,
    });
    expect(snapshot.usdToToman).toBe(220_000);
    expect(snapshot.revenueToman).toBe(10_000);
    expect(snapshot.grossProfitToman).toBe(5_600);
    expect(snapshot.actualModel).toBe("openai/gpt-4o");
    expect(snapshot.displayedModel).toBe("GPT-4o");
  });

  it("uses safe defaults from environment", () => {
    expect(getPricingConfig().usdToToman).toBeGreaterThan(0);
    expect(getPricingConfig().multiplier).toBeGreaterThan(1);
  });

  it("uses a conservative estimate and flags missing provider cost", () => {
    const resolved = resolveProviderCostUsd("precise", 0, 100, 200);
    expect(resolved.missing).toBe(true);
    expect(resolved.costUsd).toBeGreaterThan(0);

    const snapshot = buildPricingSnapshot({
      modelId: "precise",
      providerCostUsd: resolved.costUsd,
      providerCostMissing: resolved.missing,
      creditsCharged: 7,
      config,
    });
    expect(snapshot.pricingFlags).toContain("missing_provider_cost");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1])(
    "rejects invalid provider cost %s",
    (value) => {
      expect(() => providerCostToCredits(value, config)).toThrow("Invalid provider cost");
    }
  );
});
