// =========================================================
// Run performance instrumentation — stage timings for TTFT analysis.
// Gated by AI_PERF_LOGS=1; never logs prompts, keys, or raw provider bodies.
// =========================================================

import type { RunMode } from "@/lib/ai/streaming/sse";

export type RunPerfStage =
  | "request_received"
  | "auth_done"
  | "validate_done"
  | "plan_loaded"
  | "run_created"
  | "credits_reserved"
  | "provider_started"
  | "first_model_delta"
  | "model_done"
  | "settlement_done"
  | "run_done";

export type RunPerfTimings = Partial<Record<RunPerfStage, number>>;

export type RunPerfSummary = {
  runId: string | null;
  userId: string;
  mode: RunMode;
  models: string[];
  status: string;
  timings: RunPerfTimings;
  prepareRunMs: number | null;
  dbUserMs: number | null;
  createRunMs: number | null;
  reserveCreditsMs: number | null;
  providerTtftMs: number | null;
  totalTtftMs: number | null;
  totalRunMs: number | null;
};

export function perfLogsEnabled(): boolean {
  return process.env.AI_PERF_LOGS === "1";
}

/** Monotonic wall-clock marks relative to tracker creation. */
export class RunPerfTracker {
  private readonly origin = Date.now();
  private readonly marks = new Map<RunPerfStage, number>();
  private runId: string | null = null;
  private providerTtftMs: number | null = null;

  mark(stage: RunPerfStage): void {
    this.marks.set(stage, Date.now() - this.origin);
  }

  setRunId(runId: string): void {
    this.runId = runId;
  }

  /** Provider-reported TTFT (from model stream done event). */
  setProviderTtftMs(ms: number | null): void {
    if (ms != null && ms >= 0) this.providerTtftMs = ms;
  }

  private delta(from: RunPerfStage, to: RunPerfStage): number | null {
    const a = this.marks.get(from);
    const b = this.marks.get(to);
    if (a == null || b == null) return null;
    return Math.max(0, b - a);
  }

  summarize(input: {
    userId: string;
    mode: RunMode;
    models: string[];
    status: string;
  }): RunPerfSummary {
    const timings = Object.fromEntries(this.marks) as RunPerfTimings;
    const requestReceived = this.marks.get("request_received") ?? 0;
    const firstDelta = this.marks.get("first_model_delta");
    const runDone = this.marks.get("run_done");

    const prepareEnd = this.marks.get("credits_reserved");
    const prepareStart = this.marks.get("validate_done") ?? requestReceived;

    const createRunMs =
      this.delta("plan_loaded", "run_created") ??
      this.delta("validate_done", "run_created");
    const reserveCreditsMs = this.delta("run_created", "credits_reserved");

    return {
      runId: this.runId,
      userId: input.userId,
      mode: input.mode,
      models: input.models,
      status: input.status,
      timings,
      prepareRunMs:
        prepareEnd != null ? Math.max(0, prepareEnd - prepareStart) : null,
      dbUserMs: null,
      createRunMs,
      reserveCreditsMs,
      providerTtftMs: this.providerTtftMs,
      totalTtftMs:
        firstDelta != null ? Math.max(0, firstDelta - requestReceived) : null,
      totalRunMs:
        runDone != null ? Math.max(0, runDone - requestReceived) : null,
    };
  }
}

export function logRunPerf(summary: RunPerfSummary): void {
  if (!perfLogsEnabled()) return;
  console.log(JSON.stringify({ src: "ai-perf", ts: new Date().toISOString(), ...summary }));
}
