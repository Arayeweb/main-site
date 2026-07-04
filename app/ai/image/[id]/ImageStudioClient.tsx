"use client";

import { useState } from "react";
import ImageStudioView, { type ImageTurn } from "../../ImageStudioView";

export default function ImageStudioClient({
  threadId,
  initialTurns,
  plan: initialPlan,
}: {
  threadId: string;
  initialTurns: ImageTurn[];
  plan: string;
}) {
  const [plan, setPlan] = useState(initialPlan);

  return (
    <ImageStudioView
      threadId={threadId}
      initialTurns={initialTurns}
      plan={plan}
      onCreditsChange={() => window.dispatchEvent(new Event("ai:refresh"))}
    />
  );
}
