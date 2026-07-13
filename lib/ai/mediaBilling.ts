import { getSupabaseAdmin } from "@/lib/supabase";
import {
  prepareRunAndReserveCredits,
  refundCredits,
} from "@/lib/billing/credits";
import { settleRun } from "@/lib/ai/usage/settle";
import {
  buildPricingSnapshot,
  resolveProviderCostUsd,
} from "@/lib/ai/pricing/costToCredits";
import { modelRouteId } from "@/lib/aiModels";
import { traceModelCall } from "@/lib/observability/tracing";

export async function reserveMediaCredits(input: {
  userId: string;
  runId: string;
  conversationId: string;
  reservedCredits: number;
  source: string;
  modelId: string;
  prompt: string;
}) {
  return prepareRunAndReserveCredits({
    userId: input.userId,
    runId: input.runId,
    mode: "direct",
    conversationId: input.conversationId,
    reservedCredits: input.reservedCredits,
    metadata: {
      source: input.source,
      model: input.modelId,
      prompt: input.prompt.slice(0, 1000),
    },
  });
}

export async function failMediaReservation(input: {
  userId: string;
  runId: string;
  reservedCredits: number;
  note: string;
}): Promise<void> {
  const refunded = await refundCredits(
    input.userId,
    input.reservedCredits,
    input.runId,
    input.note
  );
  await getSupabaseAdmin()
    .from("ai_runs")
    .update({
      status: refunded.ok ? "failed" : "settlement_failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.runId)
    .eq("user_id", input.userId);
}

export async function settleMediaCredits(input: {
  userId: string;
  runId: string;
  modelId: string;
  reservedCredits: number;
  actualCredits: number;
  providerCostUsd: number;
  inputTokens?: number;
  outputTokens?: number;
}): Promise<{ ok: true; creditsRemaining: number | null } | { ok: false }> {
  const settled = await settleRun(input.userId, input.runId, input.reservedCredits, [
    { model: input.modelId, credits: input.actualCredits, succeeded: true },
  ]);
  const inputTokens = Math.max(0, input.inputTokens ?? 0);
  const outputTokens = Math.max(0, input.outputTokens ?? 0);
  const providerCost = resolveProviderCostUsd(
    input.modelId,
    input.providerCostUsd,
    inputTokens,
    outputTokens
  );
  const snapshot = buildPricingSnapshot({
    modelId: input.modelId,
    providerCostUsd: providerCost.costUsd,
    providerCostMissing: providerCost.missing,
    creditsCharged: settled.ok ? settled.chargedCredits : 0,
  });
  const supabase = getSupabaseAdmin();
  const { error: runUpdateError } = await supabase
    .from("ai_runs")
    .update({
      status: settled.ok ? "completed" : "settlement_failed",
      charged_credits: settled.ok ? settled.chargedCredits : 0,
      refunded_credits: settled.ok ? settled.refundedCredits : 0,
      total_provider_cost_usd: providerCost.costUsd,
      total_revenue_toman: snapshot.revenueToman,
      total_gross_profit_toman: snapshot.grossProfitToman,
      pricing_snapshot: snapshot,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.runId)
    .eq("user_id", input.userId);
  if (runUpdateError) {
    console.error("[mediaBilling] run financial update failed", runUpdateError);
  }
  if (!settled.ok) return { ok: false };

  const { error: callInsertError } = await supabase.from("model_calls").insert({
    run_id: input.runId,
    provider: "openrouter",
    model: input.modelId,
    displayed_model: snapshot.displayedModel,
    actual_model: modelRouteId(input.modelId),
    role: "answer",
    status: "completed",
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cost_usd: providerCost.costUsd,
    exchange_rate_toman: snapshot.usdToToman,
    pricing_multiplier: snapshot.multiplier,
    credit_value_toman: snapshot.creditValueToman,
    credits_charged: settled.chargedCredits,
    revenue_toman: snapshot.revenueToman,
    gross_profit_toman: snapshot.grossProfitToman,
    gross_margin_percent: snapshot.grossMarginPercent,
    pricing_snapshot: snapshot,
  });
  if (callInsertError) {
    console.error("[mediaBilling] model call insert failed", callInsertError);
  }
  if (snapshot.pricingFlags.length > 0) {
    console.warn(JSON.stringify({
      src: "ai-pricing-alert",
      runId: input.runId,
      model: input.modelId,
      flags: snapshot.pricingFlags,
    }));
  }
  traceModelCall({
    runId: input.runId,
    userId: input.userId,
    mode: "media",
    provider: "openrouter",
    model: input.modelId,
    displayedModel: snapshot.displayedModel,
    actualModel: snapshot.actualModel,
    inputTokens,
    outputTokens,
    costUsd: providerCost.costUsd,
    providerCostMissing: providerCost.missing,
    pricingFlags: snapshot.pricingFlags,
    creditsCharged: settled.chargedCredits,
  });
  return { ok: true, creditsRemaining: settled.creditsRemaining };
}
