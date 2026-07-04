import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_referral_codes: [],
  content_sales_orders: [],
});

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

import { POST, PUT, GET, DELETE } from "@/app/api/ai/auth/route";

describe("integration — /api/ai/auth", () => {
  beforeEach(() => {
    db.reset({ ai_users: [], ai_referral_codes: [], content_sales_orders: [] });
  });

  it("registers a new user and sets session cookie", async () => {
    const res = await POST(
      makeRequest("/api/ai/auth", {
        method: "POST",
        body: { phone: "09123456789", password: "secret12" },
      })
    );
    const body = await jsonBody<{ ok: boolean; user: { id: string; credits: number } }>(res);

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.user.credits).toBeGreaterThanOrEqual(0);
    expect(res.cookies.get(AI_COOKIE)?.value).toBeTruthy();
    expect(db.tables.ai_users).toHaveLength(1);
  });

  it("rejects duplicate phone on registration", async () => {
    db.reset({
      ai_users: [
        {
          id: "existing",
          phone: "09123456789",
          password_hash: "x",
          plan: "free",
          credits: 5,
        },
      ],
      ai_referral_codes: [],
    });

    const res = await POST(
      makeRequest("/api/ai/auth", {
        method: "POST",
        body: { phone: "09123456789", password: "secret12" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(409);
    expect(body.error).toBe("phone_taken");
  });

  it("rejects short passwords", async () => {
    const res = await POST(
      makeRequest("/api/ai/auth", {
        method: "POST",
        body: { phone: "09123456789", password: "123" },
      })
    );
    expect(res.status).toBe(422);
  });

  it("logs in with valid credentials", async () => {
    const { hashPassword } = await import("@/lib/auth");
    db.reset({
      ai_users: [
        {
          id: "u1",
          phone: "09111111111",
          password_hash: hashPassword("mypass12"),
          plan: "starter",
          credits: 10,
        },
      ],
      ai_referral_codes: [],
    });

    const res = await PUT(
      makeRequest("/api/ai/auth", {
        method: "PUT",
        body: { phone: "09111111111", password: "mypass12" },
      })
    );
    const body = await jsonBody<{ ok: boolean; user: { plan: string } }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.user.plan).toBe("starter");
  });

  it("rejects invalid credentials", async () => {
    db.reset({
      ai_users: [
        {
          id: "u1",
          phone: "09111111111",
          password_hash: "scrypt$deadbeef$deadbeef",
          plan: "free",
          credits: 5,
        },
      ],
      ai_referral_codes: [],
    });

    const res = await PUT(
      makeRequest("/api/ai/auth", {
        method: "PUT",
        body: { phone: "09111111111", password: "wrongpass" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("GET returns authed user when session is valid", async () => {
    const token = signAIToken("u1", "pro");
    db.reset({
      ai_users: [{ id: "u1", phone: "09111111111", plan: "pro", credits: 42 }],
      ai_referral_codes: [],
    });

    const res = await GET(
      makeRequest("/api/ai/auth", {
        cookies: { [AI_COOKIE]: token },
      })
    );
    const body = await jsonBody<{ authed: boolean; user?: { credits: number } }>(res);
    expect(body.authed).toBe(true);
    expect(body.user?.credits).toBe(42);
  });

  it("DELETE clears session cookie", async () => {
    const res = await DELETE();
    expect(res.status).toBe(200);
    expect(res.cookies.get(AI_COOKIE)?.value).toBe("");
  });
});
