import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { buildHistoryItems, type HistoryRow } from "@/lib/aiHistory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  let rows: HistoryRow[] | null = null;

  const withThread = await supabase
    .from("ai_battles")
    .select("id, prompt, tier, created_at, thread_id, persona_key")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(120);

  if (!withThread.error && withThread.data) {
    rows = withThread.data as HistoryRow[];
  } else {
    const plain = await supabase
      .from("ai_battles")
      .select("id, prompt, tier, created_at, thread_id, persona_key")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(120);

    if (plain.error) {
      const legacy = await supabase
        .from("ai_battles")
        .select("id, prompt, tier, created_at")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
        .limit(120);

      if (legacy.error) {
        console.error("[api/ai/history]", legacy.error.message, withThread.error?.message);
        return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
      }

      rows = (legacy.data || []).map((r) => ({
        ...(r as HistoryRow),
        thread_id: null,
        persona_key: null,
      }));
    } else {
      rows = plain.data as HistoryRow[];
    }
  }

  return NextResponse.json({
    ok: true,
    items: buildHistoryItems(rows || []),
  });
}
