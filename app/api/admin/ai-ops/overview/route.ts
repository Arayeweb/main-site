import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "overview");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const now = Date.now();
    const since30 = new Date(now - 30 * DAY_MS).toISOString();
    const prev30Start = new Date(now - 60 * DAY_MS).toISOString();

    const [
      { count: totalUsers },
      { data: usersByPlan },
      { data: paidOrders30 },
      { data: paidOrdersPrev30 },
      { data: costRows30 },
      { data: usageRows30 },
      { data: providers },
      { data: failedPayments },
      { data: urgentTickets },
      { data: activeUsers30 },
    ] = await Promise.all([
      supabase.from("ai_users").select("*", { count: "exact", head: true }),
      supabase.from("ai_users").select("plan"),
      supabase.from("ai_orders").select("amount_toman, created_at").eq("status", "paid").gte("created_at", since30),
      supabase
        .from("ai_orders")
        .select("amount_toman, created_at")
        .eq("status", "paid")
        .gte("created_at", prev30Start)
        .lt("created_at", since30),
      supabase.from("ai_battles").select("cost_usd, created_at, user_id").gte("created_at", since30).range(0, 9999),
      supabase.from("ai_usage").select("tokens_used, created_at").gte("created_at", since30).range(0, 9999),
      supabase.from("ai_providers").select("id, name, status, error_rate, enabled"),
      supabase
        .from("ai_orders")
        .select("id, amount_toman, created_at, user_id")
        .eq("status", "failed")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("ai_support_tickets")
        .select("id, subject, priority, status, created_at")
        .in("priority", ["high"])
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("ai_users").select("id").gte("last_login_at", since30),
    ]);

    const planCounts: Record<string, number> = {};
    for (const u of usersByPlan || []) {
      const p = (u.plan as string) || "free";
      planCounts[p] = (planCounts[p] || 0) + 1;
    }

    const revenue30 = (paidOrders30 || []).reduce((s, o) => s + (Number(o.amount_toman) || 0), 0);
    const revenuePrev30 = (paidOrdersPrev30 || []).reduce((s, o) => s + (Number(o.amount_toman) || 0), 0);
    const cost30Usd = (costRows30 || []).reduce((s, r) => s + Number(r.cost_usd || 0), 0);
    const tokens30 = (usageRows30 || []).reduce((s, r) => s + (Number(r.tokens_used) || 0), 0);

    const USD_TOMAN = Number(process.env.USD_TOMAN_RATE || "850000");
    const cost30Toman = cost30Usd * USD_TOMAN;
    const grossMarginPercent = revenue30 > 0 ? ((revenue30 - cost30Toman) / revenue30) * 100 : 0;

    const churnPercent =
      revenuePrev30 > 0 && revenue30 < revenuePrev30
        ? Math.min(100, ((revenuePrev30 - revenue30) / revenuePrev30) * 100)
        : 0;

    // Revenue vs cost per day for last 30 days
    const days: { date: string; revenue_toman: number; cost_usd: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * DAY_MS);
      days.push({ date: d.toISOString().slice(0, 10), revenue_toman: 0, cost_usd: 0 });
    }
    const dayIndex = new Map(days.map((d, i) => [d.date, i]));
    for (const o of paidOrders30 || []) {
      const date = new Date(o.created_at as string).toISOString().slice(0, 10);
      const idx = dayIndex.get(date);
      if (idx !== undefined) days[idx].revenue_toman += Number(o.amount_toman) || 0;
    }
    for (const r of costRows30 || []) {
      const date = new Date(r.created_at as string).toISOString().slice(0, 10);
      const idx = dayIndex.get(date);
      if (idx !== undefined) days[idx].cost_usd += Number(r.cost_usd) || 0;
    }

    // Credits consumed (sum of credit_cost) last 30 days
    const { data: creditRows } = await supabase
      .from("ai_battles")
      .select("credit_cost")
      .gte("created_at", since30)
      .range(0, 9999);
    const creditsConsumed30 = (creditRows || []).reduce((s, r) => s + (Number(r.credit_cost) || 0), 0);

    // Estimated MRR: sum of active plan prices (users on paid plans) — approximation
    const { data: planCatalog } = await supabase.from("ai_plans").select("id, price_toman");
    const priceMap = new Map((planCatalog || []).map((p) => [p.id as string, Number(p.price_toman) || 0]));
    let mrr = 0;
    for (const [plan, count] of Object.entries(planCounts)) {
      if (plan !== "free") mrr += (priceMap.get(plan) || 0) * count;
    }

    // Negative margin users (top spenders by cost vs revenue, last 30d)
    const costByUser = new Map<string, number>();
    for (const r of costRows30 || []) {
      const uid = r.user_id as string;
      if (!uid) continue;
      costByUser.set(uid, (costByUser.get(uid) || 0) + Number(r.cost_usd || 0));
    }
    const topCostUserIds = Array.from(costByUser.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    let negativeMarginUsers: { id: string; phone: string; revenue_toman: number; cost_usd: number }[] = [];
    if (topCostUserIds.length > 0) {
      const { data: userRows } = await supabase
        .from("ai_users")
        .select("id, phone, plan")
        .in("id", topCostUserIds);
      negativeMarginUsers = (userRows || [])
        .map((u) => {
          const cost = costByUser.get(u.id as string) || 0;
          const planPrice = priceMap.get((u.plan as string) || "free") || 0;
          return { id: u.id as string, phone: u.phone as string, revenue_toman: planPrice, cost_usd: cost };
        })
        .filter((u) => u.cost_usd * USD_TOMAN > u.revenue_toman)
        .sort((a, b) => b.cost_usd - a.cost_usd)
        .slice(0, 5);
    }

    const failingProviders = (providers || []).filter((p) => p.status !== "operational" || (p.error_rate || 0) > 0.05);

    let failedPaymentsOut: { id: string; user_phone: string; amount_toman: number; created_at: string }[] = [];
    if ((failedPayments || []).length > 0) {
      const ids = (failedPayments || []).map((o) => o.user_id as string);
      const { data: users } = await supabase.from("ai_users").select("id, phone").in("id", ids);
      const phoneMap = new Map((users || []).map((u) => [u.id as string, u.phone as string]));
      failedPaymentsOut = (failedPayments || []).map((o) => ({
        id: o.id as string,
        user_phone: phoneMap.get(o.user_id as string) || "—",
        amount_toman: Number(o.amount_toman) || 0,
        created_at: o.created_at as string,
      }));
    }

    return NextResponse.json({
      ok: true,
      kpis: {
        total_users: totalUsers ?? 0,
        active_users_30d: (activeUsers30 || []).length,
        mrr_toman: mrr,
        revenue_30d_toman: revenue30,
        cost_30d_usd: Number(cost30Usd.toFixed(4)),
        gross_margin_percent: Number(grossMarginPercent.toFixed(1)),
        credits_consumed_30d: creditsConsumed30,
        churn_percent: Number(churnPercent.toFixed(1)),
      },
      revenue_vs_cost: days,
      plan_distribution: Object.entries(planCounts).map(([plan, count]) => ({ plan, count })),
      alerts: {
        failing_providers: failingProviders.map((p) => ({
          id: p.id as string,
          name: p.name as string,
          status: p.status as string,
          error_rate: Number(p.error_rate) || 0,
        })),
        failed_payments: failedPaymentsOut,
        urgent_tickets: (urgentTickets || []).map((t) => ({
          id: t.id as string,
          subject: t.subject as string,
          priority: t.priority as string,
          created_at: t.created_at as string,
        })),
        negative_margin_users: negativeMarginUsers,
      },
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/overview] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
