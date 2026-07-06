import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ModelStreamEvent } from "@/lib/ai/providers/interface";
import {
  createBillingSupabase,
  resetBillingWalletLock,
  runBillingInvariant,
  type BillingSupabase,
} from "../mocks/billingSupabase";
import { makeRequest } from "../helpers/request";
import { readSseEvents } from "../helpers/sse";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const mockStreamChat = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/ai/providers/openrouter", () => ({
  openRouterProvider: {
    id: "openrouter",
    streamChat: (...args: unknown[]) => mockStreamChat(...args),
  },
}));

import { getSupabaseAdmin } from "@/lib/supabase";
import { prepareRun } from "@/lib/ai/orchestrator";
import { POST as createRun } from "@/app/api/ai/runs/route";
import { POST as vote } from "@/app/api/feedback/vote/route";
import { POST as stopRun } from "@/app/api/ai/runs/[id]/stop/route";

async function* successStream(text = "ok"): AsyncGenerator<ModelStreamEvent> {
  yield { type: "delta", text };
  yield {
    type: "done",
    text,
    inputTokens: 5,
    outputTokens: 10,
    cachedTokens: 0,
    costUsd: 0.001,
    ttftMs: 50,
    latencyMs: 200,
  };
}

async function* errorStream(code = "provider_error"): AsyncGenerator<ModelStreamEvent> {
  yield { type: "error", errorCode: code as "provider_error", message: "boom" };
}

function streamForModel(model: string): AsyncGenerator<ModelStreamEvent> {
  if (model.includes("fail") || model === "cmp-claude-opus") {
    return errorStream();
  }
  return successStream(`answer from ${model}`);
}

function seedUser(db: BillingSupabase, id: string, plan: string, credits: number) {
  db.tables.ai_users.push({ id, plan, credits });
}

