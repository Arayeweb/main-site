import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "notifications");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ai_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ ok: true, notifications: data || [] });
  } catch (e) {
    console.error("[api/admin/ai-ops/notifications] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

/**
 * ایجاد اعلان — تحویل واقعی به کاربران هنوز پیاده‌سازی نشده (نبود کانال push/SMS اختصاصی).
 * فعلاً فقط رکورد ثبت می‌شود و sent_count با شمارش کاربران هدف پر می‌شود (TODO: اتصال کانال تحویل واقعی).
 */
export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "notifications");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    if (!body.title || !body.body) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }

    const audience = body.audience === "plan" ? "plan" : "all";
    let targetCount = 0;
    if (body.send_now) {
      let q = supabase.from("ai_users").select("*", { count: "exact", head: true });
      if (audience === "plan" && body.target_plan) q = q.eq("plan", body.target_plan);
      const { count } = await q;
      targetCount = count ?? 0;
    }

    const payload = {
      title: String(body.title),
      body: String(body.body),
      audience,
      target_plan: audience === "plan" ? body.target_plan || null : null,
      status: body.send_now ? "sent" : "draft",
      sent_at: body.send_now ? new Date().toISOString() : null,
      sent_count: targetCount,
      created_by: session.userId,
    };

    const { data, error } = await supabase.from("ai_notifications").insert(payload).select().single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "notification.create",
      entityType: "ai_notifications",
      entityId: data?.id,
      meta: payload,
    });

    return NextResponse.json({ ok: true, notification: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/notifications] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
