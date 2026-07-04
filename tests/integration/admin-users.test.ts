import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signUserToken, ADMIN_COOKIE } from "@/lib/auth";

const db = createTestSupabase({
  ai_users: [],
  ai_credit_ledger: [],
});

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiAuditLog", () => ({
  logAiAdminAction: vi.fn().mockResolvedValue(undefined),
}));

import { PATCH } from "@/app/api/admin/ai-ops/users/[id]/route";

describe("integration — admin PATCH /api/admin/ai-ops/users/:id", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [
        {
          id: "target-user",
          phone: "09120000000",
          plan: "free",
          credits: 10,
          status: "active",
          abuse_score: 0,
          created_at: new Date().toISOString(),
          last_login_at: null,
        },
      ],
      ai_credit_ledger: [],
    });
  });

  it("rejects unauthenticated admin requests", async () => {
    const res = await PATCH(
      makeRequest("/api/admin/ai-ops/users/target-user", {
        method: "PATCH",
        body: { plan: "pro" },
      }),
      { params: { id: "target-user" } }
    );
    expect(res.status).toBe(401);
  });

  it("rejects ai_finance role from users module", async () => {
    const token = signUserToken("admin-1", "ai_finance");
    const res = await PATCH(
      makeRequest("/api/admin/ai-ops/users/target-user", {
        method: "PATCH",
        cookies: { [ADMIN_COOKIE]: token },
        body: { plan: "pro" },
      }),
      { params: { id: "target-user" } }
    );
    expect(res.status).toBe(403);
  });

  it("updates user plan and credits for ai_superadmin", async () => {
    const token = signUserToken("admin-1", "ai_superadmin");
    const res = await PATCH(
      makeRequest("/api/admin/ai-ops/users/target-user", {
        method: "PATCH",
        cookies: { [ADMIN_COOKIE]: token },
        body: { plan: "pro", credit_delta: 20, credit_reason: "test grant" },
      }),
      { params: { id: "target-user" } }
    );
    const body = await jsonBody<{ ok: boolean; user: { plan: string; credits: number } }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.user.plan).toBe("pro");
    expect(body.user.credits).toBe(30);
    expect(db.tables.ai_credit_ledger).toHaveLength(1);
  });
});
