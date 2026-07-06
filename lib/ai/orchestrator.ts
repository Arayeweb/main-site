// =========================================================
// Orchestrator — چرخه کامل یک run:
// auth → rate limit → estimate → reserve → create ai_run →
// اجرای mode → persist → settle → trace
// خروجی: AsyncGenerator از RunSSEEvent که route به SSE تبدیل می‌کند.
// =========================================================

import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { canUseModel, MODEL_MAX_TOKENS } from "@/lib/aiCredits";
import {
  COMPARE_MODELS,
  getModel,
  hasVision,
  type AIModelInfo,
  type ModelTier,
} from "@/lib/aiModels";
import { planRank } from "@/lib/aiPackages";
import { openRouterProvider } from "@/lib/ai/providers/openrouter";
import type { RunMode, RunSSEEvent } from "@/lib/ai/streaming/sse";
import { creditsForModel, estimateRunCredits } from "@/lib/ai/usage/estimate";
import { settleRun, type CallSettlement } from "@/lib/ai/usage/settle";
import { prepareRunAndReserveCredits, refundCredits } from "@/lib/billing/credits";
import { checkRateLimit, maxConcurrency } from "@/lib/redis/rate-limit";
import { acquireRunSlot, releaseRunSlot, ThrottledStopChecker } from "@/lib/redis/locks";
import { traceModelCall, traceRunDone, traceRunStarted } from "@/lib/observability/tracing";
import { logRunPerf, type RunPerfTracker } from "@/lib/observability/perf";
import { runDirectMode } from "@/lib/ai/modes/direct";
import { runCompareMode } from "@/lib/ai/modes/compare";
import { runCouncilMode } from "@/lib/ai/modes/council";
import type { ModeCallResult, ModeContext } from "@/lib/ai/modes/types";
import type { ChatMessage } from "@/lib/ai/providers/interface";

/** حداقل پلن هر mode جدید */
const RUN_MODE_MIN_PLAN: Record<RunMode, string> = {
  direct: "free",
  compare: "starter",
  council: "pro",
};

const MAX_COUNCIL_MODELS = 4;
export const APPROVED_COUNCIL_MODEL_IDS = [
  "cmp-deepseek-v4",
  "cmp-grok-4",
  "cmp-claude-haiku",
  "cmp-gpt-55",
] as const;
const APPROVED_COUNCIL_MODELS = new Set<string>(APPROVED_COUNCIL_MODEL_IDS);

export type RunRequest = {
  userId: string;
  plan: string;
  mode: RunMode;
  prompt: string;
  /** direct: [model] — compare: [modelA, modelB] — council: خودکار اگر خالی باشد */
  models: string[];
  conversationId?: string | null;
  history?: ChatMessage[];
  imageUrls?: string[];
  webSearch?: boolean;
  personaSystem?: string;
};

export type RunPrepError = {
  error:
    | "plan_upgrade_required"
    | "invalid_model"
    | "rate_limited"
    | "too_many_concurrent"
    | "insufficient_credits"
    | "server_error";
  status: number;
};

export type PreparedRun = {
  runId: string;
  models: string[];
  reservedCredits: number;
  execute: (signal: AbortSignal) => AsyncGenerator<RunSSEEvent>;
  /** آزادسازی slot همزمانی — route در finally صدا می‌زند */
  cleanup: () => Promise<void>;
};

/** انتخاب خودکار اعضای شورا: یک economy، یک mid، یک premium از pool مقایسه */
export function pickCouncilModels(): string[] {
  const byTier = (tier: ModelTier): AIModelInfo | undefined => {
    const pool = COMPARE_MODELS.filter(
      (m) => m.tier === tier && APPROVED_COUNCIL_MODELS.has(m.id)
    );
    return pool[Math.floor(Math.random() * pool.length)];
  };
  const picks = [byTier("economy"), byTier("mid"), byTier("premium")].filter(
    (m): m is AIModelInfo => !!m
  );
  return picks.map((m) => m.id);
}

