"use client";

import { useState } from "react";
import VideoStudioView, { type VideoTurn } from "../../VideoStudioView";

export default function VideoStudioClient({
  threadId,
  initialTurns,
  plan: initialPlan,
}: {
  threadId: string;
  initialTurns: VideoTurn[];
  plan: string;
}) {
  const [plan] = useState(initialPlan);

  return (
    <VideoStudioView
      threadId={threadId}
      initialTurns={initialTurns}
      plan={plan}
      onCreditsChange={() => window.dispatchEvent(new Event("ai:refresh"))}
    />
  );
}
