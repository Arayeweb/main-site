import { describe, it, expect } from "vitest";
import {
  AI_PACKAGES,
  higherPlan,
  planRank,
  PACKAGE_LIST,
} from "@/lib/aiPackages";

describe("aiPackages — subscription logic", () => {
  it("defines starter, pro, and business packages with positive credits", () => {
    for (const id of ["starter", "pro", "business"]) {
      const pkg = AI_PACKAGES[id];
      expect(pkg.credits).toBeGreaterThan(0);
      expect(pkg.priceToman).toBeGreaterThan(0);
    }
  });

  it("ranks plans in ascending order", () => {
    expect(planRank("free")).toBeLessThan(planRank("starter"));
    expect(planRank("starter")).toBeLessThan(planRank("pro"));
    expect(planRank("pro")).toBeLessThan(planRank("business"));
  });

  it("higherPlan never downgrades an existing plan", () => {
    expect(higherPlan("pro", "starter")).toBe("pro");
    expect(higherPlan("free", "starter")).toBe("starter");
    expect(higherPlan("starter", "business")).toBe("business");
  });

  it("higherPlan upgrades when granted plan is higher", () => {
    expect(higherPlan("starter", "pro")).toBe("pro");
  });

  it("returns free rank for unknown plan strings", () => {
    expect(planRank("unknown-plan")).toBe(0);
  });

  it("PACKAGE_LIST contains all sellable packages", () => {
    expect(PACKAGE_LIST.length).toBe(3);
    expect(PACKAGE_LIST.map((p) => p.id).sort()).toEqual([
      "business",
      "pro",
      "starter",
    ]);
  });
});
