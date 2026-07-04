import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "models");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.enabled === "boolean") updates.enabled = body.enabled;
    if (typeof body.cost_per_1k_tokens === "number") updates.cost_per_1k_tokens = body.cost_per_1k_tokens;
    if (typeof body.credit_cost === "number") updates.credit_cost = body.credit_cost;
    if (typeof body.notes === "string") updates.notes = body.notes;
    if (typeof body.tier === "string") updates.tier = body.tier;

    const { data, error } = await supabase
      .from("ai_model_registry")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "model.update",
      entityType: "ai_model_registry",
      entityId: params.id,
      meta: updates,
    });

    return NextResponse.json({ ok: true, model: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/models/:id] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
