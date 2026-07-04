"use client";

import { useState } from "react";
import AudioStudioView, { type AudioTurn } from "../../AudioStudioView";

export default function AudioStudioClient({
  threadId,
  initialTurns,
  plan: initialPlan,
}: {
  threadId: string;
  initialTurns: AudioTurn[];
  plan: string;
}) {
  const [plan] = useState(initialPlan);

  return (
    <AudioStudioView
      threadId={threadId}
      initialTurns={initialTurns}
      plan={plan}
      onCreditsChange={() => window.dispatchEvent(new Event("ai:refresh"))}
    />
  );
}
