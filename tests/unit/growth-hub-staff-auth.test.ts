import { afterEach, describe, expect, it, vi } from "vitest";

// Fail-closed staff authorization gateway. We mock the cookie store, the admin
// session verifier, and the service client so we can assert authorization logic
// in isolation (no DB / no real cookies).

const state: { token: string | undefined; session: unknown } = {
  token: undefined,
  session: null,
};

vi.mock("server-only", () => ({}));

vi.mock("next/headers", () => ({
  cookies: () => ({ get: (_name: string) => (state.token ? { value: state.token } : undefined) }),
}));

vi.mock("@/lib/auth", () => ({
  ADMIN_COOKIE: "ary_admin",
  verifyUserToken: (_t: string | undefined) => state.session,
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => ({ __service: true }),
}));

import {
  assertGrowthHubStaffAccess,
  getGrowthHubStaffAccess,
  GrowthHubStaffAuthError,
} from "@/lib/growth-hub/staffAuth";

afterEach(() => {
  state.token = undefined;
  state.session = null;
});

describe("Growth Hub — staff authorization gateway", () => {
  it("denies when there is no admin cookie", () => {
    expect(() => assertGrowthHubStaffAccess()).toThrow(GrowthHubStaffAuthError);
    expect(getGrowthHubStaffAccess()).toBeNull();
  });

  it("denies when the token is present but invalid", () => {
    state.token = "garbage";
    state.session = null;
    expect(() => assertGrowthHubStaffAccess()).toThrow(GrowthHubStaffAuthError);
  });

  it("denies a valid session whose role is not admin", () => {
    state.token = "ok";
    state.session = { userId: "u-1", role: "manager" };
    expect(() => assertGrowthHubStaffAccess()).toThrow(GrowthHubStaffAuthError);
    state.session = { userId: "u-2", role: "sales" };
    expect(getGrowthHubStaffAccess()).toBeNull();
  });

  it("grants a typed identity + service client to an araaye_admin", () => {
    state.token = "ok";
    state.session = { userId: "admin-1", role: "admin" };
    const access = assertGrowthHubStaffAccess();
    expect(access.staff).toEqual({ userId: "admin-1", role: "araaye_admin" });
    expect(access.service).toBeTruthy();
  });
});
