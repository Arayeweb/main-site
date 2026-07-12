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

    const [{ data: calls }, { data: runs }, { data: users }, { data: orders }, { data: plans }] = await Promise.all([
      supabase
        .from("model_calls")
        .select("run_id, actual_model, model, role, cost_usd, credits_charged, revenue_toman, gross_profit_toman, gross_margin_percent, created_at")
        .gte("created_at", since30)
        .range(0, 19999),
      supabase
        .from("ai_runs")
        .select("id, user_id, mode, total_revenue_toman, total_provider_cost_usd, total_gross_profit_toman, created_at")
        .gte("created_at", since30)
        .range(0, 19999),
      supabase.from("ai_users").select("id, phone, plan"),
      supabase.from("ai_orders").select("user_id, amount_toman, created_at").eq("status", "paid").gte("created_at", since30),
      supabase.from("ai_plans").select("id, price_toman"),
    ]);
    agentDebugLog(
      "app/api/admin/ai-ops/costs/route.ts:GET",
      "ai_cost_source_rows",
      {
        since30,
        modelCallRows30d: calls?.length ?? 0,
        runRows30d: runs?.length ?? 0,
        userRows: users?.length ?? 0,
        paidOrderRows30d: orders?.length ?? 0,
        planRows: plans?.length ?? 0,
      },
      "H4"
    );

    const planOfUser = new Map((users || []).map((u) => [u.id as string, (u.plan as string) || "free"]));
    const phoneOfUser = new Map((users || []).map((u) => [u.id as string, u.phone as string]));
    const runMap = new Map((runs || []).map((r) => [r.id as string, r]));

    // by model
    const byModel = new Map<string, { requests: number; cost: number; revenue: number; profit: number }>();
    for (const c of calls || []) {
      const key = String(c.actual_model || c.model || "unknown");
      const entry = byModel.get(key) || { requests: 0, cost: 0, revenue: 0, profit: 0 };
      entry.requests += 1;
      entry.cost += Number(c.cost_usd) || 0;
      entry.revenue += Number(c.revenue_toman) || (Number(c.credits_charged) || 0) * 1000;
      entry.profit += Number(c.gross_profit_toman) || 0;
      byModel.set(key, entry);
    }

    // by plan (revenue vs cost)
    const revenueByPlan = new Map<string, number>();
    for (const o of orders || []) {
      const p = planOfUser.get(o.user_id as string) || "free";
      revenueByPlan.set(p, (revenueByPlan.get(p) || 0) + (Number(o.amount_toman) || 0));
    }
    const costByPlan = new Map<string, number>();
    const revenueByPlanFromRuns = new Map<string, number>();
    for (const r of runs || []) {
      const p = planOfUser.get(r.user_id as string) || "free";
      costByPlan.set(p, (costByPlan.get(p) || 0) + (Number(r.total_provider_cost_usd) || 0));
      revenueByPlanFromRuns.set(
        p,
        (revenueByPlanFromRuns.get(p) || 0) + (Number(r.total_revenue_toman) || 0)
      );
    }
    const USD_TOMAN = Number(process.env.AI_USD_TO_TOMAN || "220000");
    const planIds = new Set([...(plans || []).map((p) => p.id as string), ...revenueByPlan.keys(), ...costByPlan.keys()]);
    const byPlan = Array.from(planIds).map((plan) => {
      const revenue = (revenueByPlan.get(plan) || 0) + (revenueByPlanFromRuns.get(plan) || 0);
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
    for (const c of calls || []) {
      const date = new Date(c.created_at as string).toISOString().slice(0, 10);
      const i = idx.get(date);
      if (i !== undefined) days[i].cost_usd += Number(c.cost_usd) || 0;
    }

    // anomaly detection: cost per user last 7d vs mean/stddev of all users
    const since7 = new Date(now - 7 * 86400000).toISOString();
    const costByUser7d = new Map<string, number>();
    for (const c of calls || []) {
      if ((c.created_at as string) < since7) continue;
      const uid = runMap.get(c.run_id as string)?.user_id as string;
      if (!uid) continue;
      costByUser7d.set(uid, (costByUser7d.get(uid) || 0) + (Number(c.cost_usd) || 0));
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
      .map(([model, v]) => ({
        model,
        requests: v.requests,
        cost_usd: Number(v.cost.toFixed(4)),
        revenue_toman: Math.round(v.revenue),
        gross_profit_toman: Math.round(v.profit),
        margin_percent: v.revenue > 0 ? Number(((v.profit / v.revenue) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.cost_usd - a.cost_usd)
      .slice(0, 20);
    const totalProviderCostUsd = (calls || []).reduce((s, c) => s + (Number(c.cost_usd) || 0), 0);
    const totalRunRevenueToman = (runs || []).reduce((s, r) => s + (Number(r.total_revenue_toman) || 0), 0);
    const totalOrderRevenueToman = (orders || []).reduce((s, o) => s + (Number(o.amount_toman) || 0), 0);
    const totalRevenueToman = totalOrderRevenueToman + totalRunRevenueToman;
    const totalProviderCostToman = totalProviderCostUsd * USD_TOMAN;
    const totalGrossProfitToman = totalRevenueToman - totalProviderCostToman;
    const grossMarginPercent =
      totalRevenueToman > 0 ? (totalGrossProfitToman / totalRevenueToman) * 100 : 0;
    const minMargin = Number(process.env.AI_MIN_GROSS_MARGIN || "0.45") * 100;
    const byFeature = Array.from(
      (runs || []).reduce((map, r) => {
        const mode = String(r.mode || "unknown");
        const entry = map.get(mode) || { feature: mode, runs: 0, revenue_toman: 0, cost_usd: 0 };
        entry.runs += 1;
        entry.revenue_toman += Number(r.total_revenue_toman) || 0;
        entry.cost_usd += Number(r.total_provider_cost_usd) || 0;
        map.set(mode, entry);
        return map;
      }, new Map<string, { feature: string; runs: number; revenue_toman: number; cost_usd: number }>())
    ).map(([, v]) => {
      const costToman = v.cost_usd * USD_TOMAN;
      return {
        ...v,
        cost_usd: Number(v.cost_usd.toFixed(4)),
        margin_percent:
          v.revenue_toman > 0 ? Number((((v.revenue_toman - costToman) / v.revenue_toman) * 100).toFixed(1)) : 0,
      };
    });
    const lossMakers = [
      ...byModelArr
        .filter((m) => m.margin_percent < minMargin)
        .map((m) => ({ kind: "model", key: m.model, margin_percent: m.margin_percent })),
      ...byFeature
        .filter((f) => f.margin_percent < minMargin)
        .map((f) => ({ kind: "feature", key: f.feature, margin_percent: f.margin_percent })),
    ].slice(0, 20);
    agentDebugLog(
      "app/api/admin/ai-ops/costs/route.ts:GET",
      "ai_cost_report_computed",
      {
        costUsd30d: Number(totalProviderCostUsd.toFixed(4)),
        revenueToman30d: totalRevenueToman,
        byModelCount: byModelArr.length,
        byPlanCount: byPlan.length,
        anomalyCount: anomalies.length,
        usdTomanRate: USD_TOMAN,
      },
      "H4"
    );

    return NextResponse.json({
      ok: true,
      kpis: {
        total_ai_revenue_toman: Math.round(totalRevenueToman),
        total_provider_cost_usd: Number(totalProviderCostUsd.toFixed(4)),
        total_provider_cost_toman: Math.round(totalProviderCostToman),
        gross_profit_toman: Math.round(totalGrossProfitToman),
        gross_margin_percent: Number(grossMarginPercent.toFixed(1)),
      },
      by_model: byModelArr,
      by_feature: byFeature,
      by_plan: byPlan,
      by_day: days,
      anomalies,
      loss_makers: lossMakers,
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/costs] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
