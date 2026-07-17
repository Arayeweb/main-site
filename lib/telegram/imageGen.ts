// =========================================================
// Telegram image generation — image-lite; 1 free trial per user
// =========================================================

import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getModel } from "@/lib/aiModels";
import { runImageGen } from "@/lib/aiEngine";
import { imageGenCost } from "@/lib/aiCredits";
import { prepareRunAndReserveCredits } from "@/lib/billing/credits";
import { insertMediaJob } from "@/lib/aiMediaJobInsert";
import { claimAndProcessImageJob } from "@/lib/aiImageJob";

export const TELEGRAM_IMAGE_MODEL = "image-lite";

export function telegramImageCreditCost(): number {
  const model = getModel(TELEGRAM_IMAGE_MODEL);
  if (!model) return 20;
  return imageGenCost(model);
}

export type TelegramImageResult =
  | {
      ok: true;
      imageUrl: string;
      jobId: string;
      creditsRemaining?: number;
    }
  | { ok: false; error: string };

async function uploadTelegramImage(
  telegramUserId: string,
  gen: Awaited<ReturnType<typeof runImageGen>>
): Promise<string | null> {
  const mime = gen.mime || "image/png";
  if (gen.imageUrl) return gen.imageUrl;

  if (!gen.imageBase64) return null;

  const supabase = getSupabaseAdmin();
  const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1] || "png";
  const path = `telegram-free/${telegramUserId}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(gen.imageBase64, "base64");
  const { data: up, error: upErr } = await supabase.storage
    .from("ai-uploads")
    .upload(path, buffer, { contentType: mime, upsert: false });
  if (upErr || !up) return null;
  return supabase.storage.from("ai-uploads").getPublicUrl(up.path).data.publicUrl;
}

/** Free trial — no credit charge, no ai_users account required */
export async function runTelegramFreeImageGen(opts: {
  telegramUserId: string;
  prompt: string;
}): Promise<TelegramImageResult> {
  try {
    const gen = await runImageGen(opts.prompt, TELEGRAM_IMAGE_MODEL);
    const imageUrl = await uploadTelegramImage(opts.telegramUserId, gen);
    if (!imageUrl) return { ok: false, error: "generation_failed" };
    return {
      ok: true,
      imageUrl,
      jobId: randomUUID(),
    };
  } catch (e) {
    console.error("[telegram/imageGen] free image failed:", e instanceof Error ? e.message : e);
    return { ok: false, error: "generation_failed" };
  }
}

export async function runTelegramImageGen(opts: {
  araayeUserId: string;
  prompt: string;
}): Promise<TelegramImageResult> {
  const model = getModel(TELEGRAM_IMAGE_MODEL);
  if (!model) return { ok: false, error: "invalid_model" };

  const cost = imageGenCost(model);
  const jobId = randomUUID();
  const supabase = getSupabaseAdmin();

  const prep = await prepareRunAndReserveCredits({
    userId: opts.araayeUserId,
    runId: jobId,
    mode: "direct",
    conversationId: jobId,
    reservedCredits: cost,
    metadata: {
      source: "telegram_image",
      model: TELEGRAM_IMAGE_MODEL,
      prompt: opts.prompt.slice(0, 1000),
    },
  });
  if (!prep.ok) {
    return { ok: false, error: prep.error };
  }

  const { data: job, error: jobErr } = await insertMediaJob(supabase, {
    id: jobId,
    user_id: opts.araayeUserId,
    kind: "image",
    model_id: TELEGRAM_IMAGE_MODEL,
    prompt: opts.prompt,
    status: "pending",
    credit_cost: cost,
    thread_id: null,
  });

  if (jobErr || !job) {
    const { refundCredits } = await import("@/lib/billing/credits");
    await refundCredits(opts.araayeUserId, cost, jobId, "telegram image job creation failed");
    return { ok: false, error: "job_create_failed" };
  }

  const result = await claimAndProcessImageJob(jobId, opts.araayeUserId);
  if (result !== "done") {
    return { ok: false, error: result === "busy" ? "busy" : "generation_failed" };
  }

  const { data: completed } = await supabase
    .from("ai_media_jobs")
    .select("output_url, status, error")
    .eq("id", jobId)
    .maybeSingle();

  if (
    !completed ||
    completed.status !== "completed" ||
    !completed.output_url
  ) {
    return { ok: false, error: (completed?.error as string) || "generation_failed" };
  }

  const { data: user } = await supabase
    .from("ai_users")
    .select("credits")
    .eq("id", opts.araayeUserId)
    .maybeSingle();

  return {
    ok: true,
    imageUrl: completed.output_url as string,
    jobId,
    creditsRemaining: user?.credits as number | undefined,
  };
}
