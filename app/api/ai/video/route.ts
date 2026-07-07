import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { submitVideoJobWithFallback } from "@/lib/aiEngine";
import {
  MAX_PROMPT_CHARS,
  resolveVideoModel,
  validateVideoDuration,
  videoGenCost,
  DEFAULT_VIDEO_DURATION_SEC,
} from "@/lib/aiCredits";
import { videoFallbackModelsForPlan } from "@/lib/aiMediaCredits";
import { hasVideoGen } from "@/lib/aiModels";
import { videoSubmitOptsFromJob } from "@/lib/aiVideoJob";
import { insertMediaJob } from "@/lib/aiMediaJobInsert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const session = getAISession(req);
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
  const durationRaw = Number(body.duration ?? DEFAULT_VIDEO_DURATION_SEC);
  const aspectRatio =
    typeof body.aspectRatio === "string" ? body.aspectRatio : "16:9";
  const generateAudio = body.generateAudio !== false;
  const referenceImageUrl =
    typeof body.referenceImageUrl === "string" && body.referenceImageUrl.startsWith("https://")
      ? body.referenceImageUrl.trim()
      : null;

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
  const m = resolveVideoModel(String(body.model ?? ""), plan);
  if ("error" in m) {
    return NextResponse.json({ ok: false, error: m.error }, {
      status: m.error === "plan_upgrade_required" ? 403 : 422,
    });
  }

  if (!hasVideoGen(m.id)) {
    return NextResponse.json({ ok: false, error: "not_video_model" }, { status: 422 });
  }

  const duration = validateVideoDuration(m, durationRaw);
  if (typeof duration !== "number") {
    return NextResponse.json({ ok: false, error: duration.error }, { status: 422 });
  }

  const cost = videoGenCost(m, duration);
  if ((user.credits as number) < cost) {
    return NextResponse.json(
      { ok: false, error: "insufficient_credits", upgradeUrl: "/ai/pricing" },
      { status: 402 }
    );
  }

  let jobSubmit;
  let usedModelId = m.id;
  try {
    const fallbackModels = videoFallbackModelsForPlan(m.id, plan);
    const submitOpts = {
      ...videoSubmitOptsFromJob({
        model_id: m.id,
        prompt,
        duration_sec: duration,
        reference_url: referenceImageUrl,
      }),
      duration,
      aspectRatio,
      generateAudio,
      referenceImageUrl: referenceImageUrl ?? undefined,
    };
    const result = await submitVideoJobWithFallback(prompt, fallbackModels, submitOpts);
    jobSubmit = { jobId: result.jobId, pollingUrl: result.pollingUrl };
    usedModelId = result.modelId;
  } catch (e) {
    console.error("[api/ai/video] submit failed:", e);
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }

  const { data: job, error: jobErr } = await insertMediaJob(supabase, {
    user_id: session.userId,
    kind: "video",
    model_id: usedModelId,
    prompt,
    duration_sec: duration,
    status: "processing",
    openrouter_job_id: jobSubmit.jobId,
    polling_url: jobSubmit.pollingUrl,
    credit_cost: cost,
    thread_id: threadId,
    reference_url: referenceImageUrl,
  });

  if (jobErr || !job) {
    console.error("[api/ai/video] job insert:", jobErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const creditsRemaining = Math.max(0, (user.credits as number) - cost);
  await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", session.userId);

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    creditsRemaining,
    creditCost: cost,
    duration,
  });
}
