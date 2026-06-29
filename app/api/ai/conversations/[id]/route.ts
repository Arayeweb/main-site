import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// دریافت یک مکالمه با همه پیام‌ها و response‌ها
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();

  // بررسی مالکیت
  const { data: conv, error: convErr } = await supabase
    .from("ai_conversations")
    .select("id, title, mode, created_at")
    .eq("id", id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (convErr || !conv) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  // پیام‌ها
  const { data: messages, error: msgErr } = await supabase
    .from("ai_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  if (msgErr) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  // response‌های ساختاریافته برای پیام‌های assistant
  const assistantIds = (messages ?? [])
    .filter((m) => m.role === "assistant")
    .map((m) => m.id as string);

  let responsesMap: Record<string, unknown[]> = {};
  if (assistantIds.length > 0) {
    const { data: responses } = await supabase
      .from("ai_responses")
      .select("message_id, agent_role, content, order_index")
      .in("message_id", assistantIds)
      .order("order_index", { ascending: true });

    responsesMap = (responses ?? []).reduce(
      (acc: Record<string, unknown[]>, r) => {
        const mid = r.message_id as string;
        if (!acc[mid]) acc[mid] = [];
        acc[mid].push(r);
        return acc;
      },
      {}
    );
  }

  const enrichedMessages = (messages ?? []).map((m) => ({
    ...m,
    responses: m.role === "assistant" ? (responsesMap[m.id as string] ?? []) : undefined,
  }));

  return NextResponse.json({
    ok: true,
    conversation: conv,
    messages: enrichedMessages,
  });
}

// حذف مکالمه
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getAISession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId);

  if (error) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