function resolveRunModels(
  req: RunRequest
): { models: string[] } | { error: "invalid_model" | "plan_upgrade_required" } {
  if (req.mode === "direct") {
    const rawId = req.models[0] === "auto" ? "economy" : (req.models[0] ?? "");
    const m = getModel(rawId);
    if (!m || m.kind !== "direct") return { error: "invalid_model" };
    if (!canUseModel(req.plan, m)) return { error: "plan_upgrade_required" };
    return { models: [m.id] };
  }

  if (req.mode === "compare") {
    if (req.models.length !== 2 || req.models[0] === req.models[1]) {
      return { error: "invalid_model" };
    }
    const resolved: string[] = [];
    for (const id of req.models) {
      const m = getModel(id);
      if (!m || m.kind !== "compare") return { error: "invalid_model" };
      if (!canUseModel(req.plan, m)) return { error: "plan_upgrade_required" };
      resolved.push(m.id);
    }
    return { models: resolved };
  }

  // council: پیش‌فرض سروری؛ مدل‌های ترجیحی کاربر فقط از allowlist پذیرفته می‌شوند.
  const models = req.models.length > 0 ? req.models : pickCouncilModels();
  if (models.length < 2 || models.length > MAX_COUNCIL_MODELS) {
    return { error: "invalid_model" };
  }
  const seen = new Set<string>();
  const resolved: string[] = [];
  for (const id of models) {
    if (seen.has(id) || !APPROVED_COUNCIL_MODELS.has(id)) {
      return { error: "invalid_model" };
    }
    const m = getModel(id);
    if (!m || m.kind !== "compare") return { error: "invalid_model" };
    if (!canUseModel(req.plan, m)) return { error: "plan_upgrade_required" };
    seen.add(id);
    resolved.push(m.id);
  }
  return { models: resolved };
}

/** Re-validate model access against DB plan (cookie may be stale). */
function modelsAllowedForPlan(
  req: RunRequest,
  plan: string
): { models: string[] } | { error: "invalid_model" | "plan_upgrade_required" } {
  return resolveRunModels({ ...req, plan });
}

