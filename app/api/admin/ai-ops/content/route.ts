import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "content");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("ai_content_blocks").select("*").order("id");
    if (error) throw error;
    return NextResponse.json({ ok: true, blocks: data || [] });
  } catch (e) {
    console.error("[api/admin/ai-ops/content] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = requireAiOpsModule(req, "content");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });

    const payload = {
      id: String(body.id),
      title: String(body.title ?? body.id),
      body: String(body.body ?? ""),
      kind: body.kind || "markdown",
      is_published: body.is_published ?? true,
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };
    const { data, error } = await supabase.from("ai_content_blocks").upsert(payload, { onConflict: "id" }).select().single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "content.update",
      entityType: "ai_content_blocks",
      entityId: payload.id,
    });

    return NextResponse.json({ ok: true, block: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/content] POST error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
