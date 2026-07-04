import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "plans");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: plans }, { data: users }, { data: orders }, { data: battles }] = await Promise.all([
      supabase.from("ai_plans").select("*").order("price_toman", { ascending: true }),
      supabase.from("ai_users").select("id, plan"),
      supabase.from("ai_orders").select("user_id, amount_toman").eq("status", "paid"),
      supabase.from("ai_battles").select("user_id, cost_usd"),
    ]);

    const planOfUser = new Map((users || []).map((u) => [u.id as string, (u.plan as string) || "free"]));
    const subscriberCount: Record<string, number> = {};
    for (const u of users || []) {
      const p = (u.plan as string) || "free";
      subscriberCount[p] = (subscriberCount[p] || 0) + 1;
    }

    const revenueByPlan: Record<string, number> = {};
    for (const o of orders || []) {
      const p = planOfUser.get(o.user_id as string) || "free";
      revenueByPlan[p] = (revenueByPlan[p] || 0) + (Number(o.amount_toman) || 0);
    }

    const costByPlan: Record<string, number> = {};
    for (const b of battles || []) {
      const p = planOfUser.get(b.user_id as string) || "free";
      costByPlan[p] = (costByPlan[p] || 0) + (Number(b.cost_usd) || 0);
    }

    const USD_TOMAN = Number(process.env.USD_TOMAN_RATE || "850000");

    const out = (plans || []).map((p) => {
      const revenue = revenueByPlan[p.id as string] || 0;
      const costUsd = costByPlan[p.id as string] || 0;
      const costToman = costUsd * USD_TOMAN;
      const margin = revenue > 0 ? ((revenue - costToman) / revenue) * 100 : revenue === 0 && costToman > 0 ? -100 : 0;
      return {
        id: p.id,
        name: p.name,
        price_toman: p.price_toman,
        credits: p.credits,
        description: p.description,
        features: p.features || [],
        is_active: p.is_active,
        is_featured: p.is_featured,
        active_subscribers: subscriberCount[p.id as string] || 0,
        revenue_toman: revenue,
        cost_usd: Number(costUsd.toFixed(4)),
        margin_percent: Number(margin.toFixed(1)),
      };
    });

    return NextResponse.json({ ok: true, plans: out });
  } catch (e) {
    console.error("[api/admin/ai-ops/plans] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "plans");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

    const payload = {
      id: String(body.id),
      name: String(body.name ?? body.id),
      price_toman: Number(body.price_toman) || 0,
      credits: Number(body.credits) || 0,
      description: body.description ?? null,
      features: Array.isArray(body.features) ? body.features : [],
      is_active: body.is_active ?? true,
      is_featured: body.is_featured ?? false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("ai_plans").upsert(payload, { onConflict: "id" }).select().single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "plan.upsert",
      entityType: "ai_plans",
      entityId: payload.id,
      meta: payload,
    });

    return NextResponse.json({ ok: true, plan: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/plans] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
