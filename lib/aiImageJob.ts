import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { runImageGen } from "@/lib/aiEngine";
import { persistImageGen } from "@/lib/aiPersist";
import { MAX_BATTLE_COST_USD } from "@/lib/aiCredits";

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
  const { data: user } = await supabase
    .from("ai_users")
    .select("credits")
    .eq("id", userId)
    .maybeSingle();
  if (!user) return;
  const newBal = (user.credits as number) + amount;
  await supabase.from("ai_users").update({ credits: newBal }).eq("id", userId);
  await supabase.from("ai_credit_ledger").insert({
    user_id: userId,
    delta: amount,
    balance_after: newBal,
    reason: "image_refund",
    note: `Refund for failed image job ${jobId}`,
  });
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
    const gen = await runImageGen(prompt, job.model_id, {
      referenceImageUrl: job.reference_url || undefined,
    });

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
      modelId: job.model_id,
      imageUrl: displayUrl,
      mime,
      caption: responseText,
      cost: job.credit_cost,
      costUsd: gen.costUsd,
      tokensUsed: gen.tokensUsed,
      threadId: job.thread_id,
    });

    if (!persist) throw new Error("persist_failed");

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
    await supabase
      .from("ai_media_jobs")
      .update({
        status: "failed",
        error: e instanceof Error ? e.message : "generation_failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", jobId);
    await refundImageJobCredits(supabase, userId, job.credit_cost, jobId);
    return "failed";
  }
}
