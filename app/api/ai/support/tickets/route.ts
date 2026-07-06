import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { withPublicTimeout } from "@/lib/publicDataFetch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 4000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const result = await withPublicTimeout(
    supabase
      .from("ai_support_tickets")
      .select("id, subject, status, priority, created_at, updated_at, replied_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(100),
    "support/tickets"
  );

  if (!result) {
    return jsonNoStore({ ok: true, tickets: [] });
  }

  const { data, error } = result;

  if (error) {
    console.error("[api/ai/support/tickets] GET", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({ ok: true, tickets: data || [] });
}

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const subject = str(body.subject, 200);
  const ticketBody = str(body.body, 4000);
  if (!subject || !ticketBody) {
    return jsonNoStore({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_support_tickets")
    .insert({
      user_id: session.userId,
      subject,
      body: ticketBody,
    })
    .select("id, subject, status, priority, created_at")
    .single();

  if (error) {
    console.error("[api/ai/support/tickets] POST", error.message);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({ ok: true, ticket: data });
}
