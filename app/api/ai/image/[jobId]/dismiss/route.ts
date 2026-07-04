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
  const { data: job } = await supabase
    .from("ai_media_jobs")
    .select("id, user_id, status")
    .eq("id", params.jobId)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }
  if (job.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  await supabase
    .from("ai_media_jobs")
    .update({
      error: "dismissed_by_user",
      dismissed_at: new Date().toISOString(),
    })
    .eq("id", params.jobId);

  return NextResponse.json({ ok: true });
}
