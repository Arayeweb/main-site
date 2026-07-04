import { describe, it, expect } from "vitest";
import {
  roleCanAccess,
  modulesForRole,
  AI_OPS_ROLE_MODULES,
} from "@/lib/aiAdminAuth";

describe("aiAdminAuth — role & module access", () => {
  it("grants ai_superadmin access to all modules", () => {
    const mods = modulesForRole("ai_superadmin");
    expect(mods).toContain("users");
    expect(mods).toContain("payments");
    expect(mods).toContain("security");
  });

  it("restricts ai_finance to finance-related modules", () => {
    expect(roleCanAccess("ai_finance", "payments")).toBe(true);
    expect(roleCanAccess("ai_finance", "models")).toBe(false);
  });

  it("restricts ai_support to support modules", () => {
    expect(roleCanAccess("ai_support", "tickets")).toBe(true);
    expect(roleCanAccess("ai_support", "credits")).toBe(false);
  });

  it("returns empty modules for unknown roles", () => {
    expect(modulesForRole("unknown_role")).toEqual([]);
    expect(roleCanAccess("unknown_role", "users")).toBe(false);
  });

  it("maps admin role to full access", () => {
    expect(AI_OPS_ROLE_MODULES.admin).toEqual(AI_OPS_ROLE_MODULES.ai_superadmin);
  });
});
