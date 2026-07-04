import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { claimAndProcessImageJob, type ImageJobRow } from "@/lib/aiImageJob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const jobId = params.jobId;

  let { data: job } = await supabase
    .from("ai_media_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const row = job as ImageJobRow;
  if (row.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (row.error === "dismissed_by_user" || row.dismissed_at) {
    return NextResponse.json({ ok: true, status: "dismissed" });
  }

  if (row.status === "completed" && row.output_url) {
    return NextResponse.json({
      ok: true,
      status: "completed",
      imageUrl: row.output_url,
      caption: "تصویر ساخته شد.",
      threadId: row.thread_id || row.battle_id,
      battleId: row.battle_id,
      isNewThread: false,
    });
  }

  if (row.status === "failed") {
    return NextResponse.json({
      ok: false,
      status: "failed",
      error: row.error || "image_failed",
    });
  }

  if (row.status === "pending" || row.status === "processing") {
    const wasNewThread = !row.thread_id;
    const result = await claimAndProcessImageJob(jobId, session.userId);

    if (result === "done") {
      const { data: refreshed } = await supabase
        .from("ai_media_jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle();
      if (refreshed) job = refreshed;
      const done = refreshed as ImageJobRow;
      if (done?.status === "completed" && done.output_url) {
        return NextResponse.json({
          ok: true,
          status: "completed",
          imageUrl: done.output_url,
          caption: "تصویر ساخته شد.",
          threadId: done.thread_id || done.battle_id,
          battleId: done.battle_id,
          isNewThread: wasNewThread,
        });
      }
      if (done?.status === "failed") {
        return NextResponse.json({
          ok: false,
          status: "failed",
          error: done.error || "image_failed",
        });
      }
    }

    if (result === "busy") {
      return NextResponse.json({ ok: true, status: "processing" });
    }

    return NextResponse.json({
      ok: true,
      status: result === "failed" ? "failed" : "processing",
    });
  }

  return NextResponse.json({ ok: true, status: row.status });
}