async function abortPreparedRun(
  userId: string,
  runId: string,
  reservedCredits: number,
  note: string
): Promise<void> {
  const supabase = getSupabaseAdmin();
  await refundCredits(userId, reservedCredits, runId, note);
  await supabase
    .from("ai_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId);
}

/**
 * آماده‌سازی run: همه‌ی gateها و رزرو اعتبار. اگر موفق شود executor
 * برمی‌گردد که route آن را داخل SSE stream مصرف می‌کند.
 */
export async function prepareRun(
  req: RunRequest,
  perf?: RunPerfTracker
): Promise<PreparedRun | RunPrepError> {
  // ۱) گیت پلن
  if (planRank(req.plan) < planRank(RUN_MODE_MIN_PLAN[req.mode])) {
    return { error: "plan_upgrade_required", status: 403 };
  }

  // ۲) انتخاب/اعتبارسنجی مدل‌ها
  const resolved = resolveRunModels(req);
  if ("error" in resolved) {
    return {
      error: resolved.error,
      status: resolved.error === "plan_upgrade_required" ? 403 : 422,
    };
  }
  const models = resolved.models;

  // ۳) rate limit
  const rl = await checkRateLimit(req.userId, req.plan, req.mode);
  if (!rl.allowed) return { error: "rate_limited", status: 429 };

  // ۴) سقف همزمانی
  const slotOk = await acquireRunSlot(req.userId, maxConcurrency(req.plan), {
    failClosed: req.mode === "council",
  });
  if (!slotOk) return { error: "too_many_concurrent", status: 429 };

  const cleanup = async () => {
    await releaseRunSlot(req.userId);
  };

  const runId = randomUUID();
  const conversationId = req.conversationId ?? runId;
  const hasVisionInput =
    (req.imageUrls?.length ?? 0) > 0 && models.some((id) => hasVision(id));
  const reservedCredits = estimateRunCredits(req.mode, models, {
    hasVision: hasVisionInput,
  });

  perf?.mark("plan_loaded");

  // ۵+۶) ایجاد ai_run + رزرو اتمیک — یک round-trip
  const combined = await prepareRunAndReserveCredits({
    userId: req.userId,
    runId,
    mode: req.mode,
    conversationId,
    reservedCredits,
    metadata: { models, prompt: req.prompt.slice(0, 4000) },
  });
  perf?.mark("run_created");
  perf?.mark("credits_reserved");

  if (!combined.ok) {
    await cleanup();
    if (combined.error === "insufficient_credits") {
      return { error: "insufficient_credits", status: 402 };
    }
    if (combined.error === "user_not_found") {
      return { error: "server_error", status: 404 };
    }
    return { error: "server_error", status: 500 };
  }

  perf?.setRunId(runId);

  // DB plan is source of truth — block stale cookie from unlocking paid models
  const dbPlan = combined.plan;
  if (planRank(dbPlan) < planRank(RUN_MODE_MIN_PLAN[req.mode])) {
    await abortPreparedRun(req.userId, runId, reservedCredits, "plan gate failed after reserve");
    await cleanup();
    return { error: "plan_upgrade_required", status: 403 };
  }
  const dbModels = modelsAllowedForPlan(req, dbPlan);
  if ("error" in dbModels) {
    await abortPreparedRun(req.userId, runId, reservedCredits, "model gate failed after reserve");
    await cleanup();
    return {
      error: dbModels.error,
      status: dbModels.error === "plan_upgrade_required" ? 403 : 422,
    };
  }
  if (dbModels.models.join(",") !== models.join(",")) {
    await abortPreparedRun(req.userId, runId, reservedCredits, "model mismatch after reserve");
    await cleanup();
    return { error: "plan_upgrade_required", status: 403 };
  }

  traceRunStarted({ runId, userId: req.userId, mode: req.mode, models, reservedCredits });

  const execute = async function* (signal: AbortSignal): AsyncGenerator<RunSSEEvent> {
    const startedAt = Date.now();
    const callResults: ModeCallResult[] = [];
    let fatal = false;
    let firstDeltaMarked = false;
    const stopChecker = new ThrottledStopChecker(runId);

    const ctx: ModeContext = {
      runId,
      provider: openRouterProvider,
      history: req.history ?? [],
      prompt: req.prompt,
      imageUrls: req.imageUrls ?? [],
      webSearch: req.webSearch ?? false,
      personaSystem: req.personaSystem,
      maxTokens: maxTokensForRun(models),
      signal,
      onCallComplete: (r) => callResults.push(r),
    };

    yield { type: "run_started", runId, mode: req.mode, models };

    const gen =
      req.mode === "direct"
        ? runDirectMode(ctx, models[0])
        : req.mode === "compare"
          ? runCompareMode(ctx, [models[0], models[1]])
          : runCouncilMode(ctx, models);

    try {
      for await (const ev of gen) {
        if (ev.type === "model_started") {
          perf?.mark("provider_started");
        }
        if (ev.type === "model_delta" && !firstDeltaMarked) {
          firstDeltaMarked = true;
          perf?.mark("first_model_delta");
        }
        if (ev.type === "model_done" && ev.model === models[models.length - 1]) {
          perf?.mark("model_done");
          perf?.setProviderTtftMs(ev.ttftMs);
        }
        yield ev;
        if (await stopChecker.shouldStop(signal)) break;
      }
    } catch (e) {
      console.error("[orchestrator] run crashed:", e);
      fatal = true;
    } finally {
      try {
        await gen.return?.();
      } catch {
        /* mode generator cleanup best-effort */
      }
    }

    const cancelled = signal.aborted || (await stopChecker.forceCheck());
    const anySuccess = callResults.some((r) => r.succeeded);

    // ---------- persistence ----------
    const supabase = getSupabaseAdmin();
    try {
      if (callResults.length > 0) {
        const callRows = callResults.map((r) => ({
          run_id: runId,
          provider: r.provider,
          model: r.model,
          role: r.role,
          status: r.succeeded ? "completed" : "failed",
          input_tokens: r.inputTokens,
          output_tokens: r.outputTokens,
          cached_tokens: r.cachedTokens,
          cost_usd: r.costUsd,
          credits_charged: r.succeeded ? creditsForCall(r) : 0,
          ttft_ms: r.ttftMs,
          latency_ms: r.latencyMs,
          error_code: r.errorCode,
        }));
        const { data: inserted } = await supabase
          .from("model_calls")
          .insert(callRows)
          .select("id, model, role");

        const outputRows = callResults
          .filter((r) => r.succeeded && r.text)
          .map((r) => ({
            run_id: runId,
            model_call_id:
              inserted?.find((row) => row.model === r.model && row.role === r.role)?.id ??
              null,
            model: r.model,
            content: r.text,
            role: "assistant",
          }));
        if (outputRows.length > 0) {
          await supabase.from("model_outputs").insert(outputRows);
        }
      }
    } catch (e) {
      console.error("[orchestrator] persist failed:", e);
    }

    // ---------- تسویه اعتبار ----------
    let chargedCredits = 0;
    let refundedCredits = 0;
    let creditsRemaining: number | null = null;
    let settlementFailed = false;
    try {
      // لغو کاربر = refund کامل؛ خروجی جزئی bill نمی‌شود.
      const settlements: CallSettlement[] = cancelled
        ? []
        : callResults.map((r) => ({
            model: r.model,
            credits: creditsForCall(r),
            succeeded: r.succeeded,
          }));
      const settled = await settleRun(req.userId, runId, reservedCredits, settlements);
      if (!settled.ok) {
        settlementFailed = true;
      } else {
        chargedCredits = settled.chargedCredits;
        refundedCredits = settled.refundedCredits;
        creditsRemaining = settled.creditsRemaining;
      }
    } catch (e) {
      console.error("[orchestrator] settle failed:", e);
      settlementFailed = true;
    }

    perf?.mark("settlement_done");

    // ---------- به‌روزرسانی وضعیت run ----------
    const status = settlementFailed
      ? "settlement_failed"
      : cancelled
      ? "cancelled"
      : fatal || !anySuccess
        ? "failed"
        : "completed";
    await supabase
      .from("ai_runs")
      .update({
        status,
        charged_credits: chargedCredits,
        refunded_credits: settlementFailed ? 0 : refundedCredits,
        completed_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .then(({ error }) => {
        if (error) console.error("[orchestrator] run status update failed:", error);
      });

    // ---------- trace ----------
    for (const r of callResults) {
      traceModelCall({
        runId,
        userId: req.userId,
        mode: req.mode,
        provider: r.provider,
        model: r.model,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        cachedTokens: r.cachedTokens,
        costUsd: r.costUsd,
        creditsCharged: r.succeeded ? creditsForCall(r) : 0,
        ttftMs: r.ttftMs,
        latencyMs: r.latencyMs,
        errorCode: r.errorCode,
      });
    }
    traceRunDone({
      runId,
      userId: req.userId,
      mode: req.mode,
      status,
      chargedCredits,
      durationMs: Date.now() - startedAt,
    });

    // ---------- رویدادهای پایانی ----------
    if (creditsRemaining != null) {
      yield {
        type: "usage_update",
        runId,
        creditsCharged: chargedCredits,
        creditsRemaining,
      };
    }

    if (status === "settlement_failed") {
      yield { type: "run_error", runId, errorCode: "server_error", message: "" };
    } else if (status === "failed") {
      yield { type: "run_error", runId, errorCode: "provider_error", message: "" };
    } else {
      yield { type: "run_done", runId, status, chargedCredits };
    }

    perf?.mark("run_done");
    logRunPerf(
      perf?.summarize({
        userId: req.userId,
        mode: req.mode,
        models,
        status,
      }) ?? {
        runId,
        userId: req.userId,
        mode: req.mode,
        models,
        status,
        timings: {},
        prepareRunMs: null,
        dbUserMs: null,
        createRunMs: null,
        reserveCreditsMs: null,
        providerTtftMs: null,
        totalTtftMs: null,
        totalRunMs: Date.now() - startedAt,
      }
    );
  };

  return { runId, models, reservedCredits, execute, cleanup };
}

/** سقف توکن خروجی: بر اساس گران‌ترین مدل run */
function maxTokensForRun(modelIds: string[]): number {
  let max = MODEL_MAX_TOKENS.economy;
  for (const id of modelIds) {
    const m = getModel(id);
    if (m && MODEL_MAX_TOKENS[m.tier] > max) max = MODEL_MAX_TOKENS[m.tier];
  }
  return max;
}

/** اعتبار هر تماس — moderator شورا هزینه ثابت کوچک دارد */
function creditsForCall(r: ModeCallResult): number {
  if (r.role === "critique") return 3;
  if (r.role === "synthesis") return 4;
  const m = getModel(r.model);
  return m ? creditsForModel(m) : 1;
}
