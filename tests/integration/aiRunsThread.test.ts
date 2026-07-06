import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestSupabase } from "../mocks/supabaseMock";
import {
  createBillingSupabase,
  resetBillingWalletLock,
  type BillingSupabase,
} from "../mocks/billingSupabase";
import { makeRequest, jsonBody } from "../helpers/request";
import { readSseEvents } from "../helpers/sse";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { buildConversationHistory, loadConversationRuns } from "@/lib/ai/runs/conversationContext";
import { prepareRun } from "@/lib/ai/orchestrator";

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CONV = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const RUN1 = CONV;
const RUN2 = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
const LEGACY_BATTLE = "11111111-1111-4111-8111-111111111111";

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(),
}));

import { getSupabaseAdmin } from "@/lib/supabase";
import { GET as getRun } from "@/app/api/ai/runs/[id]/route";
import { GET as getHistory } from "@/app/api/ai/history/route";
import { POST as createRun } from "@/app/api/ai/runs/route";

vi.mock("@/lib/ai/providers/openrouter", () => ({
  openRouterProvider: {
    id: "openrouter",
    streamChat: vi.fn(),
  },
}));

vi.mock("@/lib/redis/locks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/redis/locks")>();
  return {
    ...actual,
    acquireRunSlot: vi.fn(async () => true),
    releaseRunSlot: vi.fn(async () => undefined),
  };
});

vi.mock("@/lib/redis/rate-limit", () => ({
  checkRateLimit: vi.fn(async () => ({ allowed: true, remaining: 99 })),
  maxConcurrency: vi.fn(() => 3),
}));

function authedCookie(userId: string) {
  return { [AI_COOKIE]: signAIToken(userId, "pro") };
}

