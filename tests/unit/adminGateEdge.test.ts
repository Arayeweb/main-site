import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyAdminGateCookieEdge, isAdminGateEnabled } from "@/lib/adminGateEdge";

describe("adminGateEdge", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects literal open cookie when gate is enabled", async () => {
    vi.stubEnv("ADMIN_PANEL_ACCESS_SECRET", "super-secret-gate-key");
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-session-secret-16chars");

    expect(isAdminGateEnabled()).toBe(true);
    await expect(verifyAdminGateCookieEdge("open")).resolves.toBe(false);
  });

  it("allows any value when gate is disabled", async () => {
    vi.stubEnv("ADMIN_PANEL_ACCESS_SECRET", "");
    expect(isAdminGateEnabled()).toBe(false);
    await expect(verifyAdminGateCookieEdge("open")).resolves.toBe(true);
  });
});
