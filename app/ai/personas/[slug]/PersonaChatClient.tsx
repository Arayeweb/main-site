"use client";

import PersonaChatView from "../../PersonaChatView";
import type { AiPersona } from "@/lib/aiPersonas";
import type { ChatTurn } from "../../DirectChatView";
import { useArenaAuth } from "../../ArenaAuthContext";

export default function PersonaChatClient({
  persona,
  modelId,
  threadId,
  initialTurns,
  bootstrapPrompt = null,
}: {
  persona: AiPersona;
  modelId: string;
  threadId: string | null;
  initialTurns: ChatTurn[];
  bootstrapPrompt?: string | null;
  plan?: string;
  authed?: boolean;
}) {
  const { authed, plan, setCredits } = useArenaAuth();

  return (
    <PersonaChatView
      persona={persona}
      modelId={modelId}
      threadId={threadId}
      initialTurns={initialTurns}
      bootstrapPrompt={bootstrapPrompt}
      plan={plan}
      guestMode={!authed}
      onCreditsChange={setCredits}
    />
  );
}
