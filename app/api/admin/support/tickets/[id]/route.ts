import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { dbError, requireRoles, str } from "@/lib/adminRouteHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set(["open", "answered", "closed"]);
const PRIORITIES = new Set(["low", "normal", "high"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!requireRoles(req, ["admin", "support"])) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if ("status" in body) {
    const status = str(body.status, 32);
    if (!status || !STATUSES.has(status)) {
      return NextResponse.json({ ok: false, error: "invalid_status" }, { status: 422 });
    }
    patch.status = status;
  }

  if ("priority" in body) {
    const priority = str(body.priority, 32);
    if (!priority || !PRIORITIES.has(priority)) {
      return NextResponse.json({ ok: false, error: "invalid_priority" }, { status: 422 });
    }
    patch.priority = priority;
  }

  if ("admin_reply" in body) {
    const reply = str(body.admin_reply, 4000);
    if (!reply) {
      return NextResponse.json({ ok: false, error: "empty_reply" }, { status: 422 });
    }
    patch.admin_reply = reply;
    patch.replied_at = new Date().toISOString();
    if (!("status" in body)) {
      patch.status = "answered";
    }
  }

  if (Object.keys(patch).length === 1) {
    return NextResponse.json({ ok: false, error: "nothing_to_update" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_support_tickets")
    .update(patch)
    .eq("id", id)
    .select(
      "id, user_id, subject, body, status, priority, admin_reply, replied_at, created_at, updated_at"
    )
    .maybeSingle();

  if (error) {
    return dbError(`[api/admin/support/tickets/[id]] PATCH ${error.message}`);
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ticket: data });
}
