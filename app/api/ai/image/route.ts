import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import {
  MAX_PROMPT_CHARS,
  imageGenCost,
  resolveImageModel,
} from "@/lib/aiCredits";
import { hasImageGen } from "@/lib/aiModels";
import { insertMediaJob } from "@/lib/aiMediaJobInsert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
  if ((user.credits as number) < cost) {
    return NextResponse.json(
      { ok: false, error: "insufficient_credits", upgradeUrl: "/ai/pricing" },
      { status: 402 }
    );
  }

  const { data: job, error: jobErr } = await insertMediaJob(supabase, {
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
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const creditsRemaining = Math.max(0, (user.credits as number) - cost);
  await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", session.userId);

  return NextResponse.json({
    ok: true,
    jobId: job.id,
    creditsRemaining,
    creditCost: cost,
  });
}
