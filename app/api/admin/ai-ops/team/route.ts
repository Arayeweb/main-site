import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { AI_OPS_ROLES } from "@/lib/auth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "team");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, name, email, role, is_active, created_at, last_login_at")
      .in("role", [...AI_OPS_ROLES, "admin"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, members: data || [] });
  } catch (e) {
    console.error("[api/admin/ai-ops/team] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

/** ایجاد عضو تیم جدید — کاربر Supabase Auth + ردیف admin_users (مثل scripts/seed-admin.ts) */
export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "team");
  if (!isAiOpsSession(session)) return session;
  if (session.role !== "ai_superadmin" && session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const name = String(body.name || "");
    const role = String(body.role || "ai_ops");

    if (!email || !password || password.length < 8 || !(AI_OPS_ROLES as string[]).includes(role)) {
      return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
    }

    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created.user) {
      return NextResponse.json({ ok: false, error: createErr?.message || "auth_create_failed" }, { status: 400 });
    }

    const { data: row, error: dbErr } = await supabase
      .from("admin_users")
      .upsert({ id: created.user.id, email, name, role, is_active: true, password_hash: "" }, { onConflict: "id" })
      .select()
      .single();
    if (dbErr) throw dbErr;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "team.create",
      entityType: "admin_users",
      entityId: row.id,
      meta: { email, role },
    });

    return NextResponse.json({ ok: true, member: row });
  } catch (e) {
    console.error("[api/admin/ai-ops/team] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
