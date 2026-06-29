import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { verifyAIToken } from "@/lib/aiAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import ChatClient from "./ChatClient";

interface ConvMessage {
  id: string;
  role: string;
  content: string;
  responses?: Array<{
    agent_role: string;
    content: string;
    order_index: number;
  }>;
}

export default async function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const token = cookieStore.get("ary_ai_session")?.value;
  const session = verifyAIToken(token);
  if (!session) return null;

  const supabase = getSupabaseAdmin();

  // بررسی مالکیت مکالمه
  const { data: conv } = await supabase
    .from("ai_conversations")
    .select("id, title, mode")
    .eq("id", params.id)
    .eq("user_id", session.userId)
    .maybeSingle();

  if (!conv) notFound();

  // پیام‌ها
  const { data: messages } = await supabase
    .from("ai_messages")
    .select("id, role, content")
    .eq("conversation_id", params.id)
    .order("created_at", { ascending: true });

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
    id: m.id as string,
    role: m.role as "user" | "assistant",
    content: m.content as string,
    responses:
      m.role === "assistant"
        ? ((responsesMap[m.id as string] ?? []) as Array<{
            agent_role: string;
            content: string;
            order_index: number;
          }>)
        : undefined,
  }));

  return (
    <ChatClient
      conversationId={conv.id as string}
      initialMessages={enrichedMessages}
      initialMode={(conv.mode as "quick" | "brainstorm" | "critique") ?? "quick"}
      initialTitle={(conv.title as string) ?? ""}
    />
  );
}
