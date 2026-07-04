import { describe, it, expect, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { resolveCode } from "@/lib/aiPromo";
import { signAIToken } from "@/lib/aiAuth";
import { makeRequest, jsonBody } from "../helpers/request";

const promoDb = createTestSupabase({
  ai_promo_codes: [],
  ai_referral_codes: [],
});

describe("regression — promo code resolution", () => {
  beforeEach(() => {
    promoDb.reset({
      ai_promo_codes: [
        {
          id: "p1",
          code: "SAVE20",
          kind: "percent",
          value: 20,
          max_uses: 100,
          used_count: 0,
          expires_at: null,
          active: true,
        },
        {
          id: "p2",
          code: "EXPIRED",
          kind: "percent",
          value: 10,
          max_uses: 10,
          used_count: 0,
          expires_at: "2020-01-01T00:00:00Z",
          active: true,
        },
      ],
      ai_referral_codes: [
        { id: "r1", code: "AI-FRIEND1", user_id: "referrer-1" },
      ],
    });
  });

  it("applies percent promo discount", async () => {
    const result = await resolveCode(promoDb as never, "SAVE20", "buyer-1", "starter");
    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.discountToman).toBeGreaterThan(0);
      expect(result.finalAmountToman).toBeLessThan(result.listAmountToman);
    }
  });

  it("blocks self-referral", async () => {
    const result = await resolveCode(promoDb as never, "AI-FRIEND1", "referrer-1", "starter");
    expect(result).toEqual(expect.objectContaining({ error: "self_referral" }));
  });

  it("returns invalid_code for unknown codes", async () => {
    const result = await resolveCode(promoDb as never, "NOTREAL", "buyer-1", "starter");
    expect(result).toEqual(expect.objectContaining({ error: "invalid_code" }));
  });

  it("rejects expired promo codes", async () => {
    const result = await resolveCode(promoDb as never, "EXPIRED", "buyer-1", "starter");
    expect(result).toEqual(expect.objectContaining({ error: "code_expired" }));
  });
});

describe("regression — invalid session token", () => {
  it("auth GET treats tampered token as guest", async () => {
    const { GET } = await import("@/app/api/ai/auth/route");
    const res = await GET(
      makeRequest("/api/ai/auth", {
        cookies: { ary_ai_session: "not.a.valid.token" },
      })
    );
    const body = await jsonBody<{ authed: boolean }>(res);
    expect(body.authed).toBe(false);
  });

  it("expired token is rejected by verifyAIToken", async () => {
    const { verifyAIToken, signAIToken } = await import("@/lib/aiAuth");
    const expired = signAIToken("u1", "free", -1000);
    expect(verifyAIToken(expired)).toBeNull();
    expect(verifyAIToken(signAIToken("u1", "free"))).not.toBeNull();
  });
});

// Refresh mid-stream: covered in tests/integration/ai-chat.test.ts (credits not deducted on disconnect)
