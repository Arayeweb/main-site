"use client";

import { useArenaAuth } from "../../ArenaAuthContext";
import MusicStudioView from "../../MusicStudioView";
import type { MusicTurn } from "../../MusicStudioView";

export default function MusicStudioClient({
  threadId,
  initialTurns,
  plan,
}: {
  threadId: string;
  initialTurns: MusicTurn[];
  plan: string;
}) {
  const { setCredits } = useArenaAuth();
  return (
    <MusicStudioView
      threadId={threadId}
      initialTurns={initialTurns}
      plan={plan}
      onCreditsChange={setCredits}
    />
  );
}
