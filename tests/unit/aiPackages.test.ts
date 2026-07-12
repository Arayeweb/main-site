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
    expect(AI_PACKAGES.plus.credits).toBe(260);
    expect(AI_PACKAGES.pro.credits).toBe(600);
    expect(AI_PACKAGES.max.credits).toBe(1250);
    expect(AI_PACKAGES.plus.priceToman).toBe(299_000);
    expect(AI_PACKAGES.pro.priceToman).toBe(649_000);
    expect(AI_PACKAGES.max.priceToman).toBe(1_290_000);
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

  it("PUBLIC_PLAN_LIST includes only public self-serve plans", () => {
    const ids = PUBLIC_PLAN_LIST.map((p) => p.id);
    expect(ids).toContain(PLAN_IDS.FREE);
    expect(ids).toContain(PLAN_IDS.PRO);
    expect(ids).not.toContain(PLAN_IDS.BUSINESS);
    expect(ids).not.toContain(PLAN_IDS.TEAM_MINI);
  });

  it("free signup credits default to 10", () => {
    expect(FREE_SIGNUP_CREDITS).toBe(10);
  });

  it("highlights pro as featured", () => {
    expect(AI_PACKAGES.pro.featured).toBe(true);
    expect(AI_PACKAGES.pro.badge).toBe("محبوب‌ترین");
  });
});
