import { describe, expect, it } from "vitest";
import { normalizeSlug, isValidSlug } from "@/lib/growth-hub/slug";
import { safeNextPath } from "@/lib/growth-hub/redirect";
import {
  generateInviteToken,
  hashInviteToken,
  verifyInviteToken,
} from "@/lib/growth-hub/inviteToken";
import {
  computeInviteExpiresAt,
  isInviteExpired,
} from "@/lib/growth-hub/inviteExpiry";
import {
  createWorkspaceSchema,
  createInviteSchema,
  inviteRoleSchema,
  memberRoleSchema,
  slugSchema,
  emailSchema,
  uuidSchema,
  inviteExpiryDaysSchema,
} from "@/lib/growth-hub/validation";
import {
  isClientRole,
  isStaffRole,
  canManageClientMembers,
  canAssignRole,
} from "@/lib/growth-hub/permissions";

describe("Growth Hub — slug validation", () => {
  it("normalizes toward a valid slug", () => {
    expect(normalizeSlug("  My Business  ")).toBe("my-business");
    expect(normalizeSlug("Café_Rād 2")).toBe("caf-rd-2");
    expect(normalizeSlug("a--b__c")).toBe("a-b-c");
  });

  it("accepts valid slugs and rejects invalid ones", () => {
    expect(isValidSlug("acme")).toBe(true);
    expect(isValidSlug("acme-co-2")).toBe(true);
    expect(isValidSlug("-acme")).toBe(false);
    expect(isValidSlug("acme-")).toBe(false);
    expect(isValidSlug("A")).toBe(false);
    expect(isValidSlug("has space")).toBe(false);
    expect(isValidSlug("قنادی")).toBe(false);
  });
});

describe("Growth Hub — safe redirect", () => {
  it("allows only internal /app paths", () => {
    expect(safeNextPath("/app/acme/home")).toBe("/app/acme/home");
    expect(safeNextPath("/app")).toBe("/app");
  });

  it("rejects open-redirect attempts", () => {
    const fb = "/app/select-workspace";
    expect(safeNextPath("https://evil.com")).toBe(fb);
    expect(safeNextPath("//evil.com")).toBe(fb);
    expect(safeNextPath("/\\evil.com")).toBe(fb);
    expect(safeNextPath("http://evil.com/app")).toBe(fb);
    expect(safeNextPath("/admin/manager")).toBe(fb);
    expect(safeNextPath("javascript:alert(1)")).toBe(fb);
    expect(safeNextPath(null)).toBe(fb);
    expect(safeNextPath(undefined)).toBe(fb);
  });
});

describe("Growth Hub — invite token hashing", () => {
  it("hashes deterministically and never equals the raw token", () => {
    const raw = "sample-token-abc";
    const h1 = hashInviteToken(raw);
    const h2 = hashInviteToken(raw);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(raw);
    expect(h1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("generates unique high-entropy tokens", () => {
    const tokens = new Set(Array.from({ length: 200 }, () => generateInviteToken()));
    expect(tokens.size).toBe(200);
  });

  it("verifies raw token against stored hash (timing-safe)", () => {
    const raw = generateInviteToken();
    const hash = hashInviteToken(raw);
    expect(verifyInviteToken(raw, hash)).toBe(true);
    expect(verifyInviteToken("wrong", hash)).toBe(false);
    expect(verifyInviteToken(raw, "deadbeef")).toBe(false);
    expect(verifyInviteToken("", hash)).toBe(false);
  });
});

describe("Growth Hub — invite expiration", () => {
  it("computes an ISO expiry in the future", () => {
    const now = Date.UTC(2026, 0, 1);
    const iso = computeInviteExpiresAt(7, now);
    expect(new Date(iso).getTime()).toBe(now + 7 * 86400000);
  });

  it("detects expired / valid / malformed invites (fail safe)", () => {
    const now = Date.UTC(2026, 0, 10);
    expect(isInviteExpired(new Date(now - 1000).toISOString(), now)).toBe(true);
    expect(isInviteExpired(new Date(now + 1000).toISOString(), now)).toBe(false);
    expect(isInviteExpired(new Date(now).toISOString(), now)).toBe(true); // boundary
    expect(isInviteExpired("not-a-date", now)).toBe(true);
  });
});

describe("Growth Hub — validation schemas", () => {
  it("validates roles", () => {
    expect(inviteRoleSchema.safeParse("client_owner").success).toBe(true);
    expect(inviteRoleSchema.safeParse("client_member").success).toBe(true);
    expect(inviteRoleSchema.safeParse("araaye_manager").success).toBe(false);
    expect(inviteRoleSchema.safeParse("araaye_admin").success).toBe(false);
    expect(memberRoleSchema.safeParse("araaye_manager").success).toBe(true);
  });

  it("normalizes email and slug", () => {
    expect(emailSchema.parse("  USER@Example.COM ")).toBe("user@example.com");
    expect(slugSchema.parse("  ACME-Co ")).toBe("acme-co");
    expect(emailSchema.safeParse("not-email").success).toBe(false);
  });

  it("validates uuid", () => {
    expect(uuidSchema.safeParse("00000000-0000-4000-8000-000000000000").success).toBe(true);
    expect(uuidSchema.safeParse("nope").success).toBe(false);
  });

  it("bounds invite expiry days with a default", () => {
    expect(inviteExpiryDaysSchema.parse(undefined)).toBe(7);
    expect(inviteExpiryDaysSchema.safeParse(0).success).toBe(false);
    expect(inviteExpiryDaysSchema.safeParse(31).success).toBe(false);
    expect(inviteExpiryDaysSchema.parse(14)).toBe(14);
  });

  it("validates workspace + invite payloads", () => {
    expect(
      createWorkspaceSchema.safeParse({ name: "Acme", slug: "acme" }).success,
    ).toBe(true);
    expect(
      createWorkspaceSchema.safeParse({ name: "A", slug: "acme" }).success,
    ).toBe(false);
    expect(
      createInviteSchema.safeParse({
        workspace_id: "00000000-0000-4000-8000-000000000000",
        phone: "09121234567",
        role: "client_owner",
        expiry_days: 7,
      }).success,
    ).toBe(true);
    expect(
      createInviteSchema.safeParse({
        workspace_id: "not-uuid",
        phone: "09121234567",
        role: "client_owner",
      }).success,
    ).toBe(false);
  });
});

describe("Growth Hub — permission helpers", () => {
  it("classifies roles", () => {
    expect(isClientRole("client_owner")).toBe(true);
    expect(isClientRole("client_member")).toBe(true);
    expect(isClientRole("araaye_manager")).toBe(false);
    expect(isStaffRole("araaye_manager")).toBe(true);
    expect(canManageClientMembers("client_owner")).toBe(true);
    expect(canManageClientMembers("client_member")).toBe(false);
  });

  it("only staff admins can assign the araaye_manager role", () => {
    expect(canAssignRole(false, "araaye_manager")).toBe(false);
    expect(canAssignRole(true, "araaye_manager")).toBe(true);
    expect(canAssignRole(false, "client_owner")).toBe(false);
    expect(canAssignRole(true, "client_owner")).toBe(true);
  });
});
