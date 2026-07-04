import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "prompts");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("ai_prompt_templates")
      .select("*")
      .order("usage_count", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, prompts: data || [] });
  } catch (e) {
    console.error("[api/admin/ai-ops/prompts] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "prompts");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    if (!body.name || !body.content) {
      return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
    }
    const payload: Record<string, unknown> = {
      name: String(body.name),
      category: body.category || "persona",
      persona_key: body.persona_key || null,
      content: String(body.content),
      is_active: body.is_active ?? true,
      updated_at: new Date().toISOString(),
    };
    let result;
    if (body.id) {
      result = await supabase.from("ai_prompt_templates").update(payload).eq("id", body.id).select().single();
    } else {
      payload.created_by = session.userId;
      result = await supabase.from("ai_prompt_templates").insert(payload).select().single();
    }
    if (result.error) throw result.error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: body.id ? "prompt.update" : "prompt.create",
      entityType: "ai_prompt_templates",
      entityId: result.data?.id,
      meta: payload,
    });

    return NextResponse.json({ ok: true, prompt: result.data });
  } catch (e) {
    console.error("[api/admin/ai-ops/prompts] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = requireAiOpsModule(req, "prompts");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
    const { error } = await supabase.from("ai_prompt_templates").delete().eq("id", id);
    if (error) throw error;
    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "prompt.delete",
      entityType: "ai_prompt_templates",
      entityId: id,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[api/admin/ai-ops/prompts] DELETE error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
