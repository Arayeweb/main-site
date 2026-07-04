import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { generateMusic } from "@/lib/aiMusic";
import { MAX_BATTLE_COST_USD, MAX_PROMPT_CHARS, musicGenCost, resolveMusicModel } from "@/lib/aiCredits";
import { hasMusicGen } from "@/lib/aiModels";

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

  const prompt = String(body.prompt ?? "").trim().slice(0, MAX_PROMPT_CHARS);
  if (!prompt) {
    return NextResponse.json({ ok: false, error: "missing_prompt" }, { status: 422 });
  }

  const threadId = typeof body.threadId === "string" && body.threadId ? body.threadId : null;
  const instrumental = body.instrumental === true;

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
  const m = resolveMusicModel(String(body.model ?? ""), plan);
  if ("error" in m) {
    return NextResponse.json({ ok: false, error: m.error }, {
      status: m.error === "plan_upgrade_required" ? 403 : 422,
    });
  }

  if (!hasMusicGen(m.id)) {
    return NextResponse.json({ ok: false, error: "not_music_model" }, { status: 422 });
  }

  const cost = musicGenCost(m);
  if ((user.credits as number) < cost) {
    return NextResponse.json(
      { ok: false, error: "insufficient_credits", upgradeUrl: "/ai/pricing" },
      { status: 402 }
    );
  }

  let gen;
  try {
    const fullPrompt = instrumental ? `${prompt} — instrumental only, no vocals` : prompt;
    gen = await generateMusic(fullPrompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("music_unavailable")) {
      return NextResponse.json(
        { ok: false, error: "music_unavailable", message: "سرویس موزیک به‌زودی فعال می‌شود." },
        { status: 503 }
      );
    }
    console.error("[api/ai/music] gen failed:", e);
    return NextResponse.json({ ok: false, error: "ai_error" }, { status: 502 });
  }

  if (gen.costUsd > MAX_BATTLE_COST_USD) {
    console.warn(`[api/ai/music] cost alert: $${gen.costUsd.toFixed(4)}`);
  }

  const ext = gen.mime.includes("wav") ? "wav" : "mp3";
  const path = `${session.userId}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(gen.audioBuffer);
  const { data: up, error: upErr } = await supabase.storage
    .from("ai-uploads")
    .upload(path, buffer, { contentType: gen.mime, upsert: false });

  if (upErr || !up) {
    console.error("[api/ai/music] upload:", upErr);
    return NextResponse.json({ ok: false, error: "upload_failed" }, { status: 500 });
  }

  const audioUrl = supabase.storage.from("ai-uploads").getPublicUrl(up.path).data.publicUrl;
  const attachments = [{ url: audioUrl, mime: gen.mime, kind: "output" as const }];

  const insertRow: Record<string, unknown> = {
    user_id: session.userId,
    prompt,
    model_a: m.id,
    model_b: "",
    response_a: "قطعه موزیک ساخته شد.",
    response_b: "",
    tier: "music_gen",
    mode_kind: "music_gen",
    credit_cost: cost,
    cost_usd: gen.costUsd,
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
    console.error("[api/ai/music] insert:", insErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const creditsRemaining = Math.max(0, (user.credits as number) - cost);
  await supabase.from("ai_users").update({ credits: creditsRemaining }).eq("id", session.userId);

  await supabase.from("ai_usage").insert({
    user_id: session.userId,
    conversation_id: battle.id,
    mode: "music_gen",
    cost_usd: gen.costUsd,
  });

  const resolvedThreadId = threadId || (battle.id as string);

  return NextResponse.json({
    ok: true,
    id: battle.id,
    threadId: resolvedThreadId,
    audioUrl,
    creditsRemaining,
    isNewThread: !threadId,
  });
}
