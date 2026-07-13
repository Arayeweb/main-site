import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_orders: [],
  ai_promo_codes: [],
  ai_referral_codes: [],
});

const mockZibalRequest = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/zibal", () => ({
  zibalRequest: (...args: unknown[]) => mockZibalRequest(...args),
  ZIBAL_GATEWAY: "https://gateway.zibal.ir/start",
}));

import { POST } from "@/app/api/ai/checkout/route";

describe("integration — /api/ai/checkout", () => {
  beforeEach(() => {
    process.env.AI_PAYMENTS_ENABLED = "true";
    db.reset({
      ai_users: [{ id: "user-1", phone: "09123456789", plan: "free", credits: 5 }],
      ai_orders: [],
      ai_promo_codes: [],
      ai_referral_codes: [],
    });
    mockZibalRequest.mockReset();
    mockZibalRequest.mockResolvedValue({
      ok: true,
      trackId: "track-123",
      redirectUrl: "https://gateway.zibal.ir/start/track-123",
    });
  });

  afterAll(() => {
    delete process.env.AI_PAYMENTS_ENABLED;
  });

  it("requires authentication", async () => {
    const res = await POST(
      makeRequest("/api/ai/checkout", {
        method: "POST",
        body: { packageId: "starter" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("creates pending order and returns Zibal redirect URL", async () => {
    const token = signAIToken("user-1", "free");
    const res = await POST(
      makeRequest("/api/ai/checkout", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { packageId: "starter" },
      })
    );
    const body = await jsonBody<{ ok: boolean; redirectUrl: string }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.redirectUrl).toContain("track-123");
    expect(db.tables.ai_orders).toHaveLength(1);
    expect(db.tables.ai_orders[0].status).toBe("pending");
    expect(mockZibalRequest).toHaveBeenCalledOnce();
  });

  it("rejects non-checkout packages (free, business, team)", async () => {
    const token = signAIToken("user-1", "free");
    for (const packageId of ["free", "business", "team_mini"]) {
      const res = await POST(
        makeRequest("/api/ai/checkout", {
          method: "POST",
          cookies: { [AI_COOKIE]: token },
          body: { packageId },
        })
      );
      expect(res.status).toBe(422);
    }
  });

  it("rejects invalid package id", async () => {
    const token = signAIToken("user-1", "free");
    const res = await POST(
      makeRequest("/api/ai/checkout", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { packageId: "nonexistent" },
      })
    );
    expect(res.status).toBe(422);
  });

  it("returns 502 when payment gateway fails", async () => {
    mockZibalRequest.mockResolvedValue({ ok: false, error: "gateway_error" });
    const token = signAIToken("user-1", "free");
    const res = await POST(
      makeRequest("/api/ai/checkout", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { packageId: "pro" },
      })
    );
    expect(res.status).toBe(502);
  });
});
