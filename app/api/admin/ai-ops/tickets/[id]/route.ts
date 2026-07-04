import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";
import { logAiAdminAction } from "@/lib/aiAuditLog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "tickets");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const { data: t, error } = await supabase.from("ai_support_tickets").select("*").eq("id", params.id).single();
    if (error || !t) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });

    let phone = "—";
    if (t.user_id) {
      const { data: u } = await supabase.from("ai_users").select("phone").eq("id", t.user_id).single();
      phone = (u?.phone as string) || "—";
    }

    return NextResponse.json({
      ok: true,
      ticket: {
        id: t.id,
        created_at: t.created_at,
        updated_at: t.updated_at,
        user_phone: phone,
        subject: t.subject,
        body: t.body,
        status: t.status,
        priority: t.priority,
        admin_reply: t.admin_reply,
        replied_at: t.replied_at,
      },
    });
  } catch (e) {
    console.error("[api/admin/ai-ops/tickets/:id] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = requireAiOpsModule(req, "tickets");
  if (!isAiOpsSession(session)) return session;
  try {
    const supabase = getSupabaseAdmin();
    const body = await req.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.admin_reply === "string" && body.admin_reply.trim()) {
      updates.admin_reply = body.admin_reply.trim();
      updates.replied_at = new Date().toISOString();
      updates.status = body.status || "answered";
    }
    if (typeof body.status === "string") updates.status = body.status;
    if (typeof body.priority === "string") updates.priority = body.priority;

    const { data, error } = await supabase
      .from("ai_support_tickets")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();
    if (error) throw error;

    await logAiAdminAction(supabase, {
      adminId: session.userId,
      adminRole: session.role,
      action: "ticket.reply",
      entityType: "ai_support_tickets",
      entityId: params.id,
      meta: { status: updates.status, priority: updates.priority },
    });

    return NextResponse.json({ ok: true, ticket: data });
  } catch (e) {
    console.error("[api/admin/ai-ops/tickets/:id] PATCH error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
