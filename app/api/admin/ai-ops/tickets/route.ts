import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAiOpsModule, isAiOpsSession } from "@/lib/aiAdminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = requireAiOpsModule(req, "tickets");
  if (!isAiOpsSession(session)) return session;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("ai_support_tickets")
      .select("id, created_at, updated_at, user_id, subject, body, status, priority, admin_reply, replied_at");
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(200);
    if (error) throw error;

    const userIds = Array.from(new Set((data || []).map((t) => t.user_id as string)));
    let phoneMap = new Map<string, string>();
    if (userIds.length) {
      const { data: users } = await supabase.from("ai_users").select("id, phone").in("id", userIds);
      phoneMap = new Map((users || []).map((u) => [u.id as string, u.phone as string]));
    }

    const tickets = (data || []).map((t) => ({
      id: t.id,
      created_at: t.created_at,
      updated_at: t.updated_at,
      user_phone: phoneMap.get(t.user_id as string) || "—",
      subject: t.subject,
      body: t.body,
      status: t.status,
      priority: t.priority,
      admin_reply: t.admin_reply,
      replied_at: t.replied_at,
    }));

    return NextResponse.json({ ok: true, tickets });
  } catch (e) {
    console.error("[api/admin/ai-ops/tickets] GET error:", e);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
}
