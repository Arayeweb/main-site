import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ModelStreamEvent } from "@/lib/ai/providers/interface";
import {
  createBillingSupabase,
  resetBillingWalletLock,
  runBillingInvariant,
  type BillingSupabase,
} from "../mocks/billingSupabase";
import { makeRequest } from "../helpers/request";
import {
  assertSseResponse,
  readSseEvents,
  readSseEventsStreaming,
  runIdFromSseEvents,
} from "../helpers/sse";
import { signAIToken, AI_COOKIE } from "@/lib/aiAuth";
import { friendlyError } from "@/lib/ai/streaming/sse";

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const mockStreamChat = vi.fn();
let preciseModeratorCalls = 0;

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
import { POST as createRun } from "@/app/api/ai/runs/route";
import { POST as stopRun } from "@/app/api/ai/runs/[id]/stop/route";
import { POST as vote } from "@/app/api/feedback/vote/route";

async function* successStream(
  text = "ok",
  opts: Partial<Extract<ModelStreamEvent, { type: "done" }>> = {}
): AsyncGenerator<ModelStreamEvent> {
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
    ...opts,
  };
}

async function* errorStream(
  code = "provider_error",
  rawMessage = "RAW_PROVIDER_SECRET_ERROR_BODY"
): AsyncGenerator<ModelStreamEvent> {
  yield { type: "error", errorCode: code as "provider_error", message: rawMessage };
}

async function* slowStream(text = "partial"): AsyncGenerator<ModelStreamEvent> {
  yield { type: "delta", text: "start" };
  await new Promise((r) => setTimeout(r, 80));
  yield { type: "delta", text: " mid" };
  await new Promise((r) => setTimeout(r, 400));
  yield {
    type: "done",
    text,
    inputTokens: 3,
    outputTokens: 6,
    cachedTokens: 0,
    costUsd: 0.001,
    ttftMs: 40,
    latencyMs: 500,
  };
}

function defaultStreamForModel(model: string): AsyncGenerator<ModelStreamEvent> {
  if (model === "precise") {
    preciseModeratorCalls += 1;
    return preciseModeratorCalls % 2 === 1
      ? successStream("نقد شورا")
      : successStream("پاسخ نهایی ترکیبی شورا");
  }
  if (model.includes("fail") || model === "cmp-claude-opus") {
    return errorStream();
  }
  return successStream(`answer from ${model}`);
}

function seedUser(db: BillingSupabase, id: string, plan: string, credits: number) {
  db.tables.ai_users.push({ id, plan, credits });
}

function authCookie(userId: string, plan: string) {
  return { [AI_COOKIE]: signAIToken(userId, plan) };
}

function expectNoRawProviderLeak(events: Record<string, unknown>[], raw = "RAW_PROVIDER") {
  const wire = JSON.stringify(events);
  expect(wire).not.toContain(raw);
  for (const ev of events) {
    if (ev.type === "model_error" || ev.type === "run_error") {
      expect(String(ev.message ?? "")).not.toContain("RAW_PROVIDER");
      expect(String(ev.message ?? "")).not.toBe("");
    }
  }
}

