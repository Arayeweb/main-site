import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest } from "../helpers/request";

const db = createTestSupabase({
  ai_users: [],
  ai_orders: [],
  ai_promo_codes: [],
  ai_referral_codes: [],
  ai_referral_redemptions: [],
});

const mockZibalVerify = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/zibal", () => ({
  zibalVerify: (...args: unknown[]) => mockZibalVerify(...args),
}));

import { GET } from "@/app/api/ai/verify/route";

describe("integration — /api/ai/verify payment callback", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [{ id: "user-1", plan: "free", credits: 5 }],
      ai_orders: [
        {
          id: "order-1",
          user_id: "user-1",
          package_id: "starter",
          amount_toman: 79000,
          credits_granted: 50,
          status: "pending",
          zibal_track_id: "track-abc",
          promo_code: null,
          referral_code: null,
          referrer_user_id: null,
        },
      ],
      ai_promo_codes: [],
      ai_referral_codes: [],
      ai_referral_redemptions: [],
    });
    mockZibalVerify.mockReset();
    mockZibalVerify.mockResolvedValue({
      ok: true,
      paid: true,
      amount: 79000,
    });
  });

  it("redirects to error when trackId is missing", async () => {
    const res = await GET(makeRequest("/api/ai/verify"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("payment=error");
  });

  it("activates subscription and grants credits on successful payment", async () => {
    const res = await GET(
      makeRequest("/api/ai/verify", {
        searchParams: { trackId: "track-abc", success: "true" },
      })
    );
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/ai?payment=success");
    expect(db.tables.ai_users[0].credits).toBe(55);
    expect(db.tables.ai_users[0].plan).toBe("starter");
    expect(db.tables.ai_orders[0].status).toBe("paid");
  });

  it("is idempotent for already-paid orders", async () => {
    db.tables.ai_orders[0].status = "paid";
    const res = await GET(
      makeRequest("/api/ai/verify", {
        searchParams: { trackId: "track-abc" },
      })
    );
    expect(res.headers.get("location")).toContain("/ai?payment=success");
    expect(mockZibalVerify).not.toHaveBeenCalled();
  });

  it("marks order failed when Zibal reports unpaid", async () => {
    mockZibalVerify.mockResolvedValue({ ok: true, paid: false });
    const res = await GET(
      makeRequest("/api/ai/verify", {
        searchParams: { trackId: "track-abc", success: "true" },
      })
    );
    expect(res.headers.get("location")).toContain("payment=failed");
    expect(db.tables.ai_orders[0].status).toBe("failed");
    expect(db.tables.ai_users[0].credits).toBe(5);
  });

  it("rejects payment when amount mismatch exceeds tolerance", async () => {
    mockZibalVerify.mockResolvedValue({ ok: true, paid: true, amount: 1000 });
    const res = await GET(
      makeRequest("/api/ai/verify", {
        searchParams: { trackId: "track-abc", success: "true" },
      })
    );
    expect(res.headers.get("location")).toContain("payment=error");
    expect(db.tables.ai_orders[0].status).toBe("failed");
  });

  it("handles duplicate callback without double-crediting (already paid short-circuit)", async () => {
    // First payment
    await GET(
      makeRequest("/api/ai/verify", {
        searchParams: { trackId: "track-abc", success: "true" },
      })
    );
    const creditsAfterFirst = db.tables.ai_users[0].credits as number;

    // Second callback — order already paid
    const res = await GET(
      makeRequest("/api/ai/verify", {
        searchParams: { trackId: "track-abc", success: "true" },
      })
    );
    expect(res.headers.get("location")).toContain("payment=success");
    expect(db.tables.ai_users[0].credits).toBe(creditsAfterFirst);
  });
});
