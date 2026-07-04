import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { dbError, requireRoles } from "@/lib/adminRouteHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["open", "answered", "closed"]);

export async function GET(req: NextRequest) {
  if (!requireRoles(req, ["admin", "support"])) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const statusFilter = req.nextUrl.searchParams.get("status") || "open";
  const supabase = getSupabaseAdmin();

  let query = supabase
    .from("ai_support_tickets")
    .select(
      "id, user_id, subject, body, status, priority, admin_reply, replied_at, created_at, updated_at, ai_users(phone)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (statusFilter !== "all" && STATUSES.has(statusFilter)) {
    query = query.eq("status", statusFilter);
  }

  const { data, error } = await query;
  if (error) {
    return dbError(`[api/admin/support/tickets] GET ${error.message}`);
  }

  const tickets = (data || []).map((row) => {
    const users = row.ai_users as { phone?: string } | { phone?: string }[] | null;
    const phone = Array.isArray(users) ? users[0]?.phone : users?.phone;
    const { ai_users: _, ...rest } = row;
    return { ...rest, user_phone: phone || null };
  });

  return NextResponse.json({ ok: true, tickets });
}
