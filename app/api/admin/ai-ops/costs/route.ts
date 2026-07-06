import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { agentDebugLog } from "@/lib/agentDebug.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "costs");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const since30 = new Date(Date.now() - 30 * 86400000).toISOString();

    const [{ data: battles }, { data: users }, { data: orders }, { data: plans }] = await Promise.all([
      supabase.from("ai_battles").select("model_a, model_b, cost_usd, user_id, created_at").gte("created_at", since30).range(0, 19999),
      supabase.from("ai_users").select("id, phone, plan"),
      supabase.from("ai_orders").select("user_id, amount_toman, created_at").eq("status", "paid").gte("created_at", since30),
      supabase.from("ai_plans").select("id, price_toman"),
    ]);
    agentDebugLog(
      "app/api/admin/ai-ops/costs/route.ts:GET",
      "ai_cost_source_rows",
      {
        since30,
        battleRows30d: battles?.length ?? 0,
        userRows: users?.length ?? 0,
        paidOrderRows30d: orders?.length ?? 0,
        planRows: plans?.length ?? 0,
      },
      "H4"
    );

    const planOfUser = new Map((users || []).map((u) => [u.id as string, (u.plan as string) || "free"]));
    const phoneOfUser = new Map((users || []).map((u) => [u.id as string, u.phone as string]));

    // by model
    const byModel = new Map<string, { requests: number; cost: number }>();
    for (const b of battles || []) {
      const cost = Number(b.cost_usd) || 0;
      for (const key of [b.model_a, b.model_b]) {
        const k = key as string;
        if (!k) continue;
        const entry = byModel.get(k) || { requests: 0, cost: 0 };
        entry.requests += 1;
        entry.cost += cost / (b.model_b ? 2 : 1);
        byModel.set(k, entry);
      }
    }

    // by plan (revenue vs cost)
    const revenueByPlan = new Map<string, number>();
    for (const o of orders || []) {
      const p = planOfUser.get(o.user_id as string) || "free";
      revenueByPlan.set(p, (revenueByPlan.get(p) || 0) + (Number(o.amount_toman) || 0));
    }
    const costByPlan = new Map<string, number>();
    for (const b of battles || []) {
      const p = planOfUser.get(b.user_id as string) || "free";
      costByPlan.set(p, (costByPlan.get(p) || 0) + (Number(b.cost_usd) || 0));
    }
    const USD_TOMAN = Number(process.env.USD_TOMAN_RATE || "850000");
    const planIds = new Set([...(plans || []).map((p) => p.id as string), ...revenueByPlan.keys(), ...costByPlan.keys()]);
    const byPlan = Array.from(planIds).map((plan) => {
      const revenue = revenueByPlan.get(plan) || 0;
      const costUsd = costByPlan.get(plan) || 0;
      const costToman = costUsd * USD_TOMAN;
      const margin = revenue > 0 ? ((revenue - costToman) / revenue) * 100 : costToman > 0 ? -100 : 0;
      return { plan, revenue_toman: revenue, cost_usd: Number(costUsd.toFixed(4)), margin_percent: Number(margin.toFixed(1)) };
    });

    // by day
    const days: { date: string; cost_usd: number }[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), cost_usd: 0 });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const b of battles || []) {
      const date = new Date(b.created_at as string).toISOString().slice(0, 10);
      const i = idx.get(date);
      if (i !== undefined) days[i].cost_usd += Number(b.cost_usd) || 0;
    }

    // anomaly detection: cost per user last 7d vs mean/stddev of all users
    const since7 = new Date(now - 7 * 86400000).toISOString();
    const costByUser7d = new Map<string, number>();
    for (const b of battles || []) {
      if ((b.created_at as string) < since7) continue;
      const uid = b.user_id as string;
      if (!uid) continue;
      costByUser7d.set(uid, (costByUser7d.get(uid) || 0) + (Number(b.cost_usd) || 0));
    }
    const costValues = Array.from(costByUser7d.values());
    const mean = costValues.reduce((s, v) => s + v, 0) / (costValues.length || 1);
    const variance = costValues.reduce((s, v) => s + (v - mean) ** 2, 0) / (costValues.length || 1);
    const stddev = Math.sqrt(variance) || 1;

    const anomalies = Array.from(costByUser7d.entries())
      .map(([uid, cost]) => ({ user_id: uid, cost, z: (cost - mean) / stddev }))
      .filter((a) => a.z > 2)
      .sort((a, b) => b.z - a.z)
      .slice(0, 10)
      .map((a) => ({
        user_id: a.user_id,
        phone: phoneOfUser.get(a.user_id) || "—",
        z_score: Number(a.z.toFixed(2)),
        cost_usd_7d: Number(a.cost.toFixed(4)),
      }));

    const byModelArr = Array.from(byModel.entries())
      .map(([model, v]) => ({ model, requests: v.requests, cost_usd: Number(v.cost.toFixed(4)) }))
      .sort((a, b) => b.cost_usd - a.cost_usd)
      .slice(0, 20);
    agentDebugLog(
      "app/api/admin/ai-ops/costs/route.ts:GET",
      "ai_cost_report_computed",
      {
        costUsd30d: Number((battles || []).reduce((s, b) => s + (Number(b.cost_usd) || 0), 0).toFixed(4)),
        revenueToman30dPaid: (orders || []).reduce((s, o) => s + (Number(o.amount_toman) || 0), 0),
        byModelCount: byModelArr.length,
        byPlanCount: byPlan.length,
        anomalyCount: anomalies.length,
        usdTomanRate: USD_TOMAN,
      },
      "H4"
    );

    return NextResponse.json({
      ok: true,
      by_model: byModelArr,
      by_plan: byPlan,
      by_day: days,
      anomalies,
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/costs] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
