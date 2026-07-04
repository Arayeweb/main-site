import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest } from "../helpers/request";
import { readSseEvents } from "../helpers/sse";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { CODE_STARTER_FILES } from "@/lib/codeStudio";

const db = createTestSupabase({
  ai_users: [],
  ai_battles: [],
  ai_usage: [],
});

const mockStreamDirect = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: () => db,
}));

vi.mock("@/lib/aiEngine", () => ({
  streamDirect: (...args: unknown[]) => mockStreamDirect(...args),
}));

import { POST } from "@/app/api/ai/code/route";

describe("integration — /api/ai/code (SSE streaming)", () => {
  beforeEach(() => {
    db.reset({
      ai_users: [{ id: "user-code", plan: "starter", credits: 20 }],
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
        onDelta("```tsx:src/app/page.tsx\nexport default function Home() { return <main />; }\n```");
        return {
          content: "```tsx:src/app/page.tsx\nexport default function Home() { return <main />; }\n```",
          tokensUsed: 42,
          costUsd: 0.004,
        };
      }
    );
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await POST(
      makeRequest("/api/ai/code", {
        method: "POST",
        body: { prompt: "build", model: "economy", files: CODE_STARTER_FILES },
      })
    );
    expect(res.status).toBe(401);
  });

  it("blocks free plan", async () => {
    db.tables.ai_users[0].plan = "free";
    const token = signAIToken("user-code", "free");
    const res = await POST(
      makeRequest("/api/ai/code", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { prompt: "build", model: "economy", files: CODE_STARTER_FILES },
      })
    );
    expect(res.status).toBe(403);
  });

  it("streams code studio turn and persists tier code_studio", async () => {
    const token = signAIToken("user-code", "starter");
    const res = await POST(
      makeRequest("/api/ai/code", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          prompt: "یک فرم لاگین بساز",
          model: "economy",
          activeFile: "src/app/page.tsx",
          files: CODE_STARTER_FILES,
        },
      })
    );

    expect(res.status).toBe(200);
    const events = await readSseEvents(res);
    const done = events.find((e) => e.type === "done");
    expect(done).toMatchObject({ type: "done", creditsRemaining: 19, isNewThread: true });
    expect(done?.files).toBeTruthy();
    expect(mockStreamDirect.mock.calls[0][2]).toBe(900);
    expect(db.tables.ai_battles[0]).toMatchObject({
      tier: "code_studio",
      model_a: "economy",
    });
  });
});
