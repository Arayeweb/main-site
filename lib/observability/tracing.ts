// =========================================================
// Tracing — لاگ ساختاریافته برای هر run و هر تماس provider.
// خروجی JSON است تا هر log aggregator (یا بعداً Langfuse) بتواند مصرف کند.
// =========================================================

export type RunTrace = {
  runId: string;
  userId: string;
  mode: string;
};

export type CallTrace = {
  runId: string;
  userId: string;
  mode: string;
  provider: string;
  model: string;
  displayedModel?: string;
  actualModel?: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedTokens?: number;
  reasoningTokens?: number;
  costUsd?: number;
  providerCostMissing?: boolean;
  pricingFlags?: string[];
  creditsCharged?: number;
  ttftMs?: number | null;
  latencyMs?: number;
  errorCode?: string | null;
};

function emit(kind: string, data: Record<string, unknown>) {
  console.log(
    JSON.stringify({ src: "ai-trace", kind, ts: new Date().toISOString(), ...data })
  );
}

export function traceRunStarted(t: RunTrace & { models: string[]; reservedCredits: number }) {
  emit("run_started", t);
}

export function traceRunDone(
  t: RunTrace & {
    status: string;
    chargedCredits: number;
    refundedCredits: number;
    providerCostUsd: number;
    grossMarginPercent: number;
    pricingFlags: string[];
    durationMs: number;
  }
) {
  emit("run_done", t);
}

export function traceModelCall(t: CallTrace) {
  emit("model_call", t);
}
