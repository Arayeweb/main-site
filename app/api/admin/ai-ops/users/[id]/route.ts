import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "users");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;

    const { data: userRow, error } = await supabase
      .from("ai_users")
      .select("id, phone, plan, credits, status, abuse_score, created_at, last_login_at")
      .eq("id", id)
      .single();
    if (error || !userRow) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    const [{ data: usageRows }, { data: ledgerRows }, { data: battleRows }, { data: orderRows }, { data: ticketRows }, { data: orderSum }, { data: costSum }] =
      await Promise.all([
        supabase.from("ai_usage").select("tokens_used, created_at").eq("user_id", id).order("created_at", { ascending: false }).range(0, 499),
        supabase
          .from("ai_credit_ledger")
          .select("id, created_at, delta, reason, note, balance_after")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("ai_battles")
          .select("id, created_at, prompt, tier, cost_usd, credit_cost")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("ai_orders")
          .select("id, created_at, package_id, amount_toman, status")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("ai_support_tickets")
          .select("id, subject, status, priority, created_at")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase.from("ai_orders").select("amount_toman").eq("user_id", id).eq("status", "paid"),
        supabase.from("ai_battles").select("cost_usd").eq("user_id", id),
      ]);

    const totalSpend = (orderSum || []).reduce((s, o) => s + (Number(o.amount_toman) || 0), 0);
    const totalCost = (costSum || []).reduce((s, r) => s + (Number(r.cost_usd) || 0), 0);

    // Bucket usage by day (last 30 days)
    const now = Date.now();
    const days: { date: string; tokens: number; requests: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      days.push({ date: d.toISOString().slice(0, 10), tokens: 0, requests: 0 });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const r of usageRows || []) {
      const date = new Date(r.created_at as string).toISOString().slice(0, 10);
      const i = idx.get(date);
      if (i !== undefined) {
        days[i].tokens += Number(r.tokens_used) || 0;
        days[i].requests += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: userRow.id,
        phone: userRow.phone,
        plan: userRow.plan || "free",
        status: userRow.status || "active",
        credits: userRow.credits || 0,
        abuse_score: Number(userRow.abuse_score) || 0,
        created_at: userRow.created_at,
        last_login_at: userRow.last_login_at,
        total_spend_toman: totalSpend,
        total_cost_usd: Number(totalCost.toFixed(4)),
      },
      usage: days,
      ledger: (ledgerRows || []).map((l) => ({
        id: l.id,
        created_at: l.created_at,
        delta: l.delta,
        reason: l.reason,
        note: l.note,
        balance_after: l.balance_after,
      })),
      battles: (battleRows || []).map((b) => ({
        id: b.id,
        created_at: b.created_at,
        prompt: (b.prompt as string)?.slice(0, 160) || "",
        tier: b.tier,
        cost_usd: Number(b.cost_usd) || 0,
        credit_cost: b.credit_cost,
      })),
      orders: orderRows || [],
      tickets: ticketRows || [],
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/users/:id] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "users");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { id } = params;
    const body = await req.json();

    const { data: current } = await supabase.from("ai_users").select("id, credits, plan, status").eq("id", id).single();
    if (!current) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    const updates: Record<string, unknown> = {};
    if (body.status && ["active", "suspended", "banned"].includes(body.status)) updates.status = body.status;
    if (body.plan && ["free", "starter", "pro", "business"].includes(body.plan)) updates.plan = body.plan;
    if (typeof body.admin_note === "string") updates.admin_note = body.admin_note;

    let newBalance = current.credits as number;
    if (typeof body.credit_delta === "number" && body.credit_delta !== 0) {
      newBalance = Math.max(0, (current.credits as number) + Math.round(body.credit_delta));
      updates.credits = newBalance;
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateErr } = await supabase.from("ai_users").update(updates).eq("id", id);
      if (updateErr) throw updateErr;
    }

    if (typeof body.credit_delta === "number" && body.credit_delta !== 0) {
      await supabase.from("ai_credit_ledger").insert({
        user_id: id,
        delta: Math.round(body.credit_delta),
        balance_after: newBalance,
        reason: body.credit_delta > 0 ? "admin_grant" : "admin_revoke",
        note: body.credit_reason || null,
        admin_id: session.userId,
      });
    }

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "user.update",
      entityType: "ai_users",
      entityId: id,
      meta: { updates, credit_delta: body.credit_delta ?? null },
    });

    const { data: updated } = await supabase
      .from("ai_users")
      .select("id, phone, plan, credits, status, abuse_score, created_at, last_login_at")
      .eq("id", id)
      .single();

    return NextResponse.json({
      ok: true,
      user: {
        id: updated?.id,
        phone: updated?.phone,
        plan: updated?.plan || "free",
        status: updated?.status || "active",
        credits: updated?.credits || 0,
        abuse_score: Number(updated?.abuse_score) || 0,
        created_at: updated?.created_at,
        last_login_at: updated?.last_login_at,
        total_spend_toman: 0,
        total_cost_usd: 0,
      },
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/users/:id] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
