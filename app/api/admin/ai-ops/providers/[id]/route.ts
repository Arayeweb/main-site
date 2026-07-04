import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "providers");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.notes === "string") updates.notes = body.notes;
    if (typeof body.api_key_masked === "string") updates.api_key_masked = body.api_key_masked;
    updates.last_checked_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("ai_providers")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "provider.update",
      entityType: "ai_providers",
      entityId: params.id,
      meta: updates,
    });

    return NextResponse.json({ ok: true, provider: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/providers/:id] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
