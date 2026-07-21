import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "credits");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const page = Math.max(0, Number(searchParams.get("page") || "0"));

    const { data, count, error } = await supabase
      .from("ai_credit_ledger")
      .select("id, created_at, user_id, delta, balance_after, reason, note, admin_id", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (error) throw error;

    const userIds = Array.from(new Set((data || []).map((r) => r.user_id as string)));
    const adminIds = Array.from(new Set((data || []).map((r) => r.admin_id as string).filter(Boolean)));

    const [{ data: userRows }, { data: adminRows }] = await Promise.all([
      userIds.length ? supabase.from("ai_users").select("id, phone").in("id", userIds) : Promise.resolve({ data: [] }),
      adminIds.length ? supabase.from("admin_users").select("id, name").in("id", adminIds) : Promise.resolve({ data: [] }),
    ]);
    const phoneMap = new Map((userRows || []).map((u) => [u.id as string, u.phone as string]));
    const adminMap = new Map((adminRows || []).map((a) => [a.id as string, a.name as string]));

    const entries = (data || []).map((r) => ({
      id: r.id,
      created_at: r.created_at,
      user_id: r.user_id,
      user_phone: phoneMap.get(r.user_id as string) || "—",
      delta: r.delta,
      balance_after: r.balance_after,
      reason: r.reason,
      note: r.note,
      admin_name: r.admin_id ? adminMap.get(r.admin_id as string) || null : null,
    }));

    return NextResponse.json({ ok: true, entries, total: count ?? entries.length });
  } catch (e) {
    console.error("[api/admin/ai-ops/credits] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "credits");
  if (!isAiOpsSession(session)) return session;

  // Until the wallet + lot + ledger mutation is moved behind one database RPC,
  // keep this corruption-prone financial path unavailable by default.
  if (process.env.AI_ADMIN_CREDIT_ADJUSTMENTS_ENABLED !== "true") {
    return NextResponse.json(
      { ok: false, error: "credit_adjustments_disabled" },
      { status: 503 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const userId = String(body.user_id || "");
    const delta = Math.round(Number(body.delta) || 0);
    if (!userId || !delta) return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });

    const { data: user, error: userErr } = await supabase.from("ai_users").select("id, credits").eq("id", userId).single();
    if (userErr || !user) return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });

    const balanceAfter = Math.max(0, (user.credits as number) + delta);
    await supabase.from("ai_users").update({ credits: balanceAfter }).eq("id", userId);
    if (delta > 0) {
      await supabase.from("ai_credit_lots").insert({
        user_id: userId,
        source: "admin_grant",
        amount: delta,
        remaining: delta,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        metadata: { admin_id: session.userId, note: body.note || body.reason || null },
      });
    }
    await supabase.from("ai_credit_ledger").insert({
      user_id: userId,
      delta,
      balance_after: balanceAfter,
      reason: delta > 0 ? "admin_grant" : "admin_revoke",
      note: body.note || body.reason || null,
      admin_id: session.userId,
    });

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: delta > 0 ? "credit.grant" : "credit.revoke",
      entityType: "ai_users",
      entityId: userId,
      meta: { delta, balance_after: balanceAfter, note: body.note ?? null },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/ai-ops/credits] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
