import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// لیست مکالمات
export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, title, mode, created_at, updated_at")
    .eq("user_id", session.userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[api/ai/conversations GET]", error);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, conversations: data });
}

// ایجاد مکالمه جدید
export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const mode = String(body.mode || "quick");
  const title = body.title ? String(body.title).slice(0, 100) : null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert({ user_id: session.userId, mode, title })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, conversation: { id: data.id } });
}
