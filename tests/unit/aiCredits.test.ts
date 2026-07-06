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

describe("aiCredits — pricing & access", () => {
  it("calculates battle credit cost per tier", () => {
    expect(BATTLE_CREDIT_COST.economy).toBe(1);
    expect(BATTLE_CREDIT_COST.standard).toBe(2);
    expect(BATTLE_CREDIT_COST.premium).toBe(4);
  });

  it("allows free users direct chat; side_by_side stays starter+", () => {
    expect(canUseMode("free", "battle")).toBe(true);
    expect(canUseMode("free", "direct")).toBe(true);
    expect(canUseMode("free", "side_by_side")).toBe(false);
  });

  it("allows starter+ for direct mode", () => {
    expect(canUseMode("starter", "direct")).toBe(true);
    expect(canUseMode("pro", "side_by_side")).toBe(true);
  });

  it("computes side_by_side cost from the more expensive model tier", () => {
    const economy = getModel("economy")!;
    const precise = getModel("precise")!;
    expect(sideBySideCost(economy, precise)).toBe(4);
    expect(sideBySideCost(economy, economy)).toBe(1);
  });

  it("computes direct cost by model tier", () => {
    expect(directCost(getModel("economy")!)).toBe(1);
    expect(directCost(getModel("precise")!)).toBe(2);
  });

  it("computes image generation credit cost", () => {
    const creative = getModel("creative")!;
    expect(imageGenCost(creative)).toBeGreaterThan(0);
  });

  it("enforces plan requirements for premium direct models", () => {
    const precise = getModel("precise")!;
    expect(canUseModel("free", precise)).toBe(false);
    expect(canUseModel("pro", precise)).toBe(true);
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
