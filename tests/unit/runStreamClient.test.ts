import { describe, it, expect, vi, beforeEach } from "vitest";
import { encodeSSE } from "@/lib/ai/streaming/sse";
import {
  startRunStream,
  runStreamErrorMessage,
  classifyRunStreamError,
  requestRunStop,
} from "@/lib/ai/client/runStream";
import { buildRunMessages } from "@/lib/ai/client/buildMessages";

function sseResponse(events: Parameters<typeof encodeSSE>[0][], opts?: { status?: number; runId?: string }) {
  const body = events.map((e) => encodeSSE(e)).join("");
  return new Response(body, {
    status: opts?.status ?? 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      ...(opts?.runId ? { "X-Run-Id": opts.runId } : {}),
    },
  });
}

describe("lib/ai/client/runStream", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("parses direct run SSE lifecycle", async () => {
    const runId = "11111111-1111-4111-8111-111111111111";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse(
          [
            { type: "run_started", runId, mode: "direct", models: ["economy"] },
            { type: "model_delta", runId, model: "economy", text: "سلام" },
            { type: "model_done", runId, model: "economy", inputTokens: 1, outputTokens: 2, ttftMs: 10, latencyMs: 100 },
            { type: "usage_update", runId, creditsCharged: 1, creditsRemaining: 49 },
            { type: "run_done", runId, status: "completed", chargedCredits: 1 },
          ],
          { runId }
        )
      )
    );

    const events: string[] = [];
    const result = await startRunStream(
      {
        mode: "direct",
        model: "economy",
        messages: [{ role: "user", content: "سلام" }],
      },
      {
        onEvent: (ev) => events.push(ev.type),
      }
    );

    expect(fetch).toHaveBeenCalledWith(
      "/api/ai/runs",
      expect.objectContaining({ method: "POST" })
    );
    const body = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
    expect(body.mode).toBe("direct");
    expect(body.model).toBe("economy");
    expect(body.messages).toEqual([{ role: "user", content: "سلام" }]);
    expect(events).toEqual([
      "run_started",
      "model_delta",
      "model_done",
      "usage_update",
      "run_done",
    ]);
    expect(result.runId).toBe(runId);
    expect(result.status).toBe("completed");
  });

  it("does not call /api/ai/chat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          {
            type: "run_started",
            runId: "r1",
            mode: "direct",
            models: ["economy"],
          },
          { type: "run_done", runId: "r1", status: "completed", chargedCredits: 1 },
        ])
      )
    );

    await startRunStream({ mode: "direct", model: "economy", prompt: "hi" });
    expect(String(vi.mocked(fetch).mock.calls[0][0])).not.toContain("/api/ai/chat");
  });

  it("routes compare model_delta by model id", async () => {
    const runId = "22222222-2222-4222-8222-222222222222";
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          { type: "run_started", runId, mode: "compare", models: ["cmp-a", "cmp-b"] },
          { type: "model_delta", runId, model: "cmp-a", text: "A" },
          { type: "model_delta", runId, model: "cmp-b", text: "B" },
          { type: "run_done", runId, status: "completed", chargedCredits: 4 },
        ])
      )
    );

    const byModel: Record<string, string> = {};
    await startRunStream(
      {
        mode: "compare",
        models: ["cmp-a", "cmp-b"],
        messages: [{ role: "user", content: "compare" }],
      },
      {
        onEvent: (ev) => {
          if (ev.type === "model_delta") {
            byModel[ev.model] = (byModel[ev.model] ?? "") + ev.text;
          }
        },
      }
    );

    expect(byModel).toEqual({ "cmp-a": "A", "cmp-b": "B" });
  });

  it("handles compare partial failure with model_error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          {
            type: "run_started",
            runId: "r-partial",
            mode: "compare",
            models: ["cmp-a", "cmp-b"],
          },
          { type: "model_delta", runId: "r-partial", model: "cmp-a", text: "ok" },
          {
            type: "model_error",
            runId: "r-partial",
            model: "cmp-b",
            errorCode: "provider_error",
            message: "RAW_SECRET",
          },
          { type: "run_done", runId: "r-partial", status: "completed", chargedCredits: 1 },
        ])
      )
    );

    const errors: Record<string, string> = {};
    const deltas: Record<string, string> = {};
    await startRunStream(
      { mode: "compare", models: ["cmp-a", "cmp-b"], prompt: "x" },
      {
        onEvent: (ev) => {
          if (ev.type === "model_error") {
            errors[ev.model] = runStreamErrorMessage(ev.errorCode);
          }
          if (ev.type === "model_delta") deltas[ev.model] = (deltas[ev.model] ?? "") + ev.text;
        },
      }
    );

    expect(deltas["cmp-a"]).toBe("ok");
    expect(errors["cmp-b"]).toBeTruthy();
    expect(JSON.stringify(errors)).not.toContain("RAW_SECRET");
  });

  it("streams council critique and synthesis phases", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        sseResponse([
          {
            type: "run_started",
            runId: "r-council",
            mode: "council",
            models: ["cmp-a", "cmp-b"],
          },
          { type: "model_delta", runId: "r-council", model: "cmp-a", text: "a1" },
          { type: "critique_started", runId: "r-council" },
          { type: "critique_delta", runId: "r-council", text: "crit" },
          { type: "summary_started", runId: "r-council" },
          { type: "summary_delta", runId: "r-council", text: "final" },
          { type: "run_done", runId: "r-council", status: "completed", chargedCredits: 11 },
        ])
      )
    );

    const types: string[] = [];
    let summary = "";
    await startRunStream({ mode: "council", prompt: "council" }, {
      onEvent: (ev) => {
        types.push(ev.type);
        if (ev.type === "summary_delta") summary += ev.text;
      },
    });

    expect(types).toContain("critique_started");
    expect(types).toContain("summary_started");
    expect(summary).toBe("final");
  });

  it("maps unauthorized pre-stream SSE to classified error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          encodeSSE({
            type: "run_error",
            runId: "",
            errorCode: "unauthorized",
            message: "برای استفاده وارد حساب خود شوید.",
          }),
          { status: 401, headers: { "Content-Type": "text/event-stream; charset=utf-8" } }
        )
      )
    );

    const result = await startRunStream({ mode: "direct", model: "economy", prompt: "hi" });
    expect(result.status).toBe("failed");
    expect(classifyRunStreamError(result.lastErrorCode!)).toBe("unauthorized");
  });

  it("requestRunStop calls stop endpoint", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal("fetch", fetchMock);

    await requestRunStop("33333333-3333-4333-8333-333333333333");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/ai/runs/33333333-3333-4333-8333-333333333333/stop",
      { method: "POST" }
    );
  });

  it("never exposes raw provider strings in friendly messages", () => {
    expect(runStreamErrorMessage("provider_error")).not.toContain("RAW");
    expect(runStreamErrorMessage("weird_internal")).toBe(runStreamErrorMessage("server_error"));
  });
});

describe("lib/ai/client/buildMessages", () => {
  it("builds user/assistant pairs from prior turns", () => {
    expect(
      buildRunMessages(
        [
          { id: "1", prompt: "q1", response: "a1" },
          { id: "2", prompt: "q2", response: "a2" },
        ],
        "q3"
      )
    ).toEqual([
      { role: "user", content: "q1" },
      { role: "assistant", content: "a1" },
      { role: "user", content: "q2" },
      { role: "assistant", content: "a2" },
      { role: "user", content: "q3" },
    ]);
  });
});
