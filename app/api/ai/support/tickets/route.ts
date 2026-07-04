import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

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
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_support_tickets")
    .select("id, subject, status, priority, created_at, updated_at, replied_at")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("[api/ai/support/tickets] GET", error.message);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, tickets: data || [] });
}

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const subject = str(body.subject, 200);
  const ticketBody = str(body.body, 4000);
  if (!subject || !ticketBody) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
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
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ticket: data });
}
