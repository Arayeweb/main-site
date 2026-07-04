import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const threadId = req.nextUrl.searchParams.get("threadId");
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("ai_media_jobs")
    .select("id, prompt, model_id, status, thread_id, created_at, error, dismissed_at")
    .eq("user_id", session.userId)
    .eq("kind", "video")
    .in("status", ["pending", "processing"])
    .order("created_at", { ascending: true })
    .limit(10);

  if (threadId) {
    query = query.eq("thread_id", threadId);
  } else {
    query = query.is("thread_id", null);
  }

  const { data: jobs, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  const visible = (jobs || []).filter(
    (j) => j.error !== "dismissed_by_user" && !(j as { dismissed_at?: string | null }).dismissed_at
  );

  return NextResponse.json({
    ok: true,
    jobs: visible.map((j) => ({
      id: j.id,
      prompt: j.prompt,
      modelId: j.model_id,
      status: j.status,
      threadId: j.thread_id,
      createdAt: j.created_at,
    })),
  });
}
