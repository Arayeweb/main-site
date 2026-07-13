import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runImageGen, type ImageGenResult } from "@/lib/aiEngine";
import { persistImageGen } from "@/lib/aiPersist";
import { MAX_BATTLE_COST_USD, imageGenCost } from "@/lib/aiCredits";
import { getModel, imageModelFallbackChain } from "@/lib/aiModels";
import { refundCredits } from "@/lib/billing/credits";
import { creditsForProviderCost } from "@/lib/ai/pricing/costToCredits";
import { settleMediaCredits } from "@/lib/ai/mediaBilling";

export type ImageJobRow = {
  id: string;
  user_id: string;
  kind: string;
  model_id: string;
  prompt: string | null;
  status: string;
  credit_cost: number;
  output_url: string | null;
  error: string | null;
  battle_id: string | null;
  thread_id: string | null;
  reference_url?: string | null;
  dismissed_at?: string | null;
};

export async function refundImageJobCredits(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string,
  amount: number,
  jobId: string
) {
  const refunded = await refundCredits(userId, amount, jobId, "failed image generation");
  await supabase
    .from("ai_runs")
    .update({
      status: refunded.ok ? "failed" : "settlement_failed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", jobId)
    .eq("user_id", userId);
}

async function runImageGenWithFallback(
  prompt: string,
  primaryModel: string,
  opts: { referenceImageUrl?: string },
  reservedCredits: number
): Promise<{ gen: ImageGenResult; modelId: string }> {
  const models = imageModelFallbackChain(primaryModel).filter((modelId) => {
    const model = getModel(modelId);
    return !!model && imageGenCost(model) <= reservedCredits;
  });
  let lastError: Error = new Error("no_image");

  for (const modelId of models) {
    try {
      const gen = await runImageGen(prompt, modelId, opts);
      if (gen.imageUrl || gen.imageBase64) {
        if (modelId !== primaryModel) {
          console.warn(`[aiImageJob] fallback ${primaryModel} → ${modelId} succeeded`);
        }
        return { gen, modelId };
      }
      lastError = new Error("no_image");
    } catch (e) {
      lastError = e instanceof Error ? e : new Error("generation_failed");
      console.warn(`[aiImageJob] model ${modelId} failed:`, lastError.message);
    }
  }

  throw lastError;
}

/** Claim a pending job and run generation (idempotent — only one worker wins). */
export async function claimAndProcessImageJob(
  jobId: string,
  userId: string
): Promise<"claimed" | "busy" | "done" | "failed"> {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("ai_media_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (!existing) return "failed";
  const row = existing as ImageJobRow;
  if (row.user_id !== userId) return "failed";
  if (row.status === "completed" || row.battle_id) return "done";
  if (row.status === "failed") return "failed";
  if (row.status === "processing") return "busy";

  const { data: claimed } = await supabase
    .from("ai_media_jobs")
    .update({ status: "processing" })
    .eq("id", jobId)
    .eq("status", "pending")
    .select("*")
    .maybeSingle();

  if (!claimed) {
    const { data: again } = await supabase
      .from("ai_media_jobs")
      .select("status, battle_id")
      .eq("id", jobId)
      .maybeSingle();
    if (again?.status === "completed" || again?.battle_id) return "done";
    if (again?.status === "failed") return "failed";
    return "busy";
  }

  const job = claimed as ImageJobRow;
  try {
    const prompt = job.prompt || "";
    const { gen, modelId: usedModelId } = await runImageGenWithFallback(
      prompt,
      job.model_id,
      { referenceImageUrl: job.reference_url || undefined },
      job.credit_cost
    );

    if (gen.costUsd > MAX_BATTLE_COST_USD) {
      console.warn(`[aiImageJob] cost alert: $${gen.costUsd.toFixed(4)}`);
    }

    const mime = gen.mime || "image/png";
    const responseText = gen.caption || "تصویر ساخته شد.";
    let displayUrl = gen.imageUrl;

    if (!displayUrl && gen.imageBase64) {
      const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1] || "png";
      const path = `${userId}/${randomUUID()}.${ext}`;
      const buffer = Buffer.from(gen.imageBase64, "base64");
      const { data: up, error: upErr } = await supabase.storage
        .from("ai-uploads")
        .upload(path, buffer, { contentType: mime, upsert: false });
      if (upErr || !up) throw new Error("upload_failed");
      displayUrl = supabase.storage.from("ai-uploads").getPublicUrl(up.path).data.publicUrl;
    }

    if (!displayUrl) throw new Error("no_image");

    const persist = await persistImageGen({
      userId,
      prompt,
      modelId: usedModelId,
      imageUrl: displayUrl,
      mime,
      caption: responseText,
      cost: job.credit_cost,
      costUsd: gen.costUsd,
      tokensUsed: gen.tokensUsed,
      threadId: job.thread_id,
    });

    if (!persist) throw new Error("persist_failed");

    const actualCredits = Math.max(
      imageGenCost(getModel(usedModelId)!),
      creditsForProviderCost(usedModelId, gen.costUsd, gen.tokensUsed, 0)
    );
    const settlement = await settleMediaCredits({
      userId,
      runId: jobId,
      modelId: usedModelId,
      reservedCredits: job.credit_cost,
      actualCredits,
      providerCostUsd: gen.costUsd,
      inputTokens: gen.tokensUsed ?? 0,
    });
    if (!settlement.ok) throw new Error("settlement_failed");

    await supabase
      .from("ai_media_jobs")
      .update({
        status: "completed",
        output_url: displayUrl,
        cost_usd: gen.costUsd,
        battle_id: persist.battleId,
        thread_id: persist.threadId,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    return "done";
  } catch (e) {
    console.error("[aiImageJob] process failed:", e);
    const errorMessage = e instanceof Error ? e.message : "generation_failed";
    await supabase
      .from("ai_media_jobs")
      .update({
        status: "failed",
        error: errorMessage,
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    if (errorMessage === "settlement_failed") {
      await supabase
        .from("ai_runs")
        .update({ status: "settlement_failed", completed_at: new Date().toISOString() })
        .eq("id", jobId)
        .eq("user_id", userId);
    } else {
      await refundImageJobCredits(supabase, userId, job.credit_cost, jobId);
    }
    return "failed";
  }
}
