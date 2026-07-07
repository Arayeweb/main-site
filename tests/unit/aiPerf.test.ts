import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ModelStreamEvent } from "@/lib/ai/providers/interface";
import {
  createBillingSupabase,
  resetBillingWalletLock,
  type BillingSupabase,
} from "../mocks/billingSupabase";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

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

vi.mock("@/lib/redis/locks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/redis/locks")>();
  return {
    ...actual,
    acquireRunSlot: vi.fn(async () => true),
    releaseRunSlot: vi.fn(async () => undefined),
  };
});

import { getSupabaseAdmin } from "@/lib/supabase";
import { prepareRun } from "@/lib/ai/orchestrator";
import { ThrottledStopChecker, requestStop, STOP_POLL_INTERVAL_MS } from "@/lib/redis/locks";
import { getModel, modelRouteId } from "@/lib/aiModels";
import { RunPerfTracker, logRunPerf, perfLogsEnabled } from "@/lib/observability/perf";

async function* deltaStream(count: number): AsyncGenerator<ModelStreamEvent> {
  for (let i = 0; i < count; i++) {
    yield { type: "delta", text: `t${i}` };
  }
  yield {
    type: "done",
    text: "done",
    inputTokens: 1,
    outputTokens: count,
    cachedTokens: 0,
    costUsd: 0,
    ttftMs: 10,
    latencyMs: 50,
  };
}

describe("ThrottledStopChecker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("polls stop flag at most once per interval across many chunks", async () => {
    const runId = crypto.randomUUID();
    const checker = new ThrottledStopChecker(runId, 300);
    const signal = new AbortController().signal;

    expect(await checker.shouldStop(signal)).toBe(false);
    expect(checker.pollCount).toBe(1);
    expect(await checker.shouldStop(signal)).toBe(false);
    expect(await checker.shouldStop(signal)).toBe(false);
    expect(checker.pollCount).toBe(1);

    await requestStop(runId);
    expect(await checker.shouldStop(signal)).toBe(false);

    await vi.advanceTimersByTimeAsync(301);
    expect(await checker.shouldStop(signal)).toBe(true);
    expect(checker.pollCount).toBe(2);
  });

  it("stops immediately on local AbortSignal without polling stop flag", async () => {
    const checker = new ThrottledStopChecker("run-2", STOP_POLL_INTERVAL_MS);
    const ac = new AbortController();
    ac.abort();
    expect(await checker.shouldStop(ac.signal)).toBe(true);
    expect(checker.pollCount).toBe(0);
  });
});

describe("fast model registry", () => {
  it("maps fast persona to a distinct fast route while keeping mid-tier pricing", () => {
    const m = getModel("fast")!;
    expect(m.personaName).toBe("هوش مصنوعی سریع");
    expect(m.tier).toBe("mid");
    expect(modelRouteId("fast")).toBe("openai/gpt-4o-mini");
    expect(modelRouteId("fast")).not.toBe(getModel("economy")!.routeId);
  });
});

