import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "coupons");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: coupons }, { data: orders }] = await Promise.all([
      supabase.from("ai_promo_codes").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_orders").select("promo_code, discount_toman").not("promo_code", "is", null),
    ]);

    const redeemedCount = new Map<string, number>();
    const discountByCode = new Map<string, number>();
    for (const o of orders || []) {
      const code = (o.promo_code as string)?.toUpperCase();
      if (!code) continue;
      redeemedCount.set(code, (redeemedCount.get(code) || 0) + 1);
      discountByCode.set(code, (discountByCode.get(code) || 0) + (Number(o.discount_toman) || 0));
    }

    const out = (coupons || []).map((c) => ({
      id: c.id,
      code: c.code,
      kind: c.kind,
      value: c.value,
      max_uses: c.max_uses,
      used_count: c.used_count,
      expires_at: c.expires_at,
      active: c.active,
      redeemed_orders: redeemedCount.get((c.code as string)?.toUpperCase()) || 0,
      discount_given_toman: discountByCode.get((c.code as string)?.toUpperCase()) || 0,
    }));

    return NextResponse.json({ ok: true, coupons: out });
  } catch (e) {
    console.error("[api/admin/ai-ops/coupons] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "coupons");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    if (!body.code) return NextResponse.json({ ok: false, error: "missing_code" }, { status: 400 });

    const payload: Record<string, unknown> = {
      code: String(body.code).trim().toUpperCase(),
      kind: body.kind === "fixed" ? "fixed" : "percent",
      value: Number(body.value) || 0,
      max_uses: Number(body.max_uses) || 1000,
      expires_at: body.expires_at || null,
      active: body.active ?? true,
    };

    let result;
    if (body.id) {
      result = await supabase.from("ai_promo_codes").update(payload).eq("id", body.id).select().single();
    } else {
      result = await supabase.from("ai_promo_codes").insert(payload).select().single();
    }
    if (result.error) throw result.error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: body.id ? "coupon.update" : "coupon.create",
      entityType: "ai_promo_codes",
      entityId: result.data?.id,
      meta: payload,
    });

    return NextResponse.json({ ok: true, coupon: result.data });
  } catch (e) {
    console.error("[api/admin/ai-ops/coupons] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
