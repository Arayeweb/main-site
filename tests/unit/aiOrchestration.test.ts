import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase", () => ({
  getSupabaseAdmin: vi.fn(),
}));

vi.mock("@/lib/aiAuth", () => ({
  getAISession: vi.fn(),
}));

import { multiplex } from "@/lib/ai/streaming/multiplexer";
import type { ModelStreamEvent } from "@/lib/ai/providers/interface";
import { estimateRunCredits, creditsForModel } from "@/lib/ai/usage/estimate";
import {
  computeActualCredits,
  isSettlementInvariantValid,
  settleRun,
} from "@/lib/ai/usage/settle";
import { encodeSSE, friendlyError } from "@/lib/ai/streaming/sse";
import { validatePrompt } from "@/lib/ai/safety/moderation";
import { hourlyLimit, maxConcurrency } from "@/lib/redis/rate-limit";
import { acquireRunSlot } from "@/lib/redis/locks";
import { getModel } from "@/lib/aiModels";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { parseRunBody } from "@/lib/ai/requestValidation";
import {
  abortRun,
  isRunAbortRegistered,
  registerRunAbortController,
  unregisterRunAbortController,
} from "@/lib/ai/runAbortRegistry";
import { prepareRun } from "@/lib/ai/orchestrator";
import { OpenRouterProvider } from "@/lib/ai/providers/openrouter";
import { POST as stopRun } from "@/app/api/ai/runs/[id]/stop/route";
import { NextRequest } from "next/server";

async function* fakeStream(
  events: ModelStreamEvent[],
  delayMs = 0
): AsyncIterable<ModelStreamEvent> {
  for (const ev of events) {
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    yield ev;
  }
}

const doneEvent = (text: string): ModelStreamEvent => ({
  type: "done",
  text,
  inputTokens: 10,
  outputTokens: 20,
  cachedTokens: 0,
  costUsd: 0.001,
  ttftMs: 100,
  latencyMs: 500,
});

describe("streaming/multiplexer", () => {
  it("merges events from multiple streams tagged by model", async () => {
    const a = fakeStream([{ type: "delta", text: "A1" }, doneEvent("A1")]);
    const b = fakeStream([{ type: "delta", text: "B1" }, doneEvent("B1")]);

    const events: { model: string; type: string }[] = [];
    for await (const { model, event } of multiplex([
      ["model-a", a],
      ["model-b", b],
    ])) {
      events.push({ model, type: event.type });
    }

    const aEvents = events.filter((e) => e.model === "model-a");
    const bEvents = events.filter((e) => e.model === "model-b");
    expect(aEvents.map((e) => e.type)).toEqual(["delta", "done"]);
    expect(bEvents.map((e) => e.type)).toEqual(["delta", "done"]);
  });

  it("continues remaining streams when one errors", async () => {
    const failing = fakeStream([
      { type: "error", errorCode: "provider_error", message: "boom" },
    ]);
    const healthy = fakeStream(
      [{ type: "delta", text: "ok" }, doneEvent("ok")],
      5
    );

    const events: { model: string; type: string }[] = [];
    for await (const { model, event } of multiplex([
      ["bad", failing],
      ["good", healthy],
    ])) {
      events.push({ model, type: event.type });
    }

    expect(events.filter((e) => e.model === "bad").map((e) => e.type)).toEqual([
      "error",
    ]);
    expect(events.filter((e) => e.model === "good").map((e) => e.type)).toEqual([
      "delta",
      "done",
    ]);
  });

  it("stops a stream after its error event (no further events consumed)", async () => {
    const failing = fakeStream([
      { type: "error", errorCode: "network_error", message: "x" },
      { type: "delta", text: "should never appear" },
    ]);
    const events: string[] = [];
    for await (const { event } of multiplex([["m", failing]])) {
      events.push(event.type);
    }
    expect(events).toEqual(["error"]);
  });

  it("calls child iterator.return() on early exit", async () => {
    let returned = false;
    const iterable: AsyncIterable<ModelStreamEvent> = {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            return { done: false, value: { type: "delta", text: "x" } };
          },
          async return() {
            returned = true;
            return { done: true, value: undefined };
          },
        } satisfies AsyncIterator<ModelStreamEvent>;
      },
    };

    for await (const _ of multiplex([["m", iterable]])) {
      break;
    }

    expect(returned).toBe(true);
  });

  it("calls return() on errored streams when consumer exits early", async () => {
    let healthyReturned = false;
    const failing = fakeStream([
      { type: "error", errorCode: "provider_error", message: "boom" },
    ]);
    const healthy: AsyncIterable<ModelStreamEvent> = {
      [Symbol.asyncIterator]() {
        return {
          async next() {
            return { done: false, value: { type: "delta", text: "x" } };
          },
          async return() {
            healthyReturned = true;
            return { done: true, value: undefined };
          },
        } satisfies AsyncIterator<ModelStreamEvent>;
      },
    };

    for await (const _ of multiplex([
      ["bad", failing],
      ["good", healthy],
    ])) {
      break;
    }

    expect(healthyReturned).toBe(true);
  });
});

