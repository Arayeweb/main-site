import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import {
  buildHistoryItems,
  buildRunHistoryItems,
  mergeUnifiedHistory,
  type HistoryRow,
} from "@/lib/aiHistory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
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
        return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
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

  const legacyItems = buildHistoryItems(rows || []);

  let runItems: ReturnType<typeof buildRunHistoryItems> = [];
  const { data: runRows, error: runErr } = await supabase
    .from("ai_runs")
    .select("id, mode, metadata, created_at, conversation_id")
    .eq("user_id", session.userId)
    .in("status", ["running", "completed", "cancelled", "failed", "settlement_failed"])
    .order("created_at", { ascending: false })
    .limit(120);

  if (!runErr && runRows) {
    runItems = buildRunHistoryItems(
      runRows as Array<{
        id: string;
        mode: string;
        metadata: { prompt?: string } | null;
        created_at: string;
        conversation_id: string | null;
      }>
    );
  }

  return jsonNoStore({
    ok: true,
    items: mergeUnifiedHistory(legacyItems, runItems),
  });
}
