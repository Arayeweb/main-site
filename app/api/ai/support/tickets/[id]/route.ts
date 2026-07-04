import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_support_tickets")
    .select(
      "id, subject, body, status, priority, admin_reply, replied_at, created_at, updated_at"
    )
    .eq("id", id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    console.error("[api/ai/support/tickets/[id]] GET", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, ticket: data });
}
