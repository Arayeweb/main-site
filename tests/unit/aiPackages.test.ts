import { describe, it, expect } from "vitest";
import {
  AI_PACKAGES,
  FREE_SIGNUP_CREDITS,
  higherPlan,
  planRank,
  PACKAGE_LIST,
  PLAN_IDS,
} from "@/lib/aiPackages";
import { PUBLIC_PLAN_LIST } from "@/lib/aiPricingConfig";

describe("aiPackages — subscription logic", () => {
  it("defines checkout packages with positive credits and prices", () => {
    for (const id of ["starter", "plus", "pro", "max"]) {
      const pkg = AI_PACKAGES[id];
      expect(pkg.credits).toBeGreaterThan(0);
      expect(pkg.priceToman).toBeGreaterThan(0);
      expect(pkg.checkoutEnabled).toBe(true);
    }
  });

  it("assigns new credit amounts per plan", () => {
    expect(AI_PACKAGES.starter.credits).toBe(80);
    expect(AI_PACKAGES.plus.credits).toBe(240);
    expect(AI_PACKAGES.pro.credits).toBe(550);
    expect(AI_PACKAGES.max.credits).toBe(1200);
  });

  it("ranks plans in ascending order", () => {
    expect(planRank("free")).toBeLessThan(planRank("starter"));
    expect(planRank("starter")).toBeLessThan(planRank("plus"));
    expect(planRank("plus")).toBeLessThan(planRank("pro"));
    expect(planRank("pro")).toBeLessThan(planRank("max"));
    expect(planRank("max")).toBeLessThan(planRank("business"));
  });

  it("higherPlan never downgrades an existing plan", () => {
    expect(higherPlan("pro", "starter")).toBe("pro");
    expect(higherPlan("free", "starter")).toBe("starter");
    expect(higherPlan("plus", "max")).toBe("max");
  });

  it("higherPlan upgrades when granted plan is higher", () => {
    expect(higherPlan("starter", "pro")).toBe("pro");
    expect(higherPlan("plus", "max")).toBe("max");
  });

  it("returns free rank for unknown plan strings", () => {
    expect(planRank("unknown-plan")).toBe(0);
  });

  it("PACKAGE_LIST contains only checkout-enabled packages", () => {
    expect(PACKAGE_LIST.length).toBe(4);
    expect(PACKAGE_LIST.every((p) => p.checkoutEnabled)).toBe(true);
  });

  it("PUBLIC_PLAN_LIST includes free and business display plans", () => {
    const ids = PUBLIC_PLAN_LIST.map((p) => p.id);
    expect(ids).toContain(PLAN_IDS.FREE);
    expect(ids).toContain(PLAN_IDS.BUSINESS);
    expect(ids).toContain(PLAN_IDS.PRO);
  });

  it("free signup credits default to 20", () => {
    expect(FREE_SIGNUP_CREDITS).toBe(20);
  });

  it("highlights pro as featured", () => {
    expect(AI_PACKAGES.pro.featured).toBe(true);
    expect(AI_PACKAGES.pro.badge).toBe("محبوب‌ترین");
  });
});
