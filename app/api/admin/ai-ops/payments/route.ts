import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 40;

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "payments");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = Math.max(0, Number(searchParams.get("page") || "0"));

    let query = supabase
      .from("ai_orders")
      .select(
        "id, created_at, user_id, package_id, amount_toman, list_amount_toman, discount_toman, status, promo_code, utm_source, utm_medium, utm_campaign, paid_at",
        { count: "exact" }
      );
    if (status) query = query.eq("status", status);

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (error) throw error;

    const userIds = Array.from(new Set((data || []).map((o) => o.user_id as string)));
    let phoneMap = new Map<string, string>();
    if (userIds.length) {
      const { data: users } = await supabase.from("ai_users").select("id, phone").in("id", userIds);
      phoneMap = new Map((users || []).map((u) => [u.id as string, u.phone as string]));
    }

    const payments = (data || []).map((o) => ({
      id: o.id,
      created_at: o.created_at,
      user_phone: phoneMap.get(o.user_id as string) || "—",
      package_id: o.package_id,
      amount_toman: o.amount_toman,
      list_amount_toman: o.list_amount_toman,
      discount_toman: o.discount_toman,
      status: o.status,
      promo_code: o.promo_code,
      utm_source: o.utm_source,
      utm_medium: o.utm_medium,
      utm_campaign: o.utm_campaign,
      paid_at: o.paid_at,
    }));

    return NextResponse.json({ ok: true, payments, total: count ?? payments.length });
  } catch (e) {
    console.error("[api/admin/ai-ops/payments] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
