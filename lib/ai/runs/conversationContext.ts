import { getSupabaseAdmin } from "@/lib/supabase";
import type { ChatMessage } from "@/lib/ai/providers/interface";
import { loadRunById, serializeRun } from "./loadRun";
import type { SerializedRun } from "./types";

export const MAX_CONTEXT_TURNS = 6;
export const MAX_CONTEXT_CHARS = 16_000;
export const MAX_CRITIQUE_IN_CONTEXT = 600;

const TERMINAL_STATUSES = new Set(["completed"]);

/** User must own at least one run in the conversation anchor. */
export async function validateConversationAccess(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data: byId } = await supabase
    .from("ai_runs")
    .select("id")
    .eq("user_id", userId)
    .eq("id", conversationId)
    .maybeSingle();
  if (byId) return true;

  const { data: byConversation } = await supabase
    .from("ai_runs")
    .select("id")
    .eq("user_id", userId)
    .eq("conversation_id", conversationId)
    .maybeSingle();
  return !!byConversation;
}

/** Pick the assistant-side content to inject into the next prompt's history. */
export function selectAssistantContent(run: SerializedRun): string {
  if (run.mode === "direct") {
    const answer = run.answers.find((a) => a.content.trim() && !a.errorCode);
    return answer?.content ?? "";
  }

  if (run.mode === "compare") {
    if (run.selectedVote) {
      const voted = run.answers.find((a) => a.model === run.selectedVote);
      if (voted?.content.trim()) return voted.content;
    }
    const first = run.answers.find((a) => a.content.trim() && !a.errorCode);
    return first?.content ?? "";
  }

  if (run.summary?.trim()) return run.summary;
  if (run.critique?.trim() && run.critique.length <= MAX_CRITIQUE_IN_CONTEXT) {
    return run.critique;
  }
  const first = run.answers.find((a) => a.content.trim() && !a.errorCode);
  return first?.content ?? "";
}

function turnCharCount(user: string, assistant: string): number {
  return user.length + assistant.length;
}

/** Build provider history from prior terminal runs in the same conversation. */
export function buildConversationHistory(
  runs: SerializedRun[],
  opts?: { excludeRunId?: string; maxTurns?: number; maxChars?: number }
): ChatMessage[] {
  const maxTurns = opts?.maxTurns ?? MAX_CONTEXT_TURNS;
  const maxChars = opts?.maxChars ?? MAX_CONTEXT_CHARS;

  let eligible = runs
    .filter((r) => TERMINAL_STATUSES.has(r.status) && r.id !== opts?.excludeRunId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  while (eligible.length > maxTurns) {
    eligible = eligible.slice(1);
  }

  while (eligible.length > 1) {
    let chars = 0;
    for (const run of eligible) {
      chars += turnCharCount(run.prompt, selectAssistantContent(run));
    }
    if (chars <= maxChars) break;
    eligible = eligible.slice(1);
  }

  const messages: ChatMessage[] = [];
  for (const run of eligible) {
    const user = run.prompt.trim();
    if (!user) continue;
    const assistant = selectAssistantContent(run);
    messages.push({ role: "user", content: user });
    if (assistant.trim()) {
      messages.push({ role: "assistant", content: assistant });
    }
  }
  return messages;
}

export async function loadConversationRuns(
  userId: string,
  conversationId: string
): Promise<SerializedRun[]> {
  const supabase = getSupabaseAdmin();
  const [{ data: byConversation }, { data: byAnchor }] = await Promise.all([
    supabase
      .from("ai_runs")
      .select("id")
      .eq("user_id", userId)
      .eq("conversation_id", conversationId)
      .in("status", ["completed", "cancelled", "failed", "settlement_failed"])
      .order("created_at", { ascending: true }),
    supabase
      .from("ai_runs")
      .select("id")
      .eq("user_id", userId)
      .eq("id", conversationId)
      .in("status", ["completed", "cancelled", "failed", "settlement_failed"])
      .order("created_at", { ascending: true }),
  ]);

  const ids = [...(byConversation ?? []), ...(byAnchor ?? [])].map((r) => r.id as string);
  const unique = [...new Set(ids)];
  const runs: SerializedRun[] = [];
  for (const id of unique) {
    const bundle = await loadRunById(id);
    if (!bundle || bundle.run.user_id !== userId) continue;
    runs.push(serializeRun(bundle));
  }
  runs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return runs;
}

export async function loadConversationThreadByRunId(
  runId: string,
  userId: string
): Promise<{ conversationId: string; runs: SerializedRun[] } | null> {
  const anchor = await loadRunById(runId);
  if (!anchor || anchor.run.user_id !== userId) return null;
  const conversationId = anchor.run.conversation_id ?? anchor.run.id;
  const runs = await loadConversationRuns(userId, conversationId);
  return { conversationId, runs };
}
