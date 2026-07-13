import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { runAudioSpeech } from "@/lib/aiEngine";
import {
  MAX_BATTLE_COST_USD,
  MAX_PROMPT_CHARS,
  audioSpeechCost,
  resolveAudioModel,
} from "@/lib/aiCredits";
import { creditsForProviderCost } from "@/lib/ai/pricing/costToCredits";
import { hasAudioGen } from "@/lib/aiModels";
import { isUuid } from "@/lib/ai/requestValidation";
import {
  failMediaReservation,
  reserveMediaCredits,
  settleMediaCredits,
} from "@/lib/ai/mediaBilling";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

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

  const text = String(body.text ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  if (!text) {
    return NextResponse.json({ ok: false, error: "missing_text" }, { status: 422 });
  }

  const threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  const voice = typeof body.voice === "string" ? body.voice : "alloy";

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
  const m = resolveAudioModel(String(body.model ?? ""), plan);
  if ("error" in m) {
    return NextResponse.json({ ok: false, error: m.error }, {
      status: m.error === "plan_upgrade_required" ? 403 : 422,
    });
  }

  if (!hasAudioGen(m.id)) {
    return NextResponse.json({ ok: false, error: "not_audio_model" }, { status: 422 });
  }

  const estimatedCost = audioSpeechCost(m, text.length);
  const billingRunId = randomUUID();
  const reservation = await reserveMediaCredits({
    userId: session.userId,
    runId: billingRunId,
    conversationId: threadId && isUuid(threadId) ? threadId : billingRunId,
    reservedCredits: estimatedCost,
    source: "audio_generation",
    modelId: m.id,
    prompt: text,
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

  let gen;
  try {
    gen = await runAudioSpeech(text, m.id, voice);
  } catch (e) {
    console.error("[api/ai/audio] gen failed:", e);
    await failMediaReservation({
      userId: session.userId,
      runId: billingRunId,
      reservedCredits: estimatedCost,
      note: "audio provider failed",
    });
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }

  if (gen.costUsd > MAX_BATTLE_COST_USD) {
    console.warn(`[api/ai/audio] cost alert: $${gen.costUsd.toFixed(4)}`);
  }
  const cost = Math.max(
    estimatedCost,
    creditsForProviderCost(m.id, gen.costUsd, gen.tokensUsed ?? 0, 0)
  );

  const ext = gen.mime.includes("wav") ? "wav" : "mp3";
  const path = `${session.userId}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(gen.audioBuffer);
  const { data: up, error: upErr } = await supabase.storage
    .from("ai-uploads")
    .upload(path, buffer, { contentType: gen.mime, upsert: false });

  if (upErr || !up) {
    console.error("[api/ai/audio] upload:", upErr);
    await failMediaReservation({
      userId: session.userId,
      runId: billingRunId,
      reservedCredits: estimatedCost,
      note: "audio upload failed",
    });
    return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 500 });
  }

  const audioUrl = supabase.storage.from("ai-uploads").getPublicUrl(up.path).data.publicUrl;
  const attachments = [{ url: audioUrl, mime: gen.mime, kind: "output" as const }];

  const insertRow: Record<string, unknown> = {
    user_id: session.userId,
    prompt: text,
    model_a: m.id,
    model_b: "",
    response_a: "فایل صوتی ساخته شد.",
    response_b: "",
    tier: "audio_gen",
    mode_kind: "audio_gen",
    credit_cost: cost,
    cost_usd: gen.costUsd,
    tokens_used: gen.tokensUsed,
    attachments,
  };
  if (threadId) insertRow.thread_id = threadId;

  let { data: battle, error: insErr } = await supabase
    .from("ai_battles")
    .insert(insertRow)
    .select("id")
    .single();

  if (insErr && insertRow.thread_id) {
    delete insertRow.thread_id;
    const retry = await supabase.from("ai_battles").insert(insertRow).select("id").single();
    battle = retry.data;
    insErr = retry.error;
  }

  if (insErr || !battle) {
    console.error("[api/ai/audio] insert:", insErr);
    await failMediaReservation({
      userId: session.userId,
      runId: billingRunId,
      reservedCredits: estimatedCost,
      note: "audio persistence failed",
    });
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const settlement = await settleMediaCredits({
    userId: session.userId,
    runId: billingRunId,
    modelId: m.id,
    reservedCredits: estimatedCost,
    actualCredits: cost,
    providerCostUsd: gen.costUsd,
    inputTokens: gen.tokensUsed ?? 0,
  });
  if (!settlement.ok) {
    return NextResponse.json({ ok: false, error: "settlement_failed" }, { status: 500 });
  }

  await supabase.from("ai_usage").insert({
    user_id: session.userId,
    conversation_id: battle.id,
    mode: "audio_gen",
    tokens_used: gen.tokensUsed,
    cost_usd: gen.costUsd,
  });

  const resolvedThreadId = threadId || (battle.id as string);

  return NextResponse.json({
    ok: true,
    id: battle.id,
    threadId: resolvedThreadId,
    audioUrl,
    creditsRemaining: settlement.creditsRemaining,
    isNewThread: !threadId,
  });
}
