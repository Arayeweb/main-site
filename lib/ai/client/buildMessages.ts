/** Build OpenAI-style messages from chat turns for /api/ai/runs. */
export type ChatTurnLike = {
  id: string;
  prompt: string;
  response: string;
  streaming?: boolean;
};

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
