import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { AI_OPS_ROLES } from "@/lib/auth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "team");
  if (!isAiOpsSession(session)) return session;
  if (session.role !== "ai_superadmin" && session.role !== "admin") {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const updates: Record<string, unknown> = {};
    if (typeof body.role === "string" && (AI_OPS_ROLES as string[]).includes(body.role)) updates.role = body.role;
    if (typeof body.is_active === "boolean") updates.is_active = body.is_active;

    const { data, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", params.id)
      .select("id, name, email, role, is_active, created_at, last_login_at")
      .single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "team.update",
      entityType: "admin_users",
      entityId: params.id,
      meta: updates,
    });

    return NextResponse.json({ ok: true, member: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/team/:id] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