describe("usage/estimate", () => {
  it("maps models to per-model chat credits", () => {
    expect(creditsForModel(getModel("economy")!)).toBe(2);
    expect(creditsForModel(getModel("fast")!)).toBe(2);
    expect(creditsForModel(getModel("precise")!)).toBe(17);
  });

  it("direct run costs the single model price", () => {
    expect(estimateRunCredits("direct", ["economy"])).toBe(2);
    expect(estimateRunCredits("direct", ["precise"])).toBe(17);
  });

  it("compare run sums both models", () => {
    expect(estimateRunCredits("compare", ["cmp-gpt-55", "cmp-claude-opus"])).toBe(38);
  });

  it("council reserves member costs plus critique and synthesis", () => {
    const base = estimateRunCredits("compare", ["cmp-deepseek-v4", "cmp-grok-4"]);
    const council = estimateRunCredits("council", ["cmp-deepseek-v4", "cmp-grok-4"]);
    expect(council).toBeGreaterThan(base);
    expect(council).toBe(89);
  });

  it("adds vision surcharge", () => {
    expect(estimateRunCredits("direct", ["precise"], { hasVision: true })).toBe(18);
  });

  it("adds web search surcharge", () => {
    expect(estimateRunCredits("direct", ["economy"], { webSearch: true })).toBe(7);
  });
});

describe("usage/settle", () => {
  it("charges only successful calls", () => {
    const actual = computeActualCredits([
      { model: "a", credits: 6, succeeded: true },
      { model: "b", credits: 6, succeeded: false },
    ]);
    expect(actual).toBe(6);
  });

  it("returns zero when all calls fail", () => {
    expect(
      computeActualCredits([
        { model: "a", credits: 3, succeeded: false },
        { model: "b", credits: 3, succeeded: false },
      ])
    ).toBe(0);
  });

  it("validates the reserved = charged + refunded invariant", () => {
    expect(isSettlementInvariantValid(12, 6, 6)).toBe(true);
    expect(isSettlementInvariantValid(12, 12, 0)).toBe(true);
    expect(isSettlementInvariantValid(12, 0, 12)).toBe(true);
    expect(isSettlementInvariantValid(12, 6, 5)).toBe(false);
    expect(isSettlementInvariantValid(12, 13, 0)).toBe(false);
    expect(isSettlementInvariantValid(12, -1, 13)).toBe(false);
  });

  it("returns settlement_failed when settle RPC fails", async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } }),
    } as never);

    const result = await settleRun("user-1", "run-1", 12, [
      { model: "a", credits: 6, succeeded: true },
    ]);

    expect(result).toEqual({
      ok: false,
      error: "settlement_failed",
      chargedCredits: 0,
      refundedCredits: 0,
      creditsRemaining: null,
    });
  });

  it("fails closed instead of silently capping usage above the reserve", async () => {
    const rpc = vi.fn();
    vi.mocked(getSupabaseAdmin).mockReturnValue({ rpc } as never);

    const result = await settleRun("user-1", "run-overflow", 5, [
      { model: "a", credits: 8, succeeded: true },
    ]);

    expect(result).toMatchObject({ ok: false, error: "settlement_failed" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns settlement_failed when full refund RPC fails", async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } }),
    } as never);

    const result = await settleRun("user-1", "run-1", 12, [
      { model: "a", credits: 6, succeeded: false },
      { model: "b", credits: 6, succeeded: false },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("settlement_failed");
  });
});

describe("streaming/sse", () => {
  it("encodes events in SSE wire format", () => {
    const wire = encodeSSE({
      type: "model_delta",
      runId: "r1",
      model: "gpt",
      text: "سلام",
    });
    expect(wire.startsWith("data: ")).toBe(true);
    expect(wire.endsWith("\n\n")).toBe(true);
    expect(JSON.parse(wire.slice(6))).toEqual({
      type: "model_delta",
      runId: "r1",
      model: "gpt",
      text: "سلام",
    });
  });

  it("maps unknown error codes to a safe Persian message", () => {
    expect(friendlyError("weird_internal_thing")).toBe(friendlyError("server_error"));
    expect(friendlyError("insufficient_credits")).toContain("کردیت");
  });
});

describe("safety/moderation", () => {
  it("rejects empty prompt", () => {
    expect(validatePrompt("   ")).toEqual({ ok: false, error: "missing_prompt" });
  });

  it("strips control characters", () => {
    const r = validatePrompt("hello\u0000\u0007 world");
    expect(r).toEqual({ ok: true, prompt: "hello world" });
  });

  it("truncates prompts over the max length", () => {
    const r = validatePrompt("x".repeat(10_000));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.prompt.length).toBe(4000);
  });
});

