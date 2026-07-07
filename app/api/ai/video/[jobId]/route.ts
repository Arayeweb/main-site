import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { pollVideoJob, openRouterVideoPollUrl } from "@/lib/aiEngine";
import { MAX_BATTLE_COST_USD } from "@/lib/aiCredits";
import { retryVideoJobWithFallback } from "@/lib/aiVideoJob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

function jobVideoUrl(jobId: string): string {
  return `/api/ai/video/${jobId}/content`;
}

type JobRow = {
  id: string;
  user_id: string;
  kind: string;
  model_id: string;
  prompt: string | null;
  duration_sec: number | null;
  status: string;
  polling_url: string | null;
  openrouter_job_id: string | null;
  credit_cost: number;
  cost_usd: number | null;
  output_url: string | null;
  error: string | null;
  battle_id: string | null;
  thread_id: string | null;
  reference_url?: string | null;
};

async function refundCredits(
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
    reason: "video_refund",
    note: `Refund for failed video job ${jobId}`,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data: job, error: jobErr } = await supabase
    .from("ai_media_jobs")
    .select("*")
    .eq("id", params.jobId)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const row = job as JobRow;
  if (row.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (row.status === "completed") {
    return NextResponse.json({
      ok: true,
      status: "completed",
      videoUrl: jobVideoUrl(row.id),
      threadId: row.thread_id || row.battle_id,
      battleId: row.battle_id,
      isNewThread: false,
    });
  }

  if (row.status === "failed") {
    return NextResponse.json({
      ok: false,
      status: "failed",
      error: row.error || "video_failed",
    });
  }

  if (row.error === "dismissed_by_user") {
    return NextResponse.json({ ok: true, status: "dismissed" });
  }

  if (!row.polling_url && !row.openrouter_job_id) {
    return NextResponse.json({ ok: false, error: "invalid_job" }, { status: 500 });
  }

  const pollUrl =
    openRouterVideoPollUrl(row.polling_url, row.openrouter_job_id) || row.polling_url!;

  let poll;
  try {
    poll = await pollVideoJob(pollUrl);
  } catch (e) {
    console.error("[api/ai/video/poll] failed:", e);
    return NextResponse.json({ ok: true, status: "processing" });
  }

  if (poll.status === "failed") {
    const { data: userRow } = await supabase
      .from("ai_users")
      .select("plan")
      .eq("id", row.user_id)
      .maybeSingle();
    const plan = (userRow?.plan as string) || "free";

    const retry = await retryVideoJobWithFallback(row, plan);
    if (retry) {
      await supabase
        .from("ai_media_jobs")
        .update({
          status: "processing",
          model_id: retry.modelId,
          openrouter_job_id: retry.jobId,
          polling_url: retry.pollingUrl,
          error: null,
        })
        .eq("id", row.id);
      return NextResponse.json({
        ok: true,
        status: "processing",
        fallbackModel: retry.modelId,
      });
    }

    await supabase
      .from("ai_media_jobs")
      .update({
        status: "failed",
        error: poll.error || "generation_failed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    await refundCredits(supabase, row.user_id, row.credit_cost, row.id);
    return NextResponse.json({
      ok: false,
      status: "failed",
      error: poll.error || "video_failed",
    });
  }

  if (poll.status !== "completed" || !poll.videoUrls?.length) {
    const nextStatus = poll.status === "processing" ? "processing" : "pending";
    await supabase
      .from("ai_media_jobs")
      .update({ status: nextStatus })
      .eq("id", row.id);
    // #region agent log
    fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
      body: JSON.stringify({
        sessionId: "d89e34",
        runId: "post-fix",
        hypothesisId: "H6",
        location: "video/[jobId]/route.ts:still-processing",
        message: "poll not complete yet",
        data: {
          jobId: row.id,
          pollStatus: poll.status,
          urlCount: poll.videoUrls?.length ?? 0,
          progress: poll.progress,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return NextResponse.json({
      ok: true,
      status: nextStatus,
      progress: poll.progress,
    });
  }

  if (row.battle_id) {
    return NextResponse.json({
      ok: true,
      status: "completed",
      videoUrl: jobVideoUrl(row.id),
      threadId: row.thread_id || row.battle_id,
      battleId: row.battle_id,
      isNewThread: false,
    });
  }

  const remoteUrl = poll.videoUrls[0];
  const playableUrl = jobVideoUrl(row.id);
  const costUsd = poll.costUsd ?? 0;

  if (costUsd > MAX_BATTLE_COST_USD) {
    console.warn(`[api/ai/video] cost alert: $${costUsd.toFixed(4)}`);
  }

  const attachments = [{ url: playableUrl, mime: "video/mp4", kind: "output" as const }];
  const insertRow: Record<string, unknown> = {
    user_id: session.userId,
    prompt: row.prompt || "",
    model_a: row.model_id,
    model_b: "",
    response_a: "ویدیو ساخته شد.",
    response_b: "",
    tier: "video_gen",
    mode_kind: "video_gen",
    credit_cost: row.credit_cost,
    cost_usd: costUsd,
    tokens_used: 0,
    attachments,
  };
  if (row.thread_id) insertRow.thread_id = row.thread_id;

  const { data: battle, error: insErr } = await supabase
    .from("ai_battles")
    .insert(insertRow)
    .select("id")
    .single();

  if (insErr || !battle) {
    console.error("[api/ai/video] battle insert:", insErr);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const resolvedThreadId = row.thread_id || (battle.id as string);

  await supabase
    .from("ai_media_jobs")
    .update({
      status: "completed",
      output_url: remoteUrl,
      cost_usd: costUsd,
      battle_id: battle.id,
      thread_id: resolvedThreadId,
      completed_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  await supabase.from("ai_usage").insert({
    user_id: session.userId,
    conversation_id: battle.id,
    mode: "video_gen",
    tokens_used: 0,
    cost_usd: costUsd,
  });

  // Mirror to Supabase in background — don't block the poll response on slow downloads.
  const jobId = row.id;
  const battleId = battle.id as string;
  const apiKey = process.env.OPENROUTER_API_KEY;
  void (async () => {
    try {
      const fetchHeaders: Record<string, string> = {};
      if (remoteUrl.includes("openrouter.ai") && apiKey) {
        fetchHeaders.Authorization = `Bearer ${apiKey}`;
      }
      const vidRes = await fetch(remoteUrl, { headers: fetchHeaders });
      if (!vidRes.ok) return;
      const buffer = Buffer.from(await vidRes.arrayBuffer());
      const path = `${session.userId}/${randomUUID()}.mp4`;
      const { data: up, error: upErr } = await supabase.storage
        .from("ai-uploads")
        .upload(path, buffer, { contentType: "video/mp4", upsert: false });
      if (upErr || !up) return;
      const mirrored = supabase.storage.from("ai-uploads").getPublicUrl(up.path).data.publicUrl;
      await supabase.from("ai_media_jobs").update({ output_url: mirrored }).eq("id", jobId);
      await supabase
        .from("ai_battles")
        .update({
          attachments: [{ url: mirrored, mime: "video/mp4", kind: "output" }],
        })
        .eq("id", battleId);
    } catch (e) {
      console.warn("[api/ai/video] background upload skipped:", e);
    }
  })();

  // #region agent log
  fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
    body: JSON.stringify({
      sessionId: "d89e34",
      runId: "post-fix",
      hypothesisId: "H6-H7",
      location: "video/[jobId]/route.ts:completed",
      message: "video job completed",
      data: { jobId: row.id, battleId: battle.id, playableUrl },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return NextResponse.json({
    ok: true,
    status: "completed",
    videoUrl: playableUrl,
    threadId: resolvedThreadId,
    battleId: battle.id,
    isNewThread: !row.thread_id,
  });
}