describe("integration — orchestration billing & ownership", () => {
  let db: BillingSupabase;

  beforeEach(() => {
    resetBillingWalletLock();
    db = createBillingSupabase({
      ai_users: [],
      ai_runs: [],
      ai_credit_ledger: [],
      ai_battles: [],
      model_calls: [],
      model_outputs: [],
      feedback_votes: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    seedUser(db, USER_A, "pro", 50);
    seedUser(db, USER_B, "pro", 50);
    mockStreamChat.mockReset();
    mockStreamChat.mockImplementation((input: { model: string }) =>
      streamForModel(input.model)
    );
  });

  async function runToCompletion(
    prep: Awaited<ReturnType<typeof prepareRun>>
  ): Promise<{ events: Record<string, unknown>[]; runId: string }> {
    if ("error" in prep) throw new Error(`prepare failed: ${prep.error}`);
    const events: Record<string, unknown>[] = [];
    const controller = new AbortController();
    for await (const ev of prep.execute(controller.signal)) {
      events.push(ev as Record<string, unknown>);
    }
    await prep.cleanup();
    return { events, runId: prep.runId };
  }

  it("successful direct run satisfies reserved = charged + refunded", async () => {
    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "direct",
      prompt: "سلام",
      models: ["economy"],
    });
    const { events, runId } = await runToCompletion(prep);

    const run = db.tables.ai_runs.find((r) => r.id === runId)!;
    expect(run.status).toBe("completed");
    expect(runBillingInvariant(run)).toBe(true);
    expect(run.charged_credits).toBe(1);
    expect(run.refunded_credits).toBe(0);
    expect(events.some((e) => e.type === "run_done")).toBe(true);
    expect(events.some((e) => e.type === "run_error" && e.errorCode === "server_error")).toBe(false);
  });

  it("successful compare run satisfies billing invariant", async () => {
    mockStreamChat.mockImplementation((input: { model: string }) => successStream(input.model));

    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "compare",
      prompt: "compare",
      models: ["cmp-deepseek-v4", "cmp-grok-4"],
    });
    const { runId } = await runToCompletion(prep);
    const run = db.tables.ai_runs.find((r) => r.id === runId)!;

    expect(run.status).toBe("completed");
    expect(runBillingInvariant(run)).toBe(true);
    expect(run.charged_credits).toBe(run.reserved_credits);
    expect(run.refunded_credits).toBe(0);
  });

  it("compare with one failed model refunds failed side", async () => {
    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "compare",
      prompt: "compare partial",
      models: ["cmp-deepseek-v4", "cmp-claude-opus"],
    });
    const { runId } = await runToCompletion(prep);
    const run = db.tables.ai_runs.find((r) => r.id === runId)!;

    expect(run.status).toBe("completed");
    expect(runBillingInvariant(run)).toBe(true);
    expect(run.charged_credits).toBeGreaterThan(0);
    expect(run.refunded_credits).toBeGreaterThan(0);
    expect((run.charged_credits as number) + (run.refunded_credits as number)).toBe(
      run.reserved_credits
    );
  });

  it("all-model failure refunds full reservation", async () => {
    mockStreamChat.mockImplementation(() => errorStream());

    const creditsBefore = db.tables.ai_users.find((u) => u.id === USER_A)!.credits as number;
    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "compare",
      prompt: "all fail",
      models: ["cmp-deepseek-v4", "cmp-grok-4"],
    });
    const { runId, events } = await runToCompletion(prep);
    const run = db.tables.ai_runs.find((r) => r.id === runId)!;

    expect(run.status).toBe("failed");
    expect(run.charged_credits).toBe(0);
    expect(run.refunded_credits).toBe(run.reserved_credits);
    expect(runBillingInvariant(run)).toBe(true);
    expect(db.tables.ai_users.find((u) => u.id === USER_A)!.credits).toBe(creditsBefore);
    expect(events.some((e) => e.type === "run_error")).toBe(true);
    expect(events.some((e) => e.type === "run_done")).toBe(false);
  });

  it("settlement failure does not emit clean run_done", async () => {
    const originalRpc = db.rpc.bind(db);
    db.rpc = vi.fn(async (fn, args) => {
      if (fn === "ai_settle_credits" || fn === "ai_refund_credits") {
        return { data: null, error: { message: "simulated settlement outage" } };
      }
      return originalRpc(fn, args);
    });

    const prep = await prepareRun({
      userId: USER_A,
      plan: "pro",
      mode: "direct",
      prompt: "settle fail",
      models: ["economy"],
    });
    const { events, runId } = await runToCompletion(prep);
    const run = db.tables.ai_runs.find((r) => r.id === runId)!;

    expect(run.status).toBe("settlement_failed");
    expect(events.some((e) => e.type === "run_done")).toBe(false);
    expect(
      events.some((e) => e.type === "run_error" && e.errorCode === "server_error")
    ).toBe(true);
  });

  it("free user cannot run Council via API", async () => {
    db.tables.ai_users.find((u) => u.id === USER_A)!.plan = "free";
    const token = signAIToken(USER_A, "free");
    const res = await createRun(
      makeRequest("/api/ai/runs", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { mode: "council", prompt: "council test" },
      })
    );
    const events = await readSseEvents(res);
    expect(res.status).toBe(200);
    expect(events.find((e) => e.type === "run_error")).toMatchObject({
      type: "run_error",
      errorCode: "plan_upgrade_required",
    });
    expect(mockStreamChat).not.toHaveBeenCalled();
  });

  it("client cannot bypass council plan gate by changing payload", async () => {
    db.tables.ai_users.find((u) => u.id === USER_A)!.plan = "starter";
    const token = signAIToken(USER_A, "starter");
    const res = await createRun(
      makeRequest("/api/ai/runs", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: {
          mode: "council",
          prompt: "bypass",
          models: ["cmp-deepseek-v4", "cmp-grok-4"],
        },
      })
    );
    const events = await readSseEvents(res);
    expect(res.status).toBe(200);
    expect(events.find((e) => e.type === "run_error")?.errorCode).toBe("plan_upgrade_required");
  });

  it("user cannot stop another user's run", async () => {
    const runId = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
    db.tables.ai_runs.push({
      id: runId,
      user_id: USER_B,
      mode: "direct",
      status: "running",
      reserved_credits: 3,
      charged_credits: 0,
      refunded_credits: 0,
    });

    const token = signAIToken(USER_A, "pro");
    const res = await stopRun(
      makeRequest(`/api/ai/runs/${runId}/stop`, {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
      }),
      { params: { id: runId } }
    );
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ ok: false, error: "run_not_found" });
  });

  it("user cannot vote on another user's run", async () => {
    const runId = "ffffffff-ffff-4fff-8fff-ffffffffffff";
    db.tables.ai_runs.push({
      id: runId,
      user_id: USER_B,
      mode: "compare",
      status: "completed",
      reserved_credits: 12,
      charged_credits: 12,
      refunded_credits: 0,
      metadata: { models: ["cmp-deepseek-v4", "cmp-grok-4"] },
    });

    const token = signAIToken(USER_A, "pro");
    const res = await vote(
      makeRequest("/api/feedback/vote", {
        method: "POST",
        cookies: { [AI_COOKIE]: token },
        body: { runId, selectedModel: "cmp-deepseek-v4" },
      })
    );
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ ok: false, error: "run_not_found" });
    expect(db.tables.feedback_votes).toHaveLength(0);
  });
});