describe("redis/rate-limit plan gates", () => {
  it("blocks council for free and starter plans", () => {
    expect(hourlyLimit("free", "council")).toBe(0);
    expect(hourlyLimit("starter", "council")).toBe(0);
    expect(hourlyLimit("pro", "council")).toBeGreaterThan(0);
  });

  it("gives free plan one compare trial per hour", () => {
    expect(hourlyLimit("free", "compare")).toBe(1);
  });

  it("scales concurrency by plan", () => {
    expect(maxConcurrency("free")).toBe(1);
    expect(maxConcurrency("pro")).toBe(2);
    expect(maxConcurrency("business")).toBe(4);
  });

  it("fails closed for expensive modes when redis is unavailable", async () => {
    const previousUrl = process.env.UPSTASH_REDIS_REST_URL;
    const previousToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    await expect(acquireRunSlot("u-fail-closed", 2, { failClosed: true })).resolves.toBe(false);

    if (previousUrl) process.env.UPSTASH_REDIS_REST_URL = previousUrl;
    if (previousToken) process.env.UPSTASH_REDIS_REST_TOKEN = previousToken;
  });
});

describe("request validation", () => {
  it("rejects invalid conversationId before Supabase filters", () => {
    expect(parseRunBody({ mode: "direct", conversationId: "not-a-uuid" })).toEqual({
      ok: false,
      error: "bad_request",
    });
  });

  it("accepts compare modelA/modelB payload shape", () => {
    expect(
      parseRunBody({
        mode: "compare",
        modelA: "cmp-deepseek-v4",
        modelB: "cmp-grok-4",
      })
    ).toMatchObject({
      ok: true,
      mode: "compare",
      models: ["cmp-deepseek-v4", "cmp-grok-4"],
    });
  });

  it("rejects malformed messages array", () => {
    expect(
      parseRunBody({
        mode: "direct",
        messages: [{ role: "hacker", content: "x" }],
      })
    ).toEqual({ ok: false, error: "bad_request" });
  });
});

describe("stop endpoint", () => {
  const runId = "11111111-1111-4111-8111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects stop when run belongs to another user", async () => {
    vi.mocked(getAISession).mockReturnValue({ userId: "user-a" } as never);
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: runId, user_id: "user-b", status: "running" },
            }),
          }),
        }),
      }),
    } as never);

    const res = await stopRun(new NextRequest("http://localhost"), { params: { id: runId } });
    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ ok: false, error: "run_not_found" });
  });

  it("aborts a registered controller for an owned running run", async () => {
    vi.mocked(getAISession).mockReturnValue({ userId: "user-a" } as never);
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: runId, user_id: "user-a", status: "running" },
            }),
          }),
        }),
      }),
    } as never);

    const controller = new AbortController();
    registerRunAbortController(runId, controller);

    const res = await stopRun(new NextRequest("http://localhost"), { params: { id: runId } });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true, status: "stopping", aborted: true });
    expect(controller.signal.aborted).toBe(true);

    unregisterRunAbortController(runId);
  });
});

describe("cancelled run settlement", () => {
  it("refunds the full reservation when no successful settlements are passed", async () => {
    vi.mocked(getSupabaseAdmin).mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: 42, error: null }),
    } as never);

    const result = await settleRun("user-1", "run-cancel", 12, []);
    expect(result).toEqual({
      ok: true,
      chargedCredits: 0,
      refundedCredits: 12,
      creditsRemaining: 42,
    });
  });
});

describe("run abort registry", () => {
  it("aborts an active run controller", () => {
    const controller = new AbortController();
    registerRunAbortController("run-abort-test", controller);

    expect(isRunAbortRegistered("run-abort-test")).toBe(true);
    expect(abortRun("run-abort-test")).toBe(true);
    expect(controller.signal.aborted).toBe(true);

    unregisterRunAbortController("run-abort-test");
    expect(isRunAbortRegistered("run-abort-test")).toBe(false);
  });
});

describe("council model validation", () => {
  it("rejects council for free/core plans before provider or DB work", async () => {
    const result = await prepareRun({
      userId: "user-1",
      plan: "starter",
      mode: "council",
      prompt: "سلام",
      models: [],
    });

    expect(result).toEqual({ error: "plan_upgrade_required", status: 403 });
  });

  it("rejects unsafe arbitrary council model IDs", async () => {
    const result = await prepareRun({
      userId: "user-1",
      plan: "pro",
      mode: "council",
      prompt: "سلام",
      models: ["image-gpt", "video-sora"],
    });

    expect(result).toEqual({ error: "invalid_model", status: 422 });
  });
});

describe("provider error sanitization", () => {
  it("does not expose raw OpenRouter error body in stream events", async () => {
    const previousKey = process.env.OPENROUTER_API_KEY;
    process.env.OPENROUTER_API_KEY = "test-key";
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("raw secret provider payload", { status: 500 })
    );

    const provider = new OpenRouterProvider();
    const events: ModelStreamEvent[] = [];
    for await (const ev of provider.streamChat({
      model: "economy",
      messages: [{ role: "user", content: "سلام" }],
      maxTokens: 10,
    })) {
      events.push(ev);
    }

    expect(events[0]).toMatchObject({
      type: "error",
      errorCode: "provider_error",
      message: "openrouter_http_500",
    });
    expect(JSON.stringify(events)).not.toContain("raw secret provider payload");

    fetchSpy.mockRestore();
    if (previousKey) process.env.OPENROUTER_API_KEY = previousKey;
    else delete process.env.OPENROUTER_API_KEY;
  });
});
