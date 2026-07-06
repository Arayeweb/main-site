// =========================================================
// POST /api/ai/runs/[id]/stop — درخواست توقف یک run در حال اجرا.
// flag در Redis ثبت می‌شود و orchestrator بین eventها آن را می‌خواند.
// =========================================================

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { requestStop } from "@/lib/redis/locks";
import { abortRun } from "@/lib/ai/runAbortRegistry";
import { isUuid } from "@/lib/ai/requestValidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const runId = params.id;
  if (!runId || !isUuid(runId)) {
    return NextResponse.json({ ok: false, error: "missing_run_id" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data: run } = await supabase
    .from("ai_runs")
    .select("id, user_id, status")
    .eq("id", runId)
    .maybeSingle();

  if (!run || run.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "run_not_found" }, { status: 404 });
  }
  if (run.status !== "running") {
    return NextResponse.json({ ok: true, status: run.status });
  }

  await requestStop(runId);
  const aborted = abortRun(runId);
  return NextResponse.json({ ok: true, status: "stopping", aborted });
}
