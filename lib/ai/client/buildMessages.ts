import { MAX_CRITIQUE_IN_CONTEXT } from "@/lib/ai/runs/conversationContext";

/** Build OpenAI-style messages from chat turns for /api/ai/runs. */
export type ChatTurnLike = {
  id: string;
  prompt: string;
  response: string;
  streaming?: boolean;
};

/** Compare / council turn shape for client-side history fallback. */
export type MultiModelTurnLike = {
  id?: string;
  prompt: string;
  responses?: Record<string, string>;
  answers?: Record<string, string>;
  summary?: string | null;
  critique?: string | null;
  selectedVote?: string | null;
  modelIds?: string[];
};

/** Mirror server `selectAssistantContent` for multi-model sessions. */
export function selectAssistantForTurn(turn: MultiModelTurnLike): string {
  const responses = turn.responses ?? turn.answers ?? {};
  const modelIds = turn.modelIds ?? Object.keys(responses);

  if (turn.selectedVote) {
    const voted = responses[turn.selectedVote];
    if (voted?.trim()) return voted;
  }

  if (turn.summary?.trim()) return turn.summary;

  if (turn.critique?.trim() && turn.critique.length <= MAX_CRITIQUE_IN_CONTEXT) {
    return turn.critique;
  }

  for (const id of modelIds) {
    const content = responses[id];
    if (content?.trim()) return content;
  }

  return "";
}

/** Prior turns only — current prompt is sent separately via `prompt`. */
export function buildMultiModelRunMessages(
  priorTurns: MultiModelTurnLike[]
): { role: "user" | "assistant"; content: string }[] {
  const chatTurns: ChatTurnLike[] = priorTurns.map((t, i) => ({
    id: t.id ?? `turn-${i}`,
    prompt: t.prompt,
    response: selectAssistantForTurn(t),
  }));
  return buildRunMessages(chatTurns, "");
}

export function buildRunMessages(
  priorTurns: ChatTurnLike[],
  userPrompt: string,
  opts?: { excludeTurnId?: string }
): { role: "user" | "assistant"; content: string }[] {
  const messages: { role: "user" | "assistant"; content: string }[] = [];

  for (const t of priorTurns) {
    if (t.id.startsWith("tmp-")) continue;
    if (opts?.excludeTurnId && t.id === opts.excludeTurnId) continue;
    if (!t.prompt.trim()) continue;
    messages.push({ role: "user", content: t.prompt });
    if (t.response.trim()) {
      messages.push({ role: "assistant", content: t.response });
    }
  }

  if (userPrompt.trim()) {
    messages.push({ role: "user", content: userPrompt });
  }

  return messages;
}