describe("integration — /api/ai/runs SSE contract", () => {
  let db: BillingSupabase;

  beforeEach(() => {
    resetBillingWalletLock();
    preciseModeratorCalls = 0;
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
    seedUser(db, USER_A, "pro", 200);
    seedUser(db, USER_B, "pro", 200);
    mockStreamChat.mockReset();
    mockStreamChat.mockImplementation((input: { model: string }) =>
      defaultStreamForModel(input.model)
    );
  });

  async function postRun(
    body: Record<string, unknown>,
    userId = USER_A,
    plan = "pro"
  ) {
    return createRun(
      makeRequest("/api/ai/runs", {
        method: "POST",
        cookies: authCookie(userId, plan),
        body,
      })
    );
  }

  // -------------------------------------------------------------------------
  // A. Direct mode SSE
  // -------------------------------------------------------------------------
  describe("A. direct mode SSE", () => {
    it("streams run lifecycle events and settles credits", async () => {
      const creditsBefore = db.tables.ai_users.find((u) => u.id === USER_A)!.credits as number;

      const res = await postRun({
        mode: "direct",
        model: "auto",
        messages: [{ role: "user", content: "سلام" }],
      });

      assertSseResponse(res);
      expect(res.status).toBe(200);
      const events = await readSseEvents(res);
      expect(events.some((e) => e.type === "run_preparing")).toBe(true);
      const runId = runIdFromSseEvents(events);
      expect(runId).toBeTruthy();

      const types = events.map((e) => e.type);

      expect(types).toContain("run_started");
      expect(types).toContain("model_started");
      expect(types).toContain("model_delta");
      expect(types).toContain("model_done");
      expect(types).toContain("usage_update");
      expect(types).toContain("run_done");
      expect(types).not.toContain("run_error");

      expect(events.find((e) => e.type === "run_started")).toMatchObject({
        mode: "direct",
        models: ["economy"],
      });

      expectNoRawProviderLeak(events);

      const run = db.tables.ai_runs.find((r) => r.id === runId)!;
      expect(run.status).toBe("completed");
      expect(runBillingInvariant(run)).toBe(true);
      expect(run.charged_credits).toBe(1);
      expect(run.refunded_credits).toBe(0);
      expect(db.tables.ai_users.find((u) => u.id === USER_A)!.credits).toBe(creditsBefore - 1);
    });
  });

  // -------------------------------------------------------------------------
  // B. Compare mode SSE
  // -------------------------------------------------------------------------
  describe("B. compare mode SSE", () => {
    it("streams both models with correct tags and billing invariant", async () => {
      const res = await postRun({
        mode: "compare",
        prompt: "compare me",
        modelA: "cmp-deepseek-v4",
        modelB: "cmp-grok-4",
      });

      assertSseResponse(res);
      const events = await readSseEvents(res);
      const runId = runIdFromSseEvents(events);

      const started = events.filter((e) => e.type === "model_started");
      expect(started).toHaveLength(2);
      expect(started.map((e) => e.model).sort()).toEqual(
        ["cmp-deepseek-v4", "cmp-grok-4"].sort()
      );

      const deltas = events.filter((e) => e.type === "model_delta");
      expect(deltas.length).toBeGreaterThanOrEqual(2);
      const deltaModels = new Set(deltas.map((e) => e.model));
      expect(deltaModels.has("cmp-deepseek-v4")).toBe(true);
      expect(deltaModels.has("cmp-grok-4")).toBe(true);

      const doneModels = events
        .filter((e) => e.type === "model_done")
        .map((e) => e.model);
      expect(doneModels.sort()).toEqual(["cmp-deepseek-v4", "cmp-grok-4"].sort());

      expect(events.some((e) => e.type === "run_done")).toBe(true);
      expectNoRawProviderLeak(events);

      const run = db.tables.ai_runs.find((r) => r.id === runId)!;
      expect(run.status).toBe("completed");
      expect(runBillingInvariant(run)).toBe(true);
      expect(run.charged_credits).toBe(run.reserved_credits);
      expect(run.refunded_credits).toBe(0);
    });
  });

  // -------------------------------------------------------------------------
  // C. Compare partial failure
  // -------------------------------------------------------------------------
  describe("C. compare partial failure", () => {
    it("emits model_error for failed side, completes with refund", async () => {
      const res = await postRun({
        mode: "compare",
        prompt: "partial fail",
        models: ["cmp-deepseek-v4", "cmp-claude-opus"],
      });

      const events = await readSseEvents(res);
      const runId = runIdFromSseEvents(events);

      const err = events.find((e) => e.type === "model_error");
      expect(err).toMatchObject({ model: "cmp-claude-opus" });
      expect(events.some((e) => e.type === "model_done" && e.model === "cmp-deepseek-v4")).toBe(
        true
      );
      expect(events.some((e) => e.type === "run_done")).toBe(true);
      expectNoRawProviderLeak(events, "RAW_PROVIDER_SECRET");

      const run = db.tables.ai_runs.find((r) => r.id === runId)!;
      expect(run.status).toBe("completed");
      expect(runBillingInvariant(run)).toBe(true);
      expect(run.charged_credits).toBeGreaterThan(0);
      expect(run.refunded_credits).toBeGreaterThan(0);
      expect((run.charged_credits as number) + (run.refunded_credits as number)).toBe(
        run.reserved_credits
      );
    });
  });

  // -------------------------------------------------------------------------
  // D. Council mode SSE
  // -------------------------------------------------------------------------
  describe("D. council mode SSE", () => {
    it("streams member cards, critique, synthesis, and run_done", async () => {
      const res = await postRun({
        mode: "council",
        prompt: "council question",
        models: ["cmp-deepseek-v4", "cmp-grok-4"],
      });

      const events = await readSseEvents(res);
      const runId = runIdFromSseEvents(events);
      const types = events.map((e) => e.type);

      expect(types.filter((t) => t === "model_started").length).toBeGreaterThanOrEqual(2);
      expect(types).toContain("model_delta");
      expect(types).toContain("critique_started");
      expect(types).toContain("critique_delta");
      expect(types).toContain("summary_started");
      expect(types).toContain("summary_delta");
      expect(types).toContain("run_done");

      const summaryText = events
        .filter((e) => e.type === "summary_delta")
        .map((e) => String(e.text ?? ""))
        .join("");
      expect(summaryText.length).toBeGreaterThan(0);

      expectNoRawProviderLeak(events);

      const run = db.tables.ai_runs.find((r) => r.id === runId)!;
      expect(run.status).toBe("completed");
      expect(runBillingInvariant(run)).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // E. Council plan gate
  // -------------------------------------------------------------------------
  describe("E. council plan gate", () => {
    it.each([
      ["free", "free"],
      ["starter", "starter"],
      ["core", "starter"],
    ] as const)("blocks %s plan from council", async (_label, plan) => {
      db.tables.ai_users.find((u) => u.id === USER_A)!.plan = plan;
      const res = await postRun({ mode: "council", prompt: "gate test" }, USER_A, plan);
      const events = await readSseEvents(res);

      expect(res.status).toBe(200);
      expect(events.find((e) => e.type === "run_error")).toMatchObject({
        errorCode: "plan_upgrade_required",
      });
      expect(mockStreamChat).not.toHaveBeenCalled();
    });

    it("allows pro user with sufficient credits", async () => {
      const res = await postRun({
        mode: "council",
        prompt: "pro council",
        models: ["cmp-deepseek-v4", "cmp-grok-4"],
      });

      assertSseResponse(res);
      expect(res.status).toBe(200);
      const events = await readSseEvents(res);
      expect(events.some((e) => e.type === "run_done")).toBe(true);
      expect(mockStreamChat).toHaveBeenCalled();
    });

    it("allows business (max) user with sufficient credits", async () => {
      db.tables.ai_users.find((u) => u.id === USER_A)!.plan = "business";
      const res = await postRun(
        { mode: "council", prompt: "max council", models: ["cmp-deepseek-v4", "cmp-grok-4"] },
        USER_A,
        "business"
      );
      expect(res.status).toBe(200);
      const events = await readSseEvents(res);
      expect(events.some((e) => e.type === "run_done")).toBe(true);
    });

    it("rejects custom model list bypass for council on starter", async () => {
      db.tables.ai_users.find((u) => u.id === USER_A)!.plan = "starter";
      const res = await postRun(
        {
          mode: "council",
          prompt: "bypass",
          models: ["cmp-deepseek-v4", "cmp-grok-4"],
        },
        USER_A,
        "starter"
      );
      const events = await readSseEvents(res);
      expect(res.status).toBe(200);
      expect(events.find((e) => e.type === "run_error")?.errorCode).toBe("plan_upgrade_required");
    });

    it("returns 422 for unsafe council model IDs", async () => {
      const res = await postRun({
        mode: "council",
        prompt: "unsafe models",
        models: ["image-gpt", "video-sora"],
      });
      const events = await readSseEvents(res);
      expect(res.status).toBe(200);
      expect(events.find((e) => e.type === "run_error")).toMatchObject({
        type: "run_error",
        errorCode: "invalid_model",
      });
    });
  });

  // -------------------------------------------------------------------------
  // E2. plan source-of-truth (DB vs cookie)
  // -------------------------------------------------------------------------
  describe("E2. plan source-of-truth", () => {
    it("allows compare when DB plan is upgraded even if cookie plan is stale", async () => {
      db.tables.ai_users.find((u) => u.id === USER_A)!.plan = "business";

      const res = await postRun(
        {
          mode: "compare",
          prompt: "stale cookie compare",
          modelA: "cmp-deepseek-v4",
          modelB: "cmp-grok-4",
        },
        USER_A,
        "free"
      );

      expect(res.status).toBe(200);
      const events = await readSseEvents(res);
      expect(events.some((e) => e.type === "run_done")).toBe(true);
      expect(events.some((e) => e.type === "run_error")).toBe(false);
    });

    it("blocks compare when cookie plan is higher but DB plan is free", async () => {
      db.tables.ai_users.find((u) => u.id === USER_A)!.plan = "free";

      const res = await postRun(
        {
          mode: "compare",
          prompt: "db free must block",
          modelA: "cmp-deepseek-v4",
          modelB: "cmp-grok-4",
        },
        USER_A,
        "business"
      );

      expect(res.status).toBe(200);
      const events = await readSseEvents(res);
      expect(events.find((e) => e.type === "run_error")?.errorCode).toBe("plan_upgrade_required");
      expect(mockStreamChat).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // F. Stop endpoint
  // -------------------------------------------------------------------------
  describe("F. stop endpoint", () => {
    it("cancels owned run, aborts stream, refunds, and marks cancelled", async () => {
      mockStreamChat.mockImplementation(() => slowStream());

      const creditsBefore = db.tables.ai_users.find((u) => u.id === USER_A)!.credits as number;
      const res = await postRun({
        mode: "direct",
        prompt: "stop me",
        model: "economy",
      });

      let runId = "";
      let runStarted = false;
      const streamDone = readSseEventsStreaming(res, {
        onEvent: (ev) => {
          if (ev.type === "run_started") {
            runStarted = true;
            runId = String(ev.runId);
          }
        },
      });

      const deadline = Date.now() + 3000;
      while (!runStarted && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 15));
      }
      expect(runStarted).toBe(true);

      const stopRes = await stopRun(
        makeRequest(`/api/ai/runs/${runId}/stop`, {
          method: "POST",
          cookies: authCookie(USER_A, "pro"),
        }),
        { params: { id: runId } }
      );
      expect(stopRes.status).toBe(200);
      await expect(stopRes.json()).resolves.toMatchObject({
        ok: true,
        status: "stopping",
        aborted: true,
      });

      const events = await streamDone;
      const runDone = events.find((e) => e.type === "run_done");
      expect(runDone).toMatchObject({ status: "cancelled" });

      const run = db.tables.ai_runs.find((r) => r.id === runId)!;
      expect(run.status).toBe("cancelled");
      expect(run.charged_credits).toBe(0);
      expect(run.refunded_credits).toBe(run.reserved_credits);
      expect(runBillingInvariant(run)).toBe(true);
      expect(db.tables.ai_users.find((u) => u.id === USER_A)!.credits).toBe(creditsBefore);
    });

    it("rejects stop for another user's run", async () => {
      const runId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
      db.tables.ai_runs.push({
        id: runId,
        user_id: USER_B,
        mode: "direct",
        status: "running",
        reserved_credits: 3,
        charged_credits: 0,
        refunded_credits: 0,
      });

      const res = await stopRun(
        makeRequest(`/api/ai/runs/${runId}/stop`, {
          method: "POST",
          cookies: authCookie(USER_A, "pro"),
        }),
        { params: { id: runId } }
      );
      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ ok: false, error: "run_not_found" });
    });
  });

  // -------------------------------------------------------------------------
  // G. Request validation
  // -------------------------------------------------------------------------
  describe("G. request validation", () => {
    it.each([
      [{ mode: "battle" }, "bad_request"],
      [{ mode: "direct", conversationId: "not-a-uuid", prompt: "hi", model: "economy" }, "bad_request"],
      [{ mode: "direct", messages: [{ role: "hacker", content: "x" }] }, "bad_request"],
      [{ mode: "direct", messages: [{ role: "user", content: "   " }] }, "missing_prompt"],
    ] as const)("rejects unsafe payload %j with %s", async (body, code) => {
      const res = await postRun(body as Record<string, unknown>);
      const events = await readSseEvents(res);
      expect(events[0]).toMatchObject({ type: "run_error", errorCode: code });
      expect(res.status).toBeGreaterThanOrEqual(400);
    });

    it("rejects compare with too many models", async () => {
      const res = await postRun({
        mode: "compare",
        prompt: "too many",
        models: ["cmp-deepseek-v4", "cmp-grok-4", "cmp-gpt-55", "cmp-claude-haiku"],
      });
      const events = await readSseEvents(res);
      expect(res.status).toBe(200);
      expect(events.find((e) => e.type === "run_error")?.errorCode).toBe("invalid_model");
    });

    it("rejects unknown direct model ID", async () => {
      const res = await postRun({
        mode: "direct",
        prompt: "hello",
        model: "not-a-real-model-slug",
      });
      const events = await readSseEvents(res);
      expect(res.status).toBe(200);
      expect(events.find((e) => e.type === "run_error")?.errorCode).toBe("invalid_model");
    });

    it("ignores unknown fields in payload", async () => {
      const res = await postRun({
        mode: "direct",
        prompt: "safe",
        model: "economy",
        evilReservedCredits: 99999,
        userId: USER_B,
      });
      assertSseResponse(res);
      expect(res.status).toBe(200);
      const events = await readSseEvents(res);
      const runId = runIdFromSseEvents(events);
      const run = db.tables.ai_runs.find((r) => r.id === runId)!;
      expect(run.user_id).toBe(USER_A);
      expect(run.reserved_credits).not.toBe(99999);
    });
  });

  // -------------------------------------------------------------------------
  // H. Feedback vote
  // -------------------------------------------------------------------------
  describe("H. feedback vote", () => {
    const runId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

    beforeEach(() => {
      db.tables.ai_runs.push({
        id: runId,
        user_id: USER_A,
        mode: "compare",
        status: "completed",
        reserved_credits: 12,
        charged_credits: 12,
        refunded_credits: 0,
        metadata: { models: ["cmp-deepseek-v4", "cmp-grok-4"] },
      });
    });

    it("allows user to vote on own compare run", async () => {
      const res = await vote(
        makeRequest("/api/feedback/vote", {
          method: "POST",
          cookies: authCookie(USER_A, "pro"),
          body: { runId, selectedModel: "cmp-deepseek-v4", rating: 5 },
        })
      );
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ ok: true });
      expect(db.tables.feedback_votes).toHaveLength(1);
      expect(db.tables.feedback_votes[0]).toMatchObject({
        user_id: USER_A,
        run_id: runId,
        selected_model: "cmp-deepseek-v4",
        rating: 5,
      });
    });

    it("rejects vote on another user's run", async () => {
      const res = await vote(
        makeRequest("/api/feedback/vote", {
          method: "POST",
          cookies: authCookie(USER_B, "pro"),
          body: { runId, selectedModel: "cmp-deepseek-v4" },
        })
      );
      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ ok: false, error: "run_not_found" });
      expect(db.tables.feedback_votes).toHaveLength(0);
    });

    it("rejects selected model not part of the run", async () => {
      const res = await vote(
        makeRequest("/api/feedback/vote", {
          method: "POST",
          cookies: authCookie(USER_A, "pro"),
          body: { runId, selectedModel: "cmp-claude-opus" },
        })
      );
      expect(res.status).toBe(422);
      await expect(res.json()).resolves.toEqual({ ok: false, error: "invalid_model" });
    });

    it("rejects empty vote payload", async () => {
      const res = await vote(
        makeRequest("/api/feedback/vote", {
          method: "POST",
          cookies: authCookie(USER_A, "pro"),
          body: { runId },
        })
      );
      expect(res.status).toBe(422);
      await expect(res.json()).resolves.toEqual({ ok: false, error: "missing_vote" });
    });
  });
});

describe("integration — SSE error messages are sanitized at route boundary", () => {
  it("maps model_error to friendly Persian, never raw provider text", async () => {
    const encoded = friendlyError("provider_error");
    expect(encoded).not.toContain("RAW");
    expect(encoded.length).toBeGreaterThan(5);
  });
});
