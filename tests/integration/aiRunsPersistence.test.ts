import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import { makeRequest, jsonBody } from "../helpers/request";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { runToHydration } from "@/lib/ai/runs/types";
import { serializeRun } from "@/lib/ai/runs/loadRun";

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const RUN_DIRECT = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const RUN_COMPARE = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const RUN_COUNCIL = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const RUN_SHARED = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const LEGACY_BATTLE = "11111111-1111-4111-8111-111111111111";

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase";
import { GET as getRun } from "@/app/api/ai/runs/[id]/route";
import { POST as shareRun } from "@/app/api/ai/runs/[id]/share/route";
import { GET as getHistory } from "@/app/api/ai/history/route";
import { GET as getShare } from "@/app/api/ai/share/[slug]/route";

function authedCookie(userId: string) {
  return { [AI_COOKIE]: signAIToken(userId, "pro") };
}

function seedPersistenceDb() {
  const db = createTestSupabase({
    ai_runs: [
      {
        id: RUN_DIRECT,
        user_id: USER_A,
        mode: "direct",
        status: "completed",
        metadata: { models: ["economy"], prompt: "سلام direct" },
        reserved_credits: 1,
        charged_credits: 1,
        refunded_credits: 0,
        created_at: "2026-07-05T10:00:00.000Z",
        completed_at: "2026-07-05T10:01:00.000Z",
      },
      {
        id: RUN_COMPARE,
        user_id: USER_A,
        mode: "compare",
        status: "completed",
        metadata: { models: ["economy", "premium"], prompt: "مقایسه کن" },
        reserved_credits: 2,
        charged_credits: 2,
        refunded_credits: 0,
        created_at: "2026-07-05T11:00:00.000Z",
        completed_at: "2026-07-05T11:01:00.000Z",
      },
      {
        id: RUN_COUNCIL,
        user_id: USER_A,
        mode: "council",
        status: "completed",
        metadata: { models: ["economy", "premium"], prompt: "همفکری" },
        reserved_credits: 3,
        charged_credits: 3,
        refunded_credits: 0,
        created_at: "2026-07-05T12:00:00.000Z",
        completed_at: "2026-07-05T12:02:00.000Z",
      },
      {
        id: RUN_SHARED,
        user_id: USER_A,
        mode: "compare",
        status: "completed",
        metadata: {
          models: ["economy", "premium"],
          prompt: "shared run",
          share_slug: "abcshare1",
          is_public: true,
        },
        reserved_credits: 2,
        charged_credits: 2,
        refunded_credits: 0,
        created_at: "2026-07-05T13:00:00.000Z",
        completed_at: "2026-07-05T13:01:00.000Z",
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        user_id: USER_B,
        mode: "direct",
        status: "completed",
        metadata: { models: ["economy"], prompt: "private other" },
        reserved_credits: 1,
        charged_credits: 1,
        refunded_credits: 0,
        created_at: "2026-07-05T09:00:00.000Z",
        completed_at: "2026-07-05T09:01:00.000Z",
      },
    ],
    model_calls: [
      { id: "c1", run_id: RUN_DIRECT, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T10:00:01.000Z" },
      { id: "c2", run_id: RUN_COMPARE, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T11:00:01.000Z" },
      { id: "c3", run_id: RUN_COMPARE, model: "premium", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T11:00:02.000Z" },
      { id: "c4", run_id: RUN_COUNCIL, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T12:00:01.000Z" },
      { id: "c5", run_id: RUN_COUNCIL, model: "premium", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T12:00:02.000Z" },
      { id: "c6", run_id: RUN_COUNCIL, model: "economy", role: "critique", status: "completed", error_code: null, created_at: "2026-07-05T12:01:00.000Z" },
      { id: "c7", run_id: RUN_COUNCIL, model: "economy", role: "synthesis", status: "completed", error_code: null, created_at: "2026-07-05T12:01:30.000Z" },
      { id: "c8", run_id: RUN_SHARED, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T13:00:01.000Z" },
      { id: "c9", run_id: RUN_SHARED, model: "premium", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T13:00:02.000Z" },
    ],
    model_outputs: [
      { run_id: RUN_DIRECT, model: "economy", content: "پاسخ direct", model_call_id: "c1", created_at: "2026-07-05T10:00:05.000Z" },
      { run_id: RUN_COMPARE, model: "economy", content: "پاسخ A", model_call_id: "c2", created_at: "2026-07-05T11:00:05.000Z" },
      { run_id: RUN_COMPARE, model: "premium", content: "پاسخ B", model_call_id: "c3", created_at: "2026-07-05T11:00:06.000Z" },
      { run_id: RUN_COUNCIL, model: "economy", content: "پاسخ مدل ۱", model_call_id: "c4", created_at: "2026-07-05T12:00:05.000Z" },
      { run_id: RUN_COUNCIL, model: "premium", content: "پاسخ مدل ۲", model_call_id: "c5", created_at: "2026-07-05T12:00:06.000Z" },
      { run_id: RUN_COUNCIL, model: "economy", content: "نقد شورا", model_call_id: "c6", created_at: "2026-07-05T12:01:05.000Z" },
      { run_id: RUN_COUNCIL, model: "economy", content: "جمع‌بندی نهایی", model_call_id: "c7", created_at: "2026-07-05T12:01:35.000Z" },
      { run_id: RUN_SHARED, model: "economy", content: "share A", model_call_id: "c8", created_at: "2026-07-05T13:00:05.000Z" },
      { run_id: RUN_SHARED, model: "premium", content: "share B", model_call_id: "c9", created_at: "2026-07-05T13:00:06.000Z" },
    ],
    feedback_votes: [
      { run_id: RUN_COMPARE, selected_model: "premium" },
    ],
    ai_battles: [
      {
        id: LEGACY_BATTLE,
        user_id: USER_A,
        prompt: "legacy battle",
        tier: "side_by_side",
        created_at: "2026-07-04T10:00:00.000Z",
        thread_id: null,
        persona_key: null,
        model_a: "economy",
        model_b: "premium",
        response_a: "legacy A",
        response_b: "legacy B",
        share_slug: "legacyshare",
        is_public: true,
      },
    ],
  });
  vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
  return db;
}

describe("GET /api/ai/runs/[id]", () => {
  beforeEach(() => seedPersistenceDb());

  it("returns own direct run", async () => {
    const res = await getRun(
      makeRequest(`http://localhost/api/ai/runs/${RUN_DIRECT}`, {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: RUN_DIRECT } }
    );
    const body = await jsonBody<{ ok: boolean; run: { mode: string; prompt: string; answers: { content: string }[] } }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.run.mode).toBe("direct");
    expect(body.run.prompt).toBe("سلام direct");
    expect(body.run.answers[0]?.content).toBe("پاسخ direct");
  });

  it("rejects another user's run", async () => {
    const otherRun = "99999999-9999-4999-8999-999999999999";
    const res = await getRun(
      makeRequest(`http://localhost/api/ai/runs/${otherRun}`, {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: otherRun } }
    );
    expect(res.status).toBe(404);
  });

  it("returns compare outputs separated by model", async () => {
    const res = await getRun(
      makeRequest(`http://localhost/api/ai/runs/${RUN_COMPARE}`, {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: RUN_COMPARE } }
    );
    const body = await jsonBody<{
      ok: boolean;
      run: { mode: string; models: string[]; answers: { model: string; content: string }[]; selectedVote: string | null };
    }>(res);
    expect(body.run.mode).toBe("compare");
    expect(body.run.models).toEqual(["economy", "premium"]);
    expect(body.run.answers.find((a) => a.model === "economy")?.content).toBe("پاسخ A");
    expect(body.run.answers.find((a) => a.model === "premium")?.content).toBe("پاسخ B");
    expect(body.run.selectedVote).toBe("premium");
  });

  it("returns council model outputs, critique, and summary", async () => {
    const res = await getRun(
      makeRequest(`http://localhost/api/ai/runs/${RUN_COUNCIL}`, {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: RUN_COUNCIL } }
    );
    const body = await jsonBody<{
      ok: boolean;
      run: {
        mode: string;
        answers: { model: string; content: string }[];
        critique: string | null;
        summary: string | null;
      };
    }>(res);
    expect(body.run.mode).toBe("council");
    expect(body.run.answers).toHaveLength(2);
    expect(body.run.critique).toBe("نقد شورا");
    expect(body.run.summary).toBe("جمع‌بندی نهایی");
  });

  it("returns 400 for invalid UUID", async () => {
    const res = await getRun(
      makeRequest("http://localhost/api/ai/runs/not-a-uuid", {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: "not-a-uuid" } }
    );
    expect(res.status).toBe(400);
  });
});

describe("run reload hydration", () => {
  beforeEach(() => seedPersistenceDb());

  it("hydrates static UI payload without POST /api/ai/runs", async () => {
    const res = await getRun(
      makeRequest(`http://localhost/api/ai/runs/${RUN_COUNCIL}`, {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: RUN_COUNCIL } }
    );
    const body = await jsonBody<{ run: ReturnType<typeof serializeRun> }>(res);
    const hydration = runToHydration(body.run);
    expect(hydration.runId).toBe(RUN_COUNCIL);
    expect(hydration.summary).toBe("جمع‌بندی نهایی");
    expect(hydration.answers.economy).toBe("پاسخ مدل ۱");
  });
});

describe("share + history", () => {
  beforeEach(() => seedPersistenceDb());

  it("reads shared run through share route", async () => {
    const res = await getShare(
      makeRequest("http://localhost/api/ai/share/abcshare1"),
      { params: { slug: "abcshare1" } }
    );
    const body = await jsonBody<{
      ok: boolean;
      source: string;
      responseA: string;
      responseB: string;
    }>(res);
    expect(res.status).toBe(200);
    expect(body.source).toBe("run");
    expect(body.responseA).toBe("share A");
    expect(body.responseB).toBe("share B");
  });

  it("still serves legacy ai_battles share links", async () => {
    const res = await getShare(
      makeRequest("http://localhost/api/ai/share/legacyshare"),
      { params: { slug: "legacyshare" } }
    );
    const body = await jsonBody<{ ok: boolean; source: string; prompt: string }>(res);
    expect(body.ok).toBe(true);
    expect(body.source).toBe("legacy");
    expect(body.prompt).toBe("legacy battle");
  });

  it("creates share link for own compare run", async () => {
    const res = await shareRun(
      makeRequest(`http://localhost/api/ai/runs/${RUN_COMPARE}/share`, {
        method: "POST",
        cookies: authedCookie(USER_A),
      }),
      { params: { id: RUN_COMPARE } }
    );
    const body = await jsonBody<{ ok: boolean; shareUrl: string; source: string }>(res);
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.source).toBe("run");
    expect(body.shareUrl).toContain("/ai/share/");
  });

  it("merges ai_runs and ai_battles in unified history", async () => {
    const res = await getHistory(
      makeRequest("http://localhost/api/ai/history", {
        cookies: authedCookie(USER_A),
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      items: Array<{ id: string; source?: string; tier: string; createdAt: string }>;
    }>(res);
    expect(body.ok).toBe(true);
    const runItem = body.items.find((i) => i.id === RUN_DIRECT);
    const legacyItem = body.items.find((i) => i.id === LEGACY_BATTLE);
    expect(runItem?.source).toBe("run");
    expect(legacyItem?.source).toBe("legacy");
    const sorted = [...body.items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    expect(body.items.map((i) => i.id)).toEqual(sorted.map((i) => i.id));
  });
});

describe("legacy battle page data", () => {
  beforeEach(() => seedPersistenceDb());

  it("legacy ai_battles row remains readable for /ai/battle/[id]", async () => {
    const db = vi.mocked(getSupabaseAdmin)();
    const { data } = await db
      .from("ai_battles")
      .select("id, prompt, tier, response_a, response_b")
      .eq("id", LEGACY_BATTLE)
      .maybeSingle();
    expect(data?.id).toBe(LEGACY_BATTLE);
    expect(data?.tier).toBe("side_by_side");
    expect(data?.response_a).toBe("legacy A");
  });
});