function seedThreadDb() {
  const db = createTestSupabase({
    ai_users: [{ id: USER_A, plan: "pro", credits: 100 }],
    ai_runs: [
      {
        id: RUN1,
        user_id: USER_A,
        conversation_id: CONV,
        mode: "direct",
        status: "completed",
        metadata: { models: ["economy"], prompt: "turn one" },
        reserved_credits: 1,
        charged_credits: 1,
        refunded_credits: 0,
        created_at: "2026-07-05T10:00:00.000Z",
        completed_at: "2026-07-05T10:01:00.000Z",
      },
      {
        id: RUN2,
        user_id: USER_A,
        conversation_id: CONV,
        mode: "direct",
        status: "completed",
        metadata: { models: ["economy"], prompt: "turn two" },
        reserved_credits: 1,
        charged_credits: 1,
        refunded_credits: 0,
        created_at: "2026-07-05T11:00:00.000Z",
        completed_at: "2026-07-05T11:01:00.000Z",
      },
      {
        id: "99999999-9999-4999-8999-999999999999",
        user_id: USER_B,
        conversation_id: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        mode: "direct",
        status: "completed",
        metadata: { models: ["economy"], prompt: "other user" },
        reserved_credits: 1,
        charged_credits: 1,
        refunded_credits: 0,
        created_at: "2026-07-05T09:00:00.000Z",
        completed_at: "2026-07-05T09:01:00.000Z",
      },
    ],
    model_calls: [
      { id: "c1", run_id: RUN1, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T10:00:01.000Z" },
      { id: "c2", run_id: RUN2, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T11:00:01.000Z" },
    ],
    model_outputs: [
      { run_id: RUN1, model: "economy", content: "answer one", model_call_id: "c1", created_at: "2026-07-05T10:00:05.000Z" },
      { run_id: RUN2, model: "economy", content: "answer two", model_call_id: "c2", created_at: "2026-07-05T11:00:05.000Z" },
    ],
    feedback_votes: [],
    ai_battles: [
      {
        id: LEGACY_BATTLE,
        user_id: USER_A,
        prompt: "legacy",
        tier: "direct",
        created_at: "2026-07-04T10:00:00.000Z",
        thread_id: null,
        persona_key: null,
      },
    ],
  });
  vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
  return db;
}

describe("GET /api/ai/runs/[id]?includeThread=1", () => {
  beforeEach(() => seedThreadDb());

  it("returns ordered thread runs", async () => {
    const res = await getRun(
      makeRequest(`http://localhost/api/ai/runs/${RUN2}?includeThread=1`, {
        cookies: authedCookie(USER_A),
      }),
      { params: { id: RUN2 } }
    );
    const body = await jsonBody<{
      ok: boolean;
      thread: { conversationId: string; runs: Array<{ id: string; prompt: string }> };
    }>(res);
    expect(body.ok).toBe(true);
    expect(body.thread.conversationId).toBe(CONV);
    expect(body.thread.runs.map((r) => r.prompt)).toEqual(["turn one", "turn two"]);
  });
});

describe("conversation access on POST /api/ai/runs", () => {
  beforeEach(() => seedThreadDb());

  it("rejects attaching to another user's conversation", async () => {
    const res = await createRun(
      makeRequest("http://localhost/api/ai/runs", {
        method: "POST",
        cookies: authedCookie(USER_A),
        body: {
          mode: "direct",
          model: "economy",
          prompt: "hack",
          conversationId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        },
      })
    );
    const events = await readSseEvents(res);
    expect(res.status).toBe(200);
    expect(events.find((e) => e.type === "run_error")?.errorCode).toBe("bad_request");
  });

  it("requires auth for follow-up", async () => {
    const res = await createRun(
      makeRequest("http://localhost/api/ai/runs", {
        method: "POST",
        body: {
          mode: "direct",
          model: "economy",
          prompt: "guest follow-up",
          conversationId: CONV,
        },
      })
    );
    expect(res.status).toBe(401);
  });
});

describe("history grouping by conversation_id", () => {
  beforeEach(() => seedThreadDb());

  it("groups multiple runs into one history item linked to latest run", async () => {
    const res = await getHistory(
      makeRequest("http://localhost/api/ai/history", {
        cookies: authedCookie(USER_A),
      })
    );
    const body = await jsonBody<{
      ok: boolean;
      items: Array<{ id: string; title: string; source?: string; latestRunId?: string }>;
    }>(res);
    const runItems = body.items.filter((i) => i.source === "run");
    expect(runItems).toHaveLength(1);
    expect(runItems[0]?.id).toBe(CONV);
    expect(runItems[0]?.latestRunId).toBe(RUN2);
    expect(runItems[0]?.title).toBe("turn one");
    expect(body.items.some((i) => i.id === LEGACY_BATTLE)).toBe(true);
  });
});

describe("orchestrator conversation_id", () => {
  let billingDb: BillingSupabase;

  beforeEach(() => {
    resetBillingWalletLock();
    billingDb = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 100 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(billingDb as never);
  });

  it("sets conversation_id to run id when none provided", async () => {
    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "direct",
      prompt: "hello",
      models: ["economy"],
    });
    expect("error" in prep).toBe(false);
    if ("error" in prep) return;
    const row = billingDb.tables.ai_runs?.find((r) => r.id === prep.runId);
    expect(row?.conversation_id).toBe(prep.runId);
  });

  it("preserves provided conversation_id on follow-up prep", async () => {
    billingDb = createBillingSupabase({
      ai_users: [{ id: USER_A, plan: "pro", credits: 100 }],
      ai_runs: [
        {
          id: CONV,
          user_id: USER_A,
          conversation_id: CONV,
          mode: "direct",
          status: "completed",
          metadata: { models: ["economy"], prompt: "first" },
          reserved_credits: 1,
          charged_credits: 1,
          refunded_credits: 0,
          created_at: "2026-07-05T10:00:00.000Z",
          completed_at: "2026-07-05T10:01:00.000Z",
        },
      ],
      ai_credit_ledger: [],
      model_calls: [
        { id: "c1", run_id: CONV, model: "economy", role: "answer", status: "completed", error_code: null, created_at: "2026-07-05T10:00:01.000Z" },
      ],
      model_outputs: [
        { run_id: CONV, model: "economy", content: "first answer", model_call_id: "c1", created_at: "2026-07-05T10:00:05.000Z" },
      ],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(billingDb as never);

    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "direct",
      prompt: "second",
      models: ["economy"],
      conversationId: CONV,
    });
    expect("error" in prep).toBe(false);
    if ("error" in prep) return;
    const row = billingDb.tables.ai_runs?.find((r) => r.id === prep.runId);
    expect(row?.conversation_id).toBe(CONV);
  });
});

describe("follow-up context reconstruction", () => {
  beforeEach(() => seedThreadDb());

  it("loads prior direct assistant answer into history", async () => {
    const runs = await loadConversationRuns(USER_A, CONV);
    const history = buildConversationHistory(runs);
    expect(history).toEqual([
      { role: "user", content: "turn one" },
      { role: "assistant", content: "answer one" },
      { role: "user", content: "turn two" },
      { role: "assistant", content: "answer two" },
    ]);
  });
});
