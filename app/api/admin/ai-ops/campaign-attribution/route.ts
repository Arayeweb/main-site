import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GroupRow = {
  key: string;
  promo_code: string | null;
  utm_source: string | null;
  orders: number;
  paid_orders: number;
  revenue_toman: number;
  signups: number;
};

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "payments");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const groupBy = req.nextUrl.searchParams.get("group") === "utm" ? "utm" : "promo";

    const [{ data: orders }, { data: users }] = await Promise.all([
      supabase
        .from("ai_orders")
        .select("promo_code, utm_source, status, amount_toman, created_at")
        .order("created_at", { ascending: false })
        .limit(5000),
      supabase
        .from("ai_users")
        .select("utm_source, created_at")
        .not("utm_source", "is", null)
        .order("created_at", { ascending: false })
        .limit(5000),
    ]);

    const map = new Map<string, GroupRow>();

    function rowKey(promo: string | null, utm: string | null) {
      if (groupBy === "utm") return utm || "(بدون utm)";
      return promo || "(بدون کد)";
    }

    for (const o of orders || []) {
      const promo = (o.promo_code as string | null)?.toUpperCase() || null;
      const utm = (o.utm_source as string | null) || null;
      const key = rowKey(promo, utm);
      const cur = map.get(key) || {
        key,
        promo_code: groupBy === "promo" ? promo : promo,
        utm_source: groupBy === "utm" ? utm : utm,
        orders: 0,
        paid_orders: 0,
        revenue_toman: 0,
        signups: 0,
      };
      cur.orders += 1;
      if (o.status === "paid") {
        cur.paid_orders += 1;
        cur.revenue_toman += Number(o.amount_toman) || 0;
      }
      map.set(key, cur);
    }

    for (const u of users || []) {
      const utm = (u.utm_source as string | null) || null;
      if (!utm) continue;
      const key = groupBy === "utm" ? utm : "(بدون کد)";
      const cur = map.get(key) || {
        key,
        promo_code: null,
        utm_source: utm,
        orders: 0,
        paid_orders: 0,
        revenue_toman: 0,
        signups: 0,
      };
      cur.signups += 1;
      map.set(key, cur);
    }

    const groups = Array.from(map.values()).sort((a, b) => b.paid_orders - a.paid_orders);

    const totals = {
      orders: (orders || []).length,
      paid_orders: (orders || []).filter((o) => o.status === "paid").length,
      revenue_toman: (orders || [])
        .filter((o) => o.status === "paid")
        .reduce((s, o) => s + (Number(o.amount_toman) || 0), 0),
      signups_with_utm: (users || []).length,
    };

    return NextResponse.json({ ok: true, groupBy, groups, totals });
  } catch (e) {
    console.error("[api/admin/ai-ops/campaign-attribution] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
