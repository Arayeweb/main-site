import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "settings");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("ai_settings").select("data").eq("id", 1).single();
    if (error) throw error;
    return NextResponse.json({ ok: true, settings: data?.data || {} });
  } catch (e) {
    console.error("[api/admin/ai-ops/settings] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = requireAiOpsModule(req, "settings");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const { data, error } = await supabase
      .from("ai_settings")
      .update({ data: body.data || {}, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select()
      .single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "settings.update",
      entityType: "ai_settings",
      entityId: "1",
    });

    return NextResponse.json({ ok: true, settings: data?.data || {} });
  } catch (e) {
    console.error("[api/admin/ai-ops/settings] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
