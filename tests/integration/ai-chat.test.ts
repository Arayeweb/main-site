import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest } from "../helpers/request";
import { readSseEvents, readFirstSseChunk } from "../helpers/sse";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const db = createTestSupabase({
  ai_users: [],
  ai_battles: [],
  ai_usage: [],
});

const mockStreamDirect = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/aiEngine")>();
  return {
    ...actual,
    streamDirect: (...args: unknown[]) => mockStreamDirect(...args),
  };
});

import { POST } from "@/app/api/ai/chat/route";

describe("integration — /api/ai/chat (SSE streaming)", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [
        { id: "user-chat", plan: "starter", credits: 20 },
      ],
      ai_battles: [],
      ai_usage: [],
    });
    mockStreamDirect.mockReset();
    mockStreamDirect.mockImplementation(
      async (
        _prompt: string,
        _model: string,
        _maxTokens: number,
        _history: unknown[],
        onDelta: (text: string) => void
      ) => {
        onDelta("سلام");
        onDelta(" دنیا");
        return { content: "سلام دنیا", tokensUsed: 42, costUsd: 0.004 };
      }
    );
  });

  it("returns 401 SSE error when unauthenticated", async () => {
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        body: { prompt: "hi", model: "economy" },
      })
    );
    expect(res.status).toBe(401);
    const events = await readSseEvents(res);
    expect(events[0]).toEqual({ type: "error", error: "unauthorized" });
  });

  it("returns missing_prompt when prompt and attachments are empty", async () => {
    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "  ", model: "economy" },
      })
    );
    expect(res.status).toBe(422);
    const events = await readSseEvents(res);
    expect(events[0]).toEqual({ type: "error", error: "missing_prompt" });
  });

  it("allows free plan direct chat with economy model", async () => {
    db.tables.ai_users[0].plan = "free";
    db.tables.ai_users[0].credits = 5;
    const token = signAIToken("user-chat", "free");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "سلام", model: "economy" },
      })
    );
    expect(res.status).toBe(200);
    const events = await readSseEvents(res);
    expect(events.some((e) => e.type === "delta" || e.type === "done")).toBe(true);
    expect(mockStreamDirect).toHaveBeenCalled();
  });

  it("blocks free plan from Code Studio requests", async () => {
    db.tables.ai_users[0].plan = "free";
    const token = signAIToken("user-chat", "free");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          prompt: "build a landing page",
          model: "economy",
          studio: "code_studio",
        },
      })
    );

    expect(res.status).toBe(403);
    const events = await readSseEvents(res);
    expect(events[0]).toEqual({ type: "error", error: "plan_upgrade_required" });
    expect(mockStreamDirect).not.toHaveBeenCalled();
  });

  it("blocks user with zero credits", async () => {
    db.tables.ai_users[0].credits = 0;
    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "سلام", model: "economy" },
      })
    );
    expect(res.status).toBe(402);
    const events = await readSseEvents(res);
    expect(events[0]).toEqual({ type: "error", error: "insufficient_credits" });
  });

  it("streams delta events then done and deducts credits", async () => {
    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "سلام", model: "economy" },
      })
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    const events = await readSseEvents(res);
    const deltas = events.filter((e) => e.type === "delta");
    const done = events.find((e) => e.type === "done");

    expect(deltas.length).toBeGreaterThanOrEqual(2);
    expect(deltas.map((d) => d.text).join("")).toBe("سلام دنیا");
    expect(done).toMatchObject({
      type: "done",
      responseA: "سلام دنیا",
      creditsRemaining: 19,
      isNewThread: true,
    });
    expect(db.tables.ai_usage).toHaveLength(1);
    expect(db.tables.ai_users[0].credits).toBe(19);
  });

  it("streams Code Studio requests through the chat API and records usage", async () => {
    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          prompt: "تو در استودیو کد هستی. فایل src/app/page.tsx را کامل بساز.",
          model: "economy",
          studio: "code_studio",
        },
      })
    );

    expect(res.status).toBe(200);
    const events = await readSseEvents(res);
    const done = events.find((e) => e.type === "done");

    expect(done).toMatchObject({
      type: "done",
      responseA: "سلام دنیا",
      creditsRemaining: 19,
      isNewThread: true,
    });
    expect(mockStreamDirect).toHaveBeenCalledTimes(1);
    expect(mockStreamDirect.mock.calls[0][0]).toContain("src/app/page.tsx");
    expect(mockStreamDirect.mock.calls[0][1]).toBe("economy");
    expect(mockStreamDirect.mock.calls[0][2]).toBe(900);
    expect(db.tables.ai_battles[0]).toMatchObject({
      model_a: "economy",
      tier: "direct",
      credit_cost: 1,
      tokens_used: 42,
    });
    expect(db.tables.ai_usage).toHaveLength(1);
  });

  it("returns ai_error SSE event when streamDirect throws", async () => {
    mockStreamDirect.mockRejectedValue(new Error("OpenRouter stream failed"));
    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "fail", model: "economy" },
      })
    );
    const events = await readSseEvents(res);
    expect(events.some((e) => e.type === "error" && e.error === "ai_error")).toBe(true);
    expect(db.tables.ai_users[0].credits).toBe(20);
  });

  it("rejects vision attachments on non-vision model", async () => {
    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          prompt: "",
          model: "economy",
          attachments: [{ url: "https://example.com/a.png", mime: "image/png" }],
        },
      })
    );
    expect(res.status).toBe(422);
    const events = await readSseEvents(res);
    expect(events[0]).toEqual({ type: "error", error: "model_no_vision" });
  });

  it("does not deduct credits when client disconnects mid-stream (refresh simulation)", async () => {
    mockStreamDirect.mockImplementation(
      async (
        _p: string,
        _m: string,
        _t: number,
        _h: unknown[],
        onDelta: (text: string) => void
      ) => {
        onDelta("partial");
        await new Promise((r) => setTimeout(r, 50));
        onDelta(" rest");
        return { content: "partial rest", tokensUsed: 10, costUsd: 0.001 };
      }
    );

    const token = signAIToken("user-chat", "starter");
    const res = await POST(
      makeRequest("/api/ai/chat", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "refresh test", model: "economy" },
      })
    );

    const firstChunk = await readFirstSseChunk(res);
    expect(firstChunk).toContain('"type":"delta"');
    expect(firstChunk).toContain("partial");

    // Client cancelled — server stream controller closes; credits must not be charged
    await new Promise((r) => setTimeout(r, 120));
    expect(db.tables.ai_users[0].credits).toBe(20);
    expect(db.tables.ai_usage).toHaveLength(0);
  });
});