describe("prepareRun billing gate", () => {
  let db: BillingSupabase;

  beforeEach(() => {
    resetBillingWalletLock();
    db = createBillingSupabase({
      ai_users: [{ id: USER, plan: "pro", credits: 0 }],
      ai_runs: [],
      ai_credit_ledger: [],
    });
    vi.mocked(getSupabaseAdmin).mockReturnValue(db as never);
    mockStreamChat.mockReset();
    mockStreamChat.mockImplementation(() => deltaStream(3));
  });

  it("reserves credits via combined RPC before provider starts", async () => {
    db.tables.ai_users[0]!.credits = 20;
    const rpcSpy = vi.spyOn(db, "rpc");
    const prep = await prepareRun({
      userId: USER,
      plan: "pro",
      mode: "direct",
      prompt: "سلام",
      models: ["economy"],
    });
    expect("error" in prep).toBe(false);
    if ("error" in prep) return;

    expect(rpcSpy).toHaveBeenCalledWith(
      "ai_prepare_run_and_reserve_credits",
      expect.objectContaining({ p_user_id: USER })
    );
    expect(mockStreamChat).not.toHaveBeenCalled();

    for await (const _ev of prep.execute(new AbortController().signal)) {
      /* drain */
    }
    expect(mockStreamChat).toHaveBeenCalled();
    await prep.cleanup();
  });

  it("blocks insufficient credits before provider", async () => {
    const prep = await prepareRun({
      userId: USER,
      plan: "pro",
      mode: "direct",
      prompt: "سلام",
      models: ["economy"],
    });
    expect(prep).toMatchObject({ error: "insufficient_credits", status: 402 });
    expect(mockStreamChat).not.toHaveBeenCalled();
    expect(db.tables.ai_runs).toHaveLength(0);
  });

  it("never calls provider when combined RPC fails", async () => {
    const rpcSpy = vi.spyOn(db, "rpc");
    rpcSpy.mockResolvedValueOnce({ data: { ok: false, error: "insufficient_credits" }, error: null });
    const prep = await prepareRun({
      userId: USER,
      plan: "pro",
      mode: "direct",
      prompt: "x",
      models: ["economy"],
    });
    expect(prep).toMatchObject({ error: "insufficient_credits" });
    expect(mockStreamChat).not.toHaveBeenCalled();
  });
});

describe("RunPerfTracker logging", () => {
  it("does not log when AI_PERF_LOGS is unset", () => {
    const prev = process.env.AI_PERF_LOGS;
    delete process.env.AI_PERF_LOGS;
    expect(perfLogsEnabled()).toBe(false);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    logRunPerf({
      runId: "r1",
      userId: USER,
      mode: "direct",
      models: ["economy"],
      status: "completed",
      timings: {},
      prepareRunMs: 1,
      dbUserMs: null,
      createRunMs: 1,
      reserveCreditsMs: 1,
      providerTtftMs: 10,
      totalTtftMs: 100,
      totalRunMs: 200,
    });
    expect(logSpy).not.toHaveBeenCalled();
    process.env.AI_PERF_LOGS = prev;
    logSpy.mockRestore();
  });

  it("logs structured timings without prompt or secrets when enabled", () => {
    const prev = process.env.AI_PERF_LOGS;
    process.env.AI_PERF_LOGS = "1";
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    logRunPerf({
      runId: "r1",
      userId: USER,
      mode: "direct",
      models: ["economy"],
      status: "completed",
      timings: { request_received: 0, first_model_delta: 120 },
      prepareRunMs: 80,
      dbUserMs: null,
      createRunMs: 40,
      reserveCreditsMs: 40,
      providerTtftMs: 30,
      totalTtftMs: 120,
      totalRunMs: 250,
    });
    expect(logSpy).toHaveBeenCalledOnce();
    const line = String(logSpy.mock.calls[0]?.[0]);
    expect(line).toContain('"src":"ai-perf"');
    expect(line).not.toContain("OPENROUTER");
    expect(line).not.toContain("service_role");
    expect(line).not.toContain("سلام");
    process.env.AI_PERF_LOGS = prev;
    logSpy.mockRestore();
  });

  it("computes summary deltas from marks", () => {
    const t = new RunPerfTracker();
    t.mark("request_received");
    t.mark("validate_done");
    t.mark("plan_loaded");
    t.mark("run_created");
    t.mark("credits_reserved");
    t.mark("first_model_delta");
    t.mark("run_done");
    t.setRunId("abc");
    const s = t.summarize({ userId: USER, mode: "direct", models: ["economy"], status: "completed" });
    expect(s.prepareRunMs).toBeGreaterThanOrEqual(0);
    expect(s.totalTtftMs).not.toBeNull();
    expect(s.runId).toBe("abc");
  });
});
