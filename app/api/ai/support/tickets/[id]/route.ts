import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { withPublicTimeout } from "@/lib/publicDataFetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return jsonNoStore({ ok: false, error: "missing_id" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const result = await withPublicTimeout(
    supabase
      .from("ai_support_tickets")
      .select(
        "id, subject, body, status, priority, admin_reply, replied_at, created_at, updated_at"
      )
      .eq("id", id)
      .eq("user_id", session.userId)
      .maybeSingle(),
    "support/ticket-detail"
  );

  if (!result) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  const { data, error } = result;

  if (error) {
    console.error("[api/ai/support/tickets/[id]] GET", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
  if (!data) {
    return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
  }

  return jsonNoStore({ ok: true, ticket: data });
}
