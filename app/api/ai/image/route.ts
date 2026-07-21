import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  MAX_PROMPT_CHARS,
  imageGenCost,
  resolveImageModel,
} from "@/lib/aiCredits";
import { hasImageGen } from "@/lib/aiModels";
import { insertMediaJob } from "@/lib/aiMediaJobInsert";
import { isOwnedAiUploadUrl } from "@/lib/aiUploadSecurity";
import {
  prepareRunAndReserveCredits,
  refundCredits,
} from "@/lib/billing/credits";
import { isUuid } from "@/lib/ai/requestValidation";
import { getActiveAISession } from "@/lib/aiDeviceSessions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const session = await getActiveAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "missing_prompt" }, { status: 422 });
  }

  const threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  const referenceImageUrl =
    typeof body.referenceImageUrl === "string" &&
    isOwnedAiUploadUrl(body.referenceImageUrl, session.userId)
      ? body.referenceImageUrl.trim()
      : null;
  if (body.referenceImageUrl != null && !referenceImageUrl) {
    return NextResponse.json({ ok: false, error: "invalid_reference" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error: userErr } = await supabase
    .from("ai_users")
    .select("id, plan, credits")
    .eq("id", session.userId)
    .maybeSingle();

  if (userErr || !user) {
    return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  const plan = (user.plan as string) || "free";
  const m = resolveImageModel(String(body.model ?? ""), plan);
  if ("error" in m) {
    return NextResponse.json({ ok: false, error: m.error }, {
      status: m.error === "plan_upgrade_required" ? 403 : 422,
    });
  }

  if (!hasImageGen(m.id)) {
    return NextResponse.json({ ok: false, error: "not_image_model" }, { status: 422 });
  }

  const cost = imageGenCost(m);
  const jobId = randomUUID();
  const reservation = await prepareRunAndReserveCredits({
    userId: session.userId,
    runId: jobId,
    mode: "direct",
    conversationId: threadId && isUuid(threadId) ? threadId : jobId,
    reservedCredits: cost,
    metadata: {
      source: "image_generation",
      model: m.id,
      prompt: prompt.slice(0, 1000),
    },
  });
  if (!reservation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error:
          reservation.error === "insufficient_credits"
            ? "insufficient_credits"
            : "server_error",
        upgradeUrl: "/ai/pricing",
      },
      { status: reservation.error === "insufficient_credits" ? 402 : 500 }
    );
  }

  const { data: job, error: jobErr } = await insertMediaJob(supabase, {
    id: jobId,
    user_id: session.userId,
    kind: "image",
    model_id: m.id,
    prompt,
    status: "pending",
    credit_cost: cost,
    thread_id: threadId,
    reference_url: referenceImageUrl,
  });

  if (jobErr || !job) {
    console.error("[api/ai/image] job insert:", jobErr);
    await refundCredits(
      session.userId,
      cost,
      jobId,
      "image job creation failed"
    );
    await supabase
      .from("ai_runs")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", jobId)
      .eq("user_id", session.userId);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    creditsRemaining: reservation.creditsRemaining,
    creditCost: cost,
  });
}
