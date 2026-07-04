import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "users");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const plan = searchParams.get("plan");
    const status = searchParams.get("status");
    const page = Math.max(0, Number(searchParams.get("page") || "0"));

    let query = supabase
      .from("ai_users")
      .select("id, phone, plan, credits, status, abuse_score, created_at, last_login_at", { count: "exact" });

    if (q) query = query.ilike("phone", `%${q}%`);
    if (plan) query = query.eq("plan", plan);
    if (status) query = query.eq("status", status);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (error) throw error;

    const ids = (data || []).map((u) => u.id as string);
    let spendMap = new Map<string, number>();
    let costMap = new Map<string, number>();
    if (ids.length > 0) {
      const [{ data: orders }, { data: battles }] = await Promise.all([
        supabase.from("ai_orders").select("user_id, amount_toman").eq("status", "paid").in("user_id", ids),
        supabase.from("ai_battles").select("user_id, cost_usd").in("user_id", ids),
      ]);
      for (const o of orders || []) {
        const uid = o.user_id as string;
        spendMap.set(uid, (spendMap.get(uid) || 0) + (Number(o.amount_toman) || 0));
      }
      for (const b of battles || []) {
        const uid = b.user_id as string;
        if (!uid) continue;
        costMap.set(uid, (costMap.get(uid) || 0) + (Number(b.cost_usd) || 0));
      }
    }

    const users = (data || []).map((u) => ({
      id: u.id as string,
      phone: u.phone as string,
      plan: (u.plan as string) || "free",
      status: (u.status as string) || "active",
      credits: (u.credits as number) || 0,
      abuse_score: Number(u.abuse_score) || 0,
      created_at: u.created_at as string,
      last_login_at: u.last_login_at as string | null,
      total_spend_toman: spendMap.get(u.id as string) || 0,
      total_cost_usd: Number((costMap.get(u.id as string) || 0).toFixed(4)),
    }));

    return NextResponse.json({ ok: true, users, total: count ?? users.length });
  } catch (e) {
    console.error("[api/admin/ai-ops/users] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
