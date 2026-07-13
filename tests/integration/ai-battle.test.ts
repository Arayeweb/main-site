import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_battles: [],
  ai_usage: [],
});

const mockRunBattle = vi.fn();
const mockRunDirect = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", () => ({
  runBattle: (...args: unknown[]) => mockRunBattle(...args),
  runDirect: (...args: unknown[]) => mockRunDirect(...args),
}));

import { POST } from "@/app/api/ai/battle/route";

describe("integration — /api/ai/battle", () => {
  beforeEach(() => {
    process.env.LEGACY_AI_GENERATION_ENABLED = "true";
    db.reset({
      ai_users: [
        {
          id: "user-1",
          plan: "starter",
          credits: 10,
        },
      ],
      ai_battles: [],
      ai_usage: [],
    });
    mockRunBattle.mockReset();
    mockRunDirect.mockReset();
    mockRunBattle.mockResolvedValue({
      responseA: "پاسخ A",
      responseB: "پاسخ B",
      tokensUsed: 100,
      costUsd: 0.01,
    });
    mockRunDirect.mockResolvedValue({
      content: "پاسخ مستقیم",
      tokensUsed: 80,
      costUsd: 0.008,
    });
  });

  afterAll(() => {
    delete process.env.LEGACY_AI_GENERATION_ENABLED;
  });

  it("is fail-closed by default so legacy fixed-price billing cannot be replayed", async () => {
    delete process.env.LEGACY_AI_GENERATION_ENABLED;
    const token = signAIToken("user-1", "starter");
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "سلام", mode: "battle" },
      })
    );
    expect(res.status).toBe(410);
    expect(mockRunBattle).not.toHaveBeenCalled();
  });

  it("rejects empty prompt", async () => {
    const token = signAIToken("user-1", "starter");
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "   ", mode: "battle" },
      })
    );
    expect(res.status).toBe(422);
  });

  it("blocks user with insufficient credits", async () => {
    db.tables.ai_users[0].credits = 0;
    const token = signAIToken("user-1", "starter");
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "سلام", mode: "battle" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(402);
    expect(body.error).toBe("insufficient_credits");
    expect(mockRunBattle).not.toHaveBeenCalled();
  });

  it("allows free user direct mode with economy model", async () => {
    db.tables.ai_users[0].plan = "free";
    db.tables.ai_users[0].credits = 5;
    const token = signAIToken("user-1", "free");
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "سلام", mode: "direct", model: "economy" },
      })
    );
    const body = await jsonBody<{ ok: boolean }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
  });

  it("deducts credits after successful battle", async () => {
    const token = signAIToken("user-1", "starter");
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "یک جمله بنویس", mode: "battle" },
      })
    );
    const body = await jsonBody<{ ok: boolean; creditsRemaining: number }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.creditsRemaining).toBeLessThan(10);
    expect(mockRunBattle).toHaveBeenCalledOnce();
    expect(db.tables.ai_usage).toHaveLength(1);
  });

  it("returns 502 when AI provider fails", async () => {
    mockRunBattle.mockRejectedValue(new Error("OpenRouter timeout"));
    const token = signAIToken("user-1", "starter");
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "تست خطا", mode: "battle" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(502);
    expect(body.error).toBe("ai_error");
    // credits should not be deducted on AI failure
    expect(db.tables.ai_users[0].credits).toBe(10);
  });

  it("requires login for guest battle (auth gate)", async () => {
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        body: { prompt: "نبرد مهمان", mode: "battle" },
      })
    );
    const body = await jsonBody<{ error: string }>(res);
    expect(res.status).toBe(401);
    expect(body.error).toBe("login_required");
    expect(mockRunBattle).not.toHaveBeenCalled();
  });

  it("requires login for non-battle guest modes", async () => {
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        body: { prompt: "سلام", mode: "direct" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("truncates very long prompts before calling AI", async () => {
    const { MAX_PROMPT_CHARS } = await import("@/lib/aiCredits");
    const token = signAIToken("user-1", "starter");
    const longPrompt = "ا".repeat(MAX_PROMPT_CHARS + 500);

    await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: longPrompt, mode: "battle" },
      })
    );

    const calledPrompt = mockRunBattle.mock.calls[0]?.[0] as string;
    expect(calledPrompt.length).toBeLessThanOrEqual(MAX_PROMPT_CHARS);
  });

  it("handles slow AI provider response", async () => {
    mockRunBattle.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                responseA: "slow",
                responseB: "slow",
                tokensUsed: 10,
                costUsd: 0.001,
              }),
            100
          )
        )
    );
    const token = signAIToken("user-1", "starter");
    const start = Date.now();
    const res = await POST(
      makeRequest("/api/ai/battle", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "slow test", mode: "battle" },
      })
    );
    expect(Date.now() - start).toBeGreaterThanOrEqual(100);
    expect(res.status).toBe(200);
  });
});
