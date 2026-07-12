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
  plan: planProp = "free",
  authed: serverAuthed = false,
}: {
  persona: AiPersona;
  modelId: string;
  threadId: string | null;
  initialTurns: ChatTurn[];
  bootstrapPrompt?: string | null;
  plan?: string;
  authed?: boolean;
}) {
  const { authed: ctxAuthed, plan: ctxPlan, setCredits } = useArenaAuth();
  const authed = ctxAuthed ?? serverAuthed;
  const plan = ctxPlan || planProp;

  return (
    <PersonaChatView
      persona={persona}
      modelId={modelId}
      threadId={threadId}
      initialTurns={initialTurns}
      bootstrapPrompt={bootstrapPrompt}
      plan={plan}
      guestMode={authed !== true}
      onCreditsChange={setCredits}
    />
  );
}
