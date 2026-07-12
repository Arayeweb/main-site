import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { runTranscribe } from "@/lib/aiEngine";
import {
  MAX_BATTLE_COST_USD,
  resolveTranscribeModel,
  transcribeCost,
} from "@/lib/aiCredits";
import { creditsForProviderCost } from "@/lib/ai/pricing/costToCredits";
import { hasTranscribe } from "@/lib/aiModels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const MIME_TO_FORMAT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/mp3": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "m4a",
  "audio/m4a": "m4a",
  "audio/flac": "flac",
  "audio/aac": "aac",
};

function estimateDurationSec(bytes: number, mime: string): number {
  // Rough estimate when client does not send duration
  if (mime.includes("wav")) return Math.max(1, Math.ceil(bytes / (44100 * 2)));
  return Math.max(1, Math.ceil(bytes / 16000));
}

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_form" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "missing_file" }, { status: 422 });
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 413 });
  }

  const mime = file.type || "audio/mpeg";
  const format = MIME_TO_FORMAT[mime] || "mp3";
  const threadId =
    typeof form.get("threadId") === "string" && form.get("threadId")
      ? String(form.get("threadId"))
      : null;
  const language =
    typeof form.get("language") === "string" ? String(form.get("language")) : undefined;
  const durationClient = Number(form.get("durationSec") || 0);

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
  const m = resolveTranscribeModel(String(form.get("model") ?? "transcribe-4o"), plan);
  if ("error" in m) {
    return NextResponse.json({ ok: false, error: m.error }, {
      status: m.error === "plan_upgrade_required" ? 403 : 422,
    });
  }

  if (!hasTranscribe(m.id)) {
    return NextResponse.json({ ok: false, error: "not_transcribe_model" }, { status: 422 });
  }

  const durationSec =
    durationClient > 0 ? durationClient : estimateDurationSec(file.size, mime);
  const estimatedCost = transcribeCost(m, durationSec);

  if ((user.credits as number) < estimatedCost) {
    return NextResponse.json(
      { ok: false, error: "insufficient_credits", upgradeUrl: "/ai/pricing" },
      { status: 402 }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const audioBase64 = bytes.toString("base64");

  let result;
  try {
    result = await runTranscribe(audioBase64, format, m.id, language);
  } catch (e) {
    console.error("[api/ai/transcribe] failed:", e);
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }

  if (result.costUsd > MAX_BATTLE_COST_USD) {
    console.warn(`[api/ai/transcribe] cost alert: $${result.costUsd.toFixed(4)}`);
  }
  const cost = Math.max(
    estimatedCost,
    creditsForProviderCost(m.id, result.costUsd, result.tokensUsed ?? 0, 0)
  );

  const promptLabel = `رونویسی: ${file.name}`;
  const insertRow: Record<string, unknown> = {
    user_id: session.userId,
    prompt: promptLabel,
    model_a: m.id,
    model_b: "",
    response_a: result.text || "(متن خالی)",
    response_b: "",
    tier: "transcribe",
    mode_kind: "transcribe",
    credit_cost: cost,
    cost_usd: result.costUsd,
    tokens_used: result.tokensUsed,
    attachments: [],
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
    console.error("[api/ai/transcribe] insert:", insErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const creditsRemaining = Math.max(0, (user.credits as number) - cost);
  await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", session.userId);

  await supabase.from("ai_usage").insert({
    user_id: session.userId,
    conversation_id: battle.id,
    mode: "transcribe",
    tokens_used: result.tokensUsed,
    cost_usd: result.costUsd,
  });

  const resolvedThreadId = threadId || (battle.id as string);

  return NextResponse.json({
    ok: true,
    id: battle.id,
    threadId: resolvedThreadId,
    text: result.text,
    creditsRemaining,
    isNewThread: !threadId,
  });
}
