import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getActiveAISession } from "@/lib/aiDeviceSessions";
import { creditReasonLabel } from "@/lib/aiCreditLabels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getActiveAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const since = new Date(Date.now() - 30 * 86400000).toISOString();

    const [{ data: userRow }, { data: ledgerRows, error: ledgerErr }, { data: usageRows }] =
      await Promise.all([
        supabase
          .from("ai_users")
          .select("credits, plan")
          .eq("id", session.userId)
          .maybeSingle(),
        supabase
          .from("ai_credit_ledger")
          .select("id, created_at, delta, reason, note, balance_after")
          .eq("user_id", session.userId)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("ai_usage")
          .select("tokens_used, created_at")
          .eq("user_id", session.userId)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);

    if (ledgerErr) {
      console.error("[api/ai/credits/usage] ledger:", ledgerErr);
      return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
    }

    let spent30d = 0;
    let earned30d = 0;
    const sinceMs = Date.now() - 30 * 86400000;
    for (const row of ledgerRows || []) {
      const t = new Date(row.created_at as string).getTime();
      if (t < sinceMs) continue;
      const d = Number(row.delta) || 0;
      if (d < 0) spent30d += Math.abs(d);
      else if (d > 0) earned30d += d;
    }

    const days: { date: string; tokens: number; requests: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), tokens: 0, requests: 0 });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const r of usageRows || []) {
      const date = new Date(r.created_at as string).toISOString().slice(0, 10);
      const i = idx.get(date);
      if (i !== undefined) {
        days[i].tokens += Number(r.tokens_used) || 0;
        days[i].requests += 1;
      }
    }

    return jsonNoStore({
      ok: true,
      balance: Number(userRow?.credits) || 0,
      plan: (userRow?.plan as string) || session.plan || "free",
      summary: {
        spent_30d: spent30d,
        earned_30d: earned30d,
        requests_30d: (usageRows || []).length,
      },
      usage_daily: days,
      ledger: (ledgerRows || []).map((l) => ({
        id: l.id,
        created_at: l.created_at,
        delta: Number(l.delta) || 0,
        reason: l.reason,
        reason_label: creditReasonLabel(l.reason as string),
        note: l.note,
        balance_after: l.balance_after,
      })),
    });
  } catch (e) {
    console.error("[api/ai/credits/usage GET]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
