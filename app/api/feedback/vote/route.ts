// =========================================================
// POST /api/feedback/vote — رأی کاربر روی خروجی compare/council.
// یک رأی برای هر (user, run) — رأی مجدد به‌روزرسانی می‌شود.
// =========================================================

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const runId = typeof body.runId === "string" ? body.runId.trim() : "";
  if (!runId) {
    return NextResponse.json({ ok: false, error: "missing_run_id" }, { status: 422 });
  }

  const selectedModel =
    typeof body.selectedModel === "string" && body.selectedModel.trim()
      ? body.selectedModel.trim().slice(0, 100)
      : null;
  const rating =
    typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : null;

  if (!selectedModel && rating == null) {
    return NextResponse.json({ ok: false, error: "missing_vote" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();

  const { data: run } = await supabase
    .from("ai_runs")
    .select("id, user_id, mode, metadata")
    .eq("id", runId)
    .maybeSingle();

  if (!run || run.user_id !== session.userId) {
    return NextResponse.json({ ok: false, error: "run_not_found" }, { status: 404 });
  }

  // مدل انتخاب‌شده باید جزو مدل‌های همان run باشد
  if (selectedModel) {
    const models = (run.metadata as { models?: string[] })?.models ?? [];
    if (models.length > 0 && !models.includes(selectedModel)) {
      return NextResponse.json({ ok: false, error: "invalid_model" }, { status: 422 });
    }
  }

  const { error } = await supabase.from("feedback_votes").upsert(
    {
      user_id: session.userId,
      run_id: runId,
      selected_model: selectedModel,
      rating,
      metadata: { mode: run.mode },
    },
    { onConflict: "user_id,run_id" }
  );

  if (error) {
    console.error("[api/feedback/vote] upsert failed:", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
