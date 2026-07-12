import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BATTLE_CREDIT_COST,
  canUseModel,
  canUseMode,
  directCost,
  imageGenCost,
  pickBattleTier,
  resolveCompareModel,
  resolveImageModel,
  resolveUserModel,
  sideBySideCost,
  MAX_PROMPT_CHARS,
} from "@/lib/aiCredits";
import { getModel } from "@/lib/aiModels";
import { webSearchSurcharge } from "@/lib/aiPricingConfig";

describe("aiCredits — pricing & access", () => {
  it("calculates battle credit cost per tier", () => {
    expect(BATTLE_CREDIT_COST.economy).toBe(1);
    expect(BATTLE_CREDIT_COST.standard).toBe(2);
    expect(BATTLE_CREDIT_COST.premium).toBe(8);
  });

  it("allows free users direct + compare; council stays available at mode gate", () => {
    expect(canUseMode("free", "battle")).toBe(true);
    expect(canUseMode("free", "direct")).toBe(true);
    expect(canUseMode("free", "side_by_side")).toBe(true);
  });

  it("allows starter+ for direct mode", () => {
    expect(canUseMode("starter", "direct")).toBe(true);
    expect(canUseMode("pro", "side_by_side")).toBe(true);
  });

  it("computes side_by_side cost from the more expensive model", () => {
    const economy = getModel("economy")!;
    const precise = getModel("precise")!;
    expect(sideBySideCost(economy, precise)).toBe(15);
    expect(sideBySideCost(economy, economy)).toBe(1);
  });

  it("computes direct cost per model id", () => {
    expect(directCost(getModel("economy")!)).toBe(1);
    expect(directCost(getModel("fast")!)).toBe(2);
    expect(directCost(getModel("creative")!)).toBe(5);
    expect(directCost(getModel("precise")!)).toBe(15);
    expect(directCost(getModel("critic")!)).toBe(15);
  });

  it("adds web search surcharge", () => {
    const economy = getModel("economy")!;
    expect(directCost(economy, { webSearch: true })).toBe(1 + webSearchSurcharge());
  });

  it("computes image generation credit cost", () => {
    expect(imageGenCost(getModel("image-lite")!)).toBe(20);
    expect(imageGenCost(getModel("image-nano")!)).toBe(35);
    expect(imageGenCost(getModel("image-gpt")!)).toBe(60);
  });

  it("allows paid users to use premium direct models", () => {
    const precise = getModel("precise")!;
    expect(canUseModel("free", precise)).toBe(false);
    expect(canUseModel("starter", precise)).toBe(true);
  });

  it("resolveUserModel returns plan_upgrade_required for free on premium model", () => {
    const result = resolveUserModel("precise", "free");
    expect(result).toEqual({ error: "plan_upgrade_required" });
  });

  it("resolveUserModel returns model for eligible plan", () => {
    const result = resolveUserModel("economy", "starter");
    expect(result).toHaveProperty("id", "economy");
  });

  it("resolveCompareModel rejects invalid model ids", () => {
    expect(resolveCompareModel("not-a-model", "pro")).toEqual({ error: "invalid_model" });
  });

  it("resolveImageModel rejects chat models", () => {
    expect(resolveImageModel("precise", "pro")).toEqual({ error: "invalid_model" });
  });

  it("blocks free users from image generation", () => {
    expect(resolveImageModel("image-lite", "free")).toEqual({
      error: "plan_upgrade_required",
    });
  });

  it("pickBattleTier returns economy for free plan", () => {
    expect(pickBattleTier("free")).toBe("economy");
  });

  it("pickBattleTier returns standard for starter plan", () => {
    expect(pickBattleTier("starter")).toBe("standard");
  });

  it("pickBattleTier can return premium for pro plan (random)", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(pickBattleTier("pro")).toBe("premium");
    vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(pickBattleTier("pro")).toBe("standard");
  });

  it("exports MAX_PROMPT_CHARS as 4000", () => {
    expect(MAX_PROMPT_CHARS).toBe(4000);
  });
});
