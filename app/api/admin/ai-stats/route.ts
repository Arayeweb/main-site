import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Total users
    const { count: totalUsers } = await supabase
      .from("ai_users")
      .select("*", { count: "exact", head: true });

    // Users by plan
    const { data: usersByPlan } = await supabase
      .from("ai_users")
      .select("plan");

    const planCounts: Record<string, number> = {};
    for (const u of usersByPlan || []) {
      const p = (u.plan as string) || "free";
      planCounts[p] = (planCounts[p] || 0) + 1;
    }

    // Total battles
    const { count: totalConvs } = await supabase
      .from("ai_battles")
      .select("*", { count: "exact", head: true });

    // Battles by tier
    const { data: battlesByTier } = await supabase
      .from("ai_battles")
      .select("tier");

    const modeCounts: Record<string, number> = {};
    for (const c of battlesByTier || []) {
      const m = (c.tier as string) || "economy";
      modeCounts[m] = (modeCounts[m] || 0) + 1;
    }

    // Revenue (paid orders) vs API cost — margin monitoring
    const { data: paidOrders } = await supabase
      .from("ai_orders")
      .select("amount_toman")
      .eq("status", "paid");
    const totalRevenueToman = (paidOrders || []).reduce(
      (sum, o) => sum + ((o.amount_toman as number) || 0),
      0
    );

    const { data: costRows } = await supabase
      .from("ai_battles")
      .select("cost_usd")
      .order("created_at", { ascending: false })
      .range(0, 4999);
    const totalCostUsd = (costRows || []).reduce(
      (sum, r) => sum + Number(r.cost_usd || 0),
      0
    );

    // Usage stats — last 1000 rows for performance
    const { data: usageRows } = await supabase
      .from("ai_usage")
      .select("user_id, mode, tokens_used, created_at")
      .order("created_at", { ascending: false })
      .range(0, 999);

    const totalTokens = (usageRows || []).reduce(
      (sum, r) => sum + ((r.tokens_used as number) || 0),
      0
    );

    // Tokens by mode
    const tokensByMode: Record<string, number> = {};
    for (const r of usageRows || []) {
      const m = (r.mode as string) || "quick";
      tokensByMode[m] = (tokensByMode[m] || 0) + ((r.tokens_used as number) || 0);
    }

    // Last 7 days usage
    const now = Date.now();
    const last7: { date: string; tokens: number; requests: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      last7.push({ date: d.toISOString().slice(0, 10), tokens: 0, requests: 0 });
    }
    for (const r of usageRows || []) {
      const date = new Date(r.created_at as string).toISOString().slice(0, 10);
      const entry = last7.find((x) => x.date === date);
      if (entry) {
        entry.tokens += (r.tokens_used as number) || 0;
        entry.requests += 1;
      }
    }

    // Top users by token usage
    const userTokenMap = new Map<string, number>();
    for (const r of usageRows || []) {
      const uid = r.user_id as string;
      if (!uid) continue;
      userTokenMap.set(uid, (userTokenMap.get(uid) || 0) + ((r.tokens_used as number) || 0));
    }
    const topUserIds = Array.from(userTokenMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([uid, tokens]) => ({ uid, tokens }));

    // Fetch user details for top users
    let topUsers: { id: string; phone: string; plan: string; tokens: number; credits: number }[] = [];
    if (topUserIds.length > 0) {
      const { data: topUserData } = await supabase
        .from("ai_users")
        .select("id, phone, plan, credits")
        .in("id", topUserIds.map((t) => t.uid));

      topUsers = (topUserData || []).map((u) => ({
        id: u.id as string,
        phone: u.phone as string,
        plan: (u.plan as string) || "free",
        credits: (u.credits as number) || 0,
        tokens: userTokenMap.get(u.id as string) || 0,
      }));
    }

    // Recent users
    const { data: recentUsers } = await supabase
      .from("ai_users")
      .select("id, phone, plan, credits, created_at, last_login_at")
      .order("created_at", { ascending: false })
      .range(0, 19);

    return NextResponse.json({
      ok: true,
      total_users: totalUsers ?? 0,
      total_conversations: totalConvs ?? 0,
      total_tokens: totalTokens,
      total_revenue_toman: totalRevenueToman,
      total_cost_usd: Number(totalCostUsd.toFixed(4)),
      users_by_plan: planCounts,
      conversations_by_mode: modeCounts,
      tokens_by_mode: tokensByMode,
      last_7_days: last7,
      top_users: topUsers,
      recent_users: recentUsers || [],
    });
  } catch (e) {
    console.error("[api/admin/ai-stats] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
