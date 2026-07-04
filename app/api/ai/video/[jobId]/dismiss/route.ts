import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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
    .select("id, user_id, status")
    .eq("id", params.jobId)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  if (job.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  if (job.status === "completed" || job.status === "failed") {
    return NextResponse.json({ ok: true, alreadyDone: true });
  }

  const { error: updateErr } = await supabase
    .from("ai_media_jobs")
    .update({ error: "dismissed_by_user" })
    .eq("id", params.jobId);

  if (updateErr) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // Best-effort when migration is applied; ignore failure if column missing.
  await supabase
    .from("ai_media_jobs")
    .update({ dismissed_at: new Date().toISOString() })
    .eq("id", params.jobId);

  // #region agent log
  fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
    body: JSON.stringify({
      sessionId: "d89e34",
      runId: "post-fix",
      hypothesisId: "H12",
      location: "video/[jobId]/dismiss/route.ts:POST",
      message: "job dismissed in database",
      data: { jobId: params.jobId, status: job.status },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return NextResponse.json({ ok: true });
}
