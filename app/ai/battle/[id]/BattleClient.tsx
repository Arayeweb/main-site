"use client";

import DirectChatView from "../../DirectChatView";
import CompareSessionView from "../../CompareSessionView";

type PublicModel = { id: string; name: string; brand: string };
type Winner = "a" | "b" | "tie";
type Turn = { id: string; prompt: string; response: string };

export default function BattleClient({
  battleId,
  threadId,
  mode,
  prompt,
  responseA,
  responseB,
  winner: initialWinner,
  modelA: initialModelA,
  modelB: initialModelB,
  turns: initialTurns,
}: {
  battleId: string;
  threadId: string;
  mode: "battle" | "side_by_side" | "direct";
  prompt: string;
  responseA: string;
  responseB: string;
  winner: Winner | null;
  modelA: PublicModel | null;
  modelB: PublicModel | null;
  turns?: Turn[];
}) {
  if (mode === "direct" && initialModelA) {
    return (
      <div className="ar-main--chat">
        <DirectChatView
          modelId={initialModelA.id}
          threadId={threadId}
          initialTurns={initialTurns || [{ id: battleId, prompt, response: responseA }]}
        />
      </div>
    );
  }

  return (
    <div className="ar-main--chat">
      <CompareSessionView
        mode={mode === "side_by_side" ? "side_by_side" : "battle"}
        battleId={battleId}
        prompt={prompt}
        responseA={responseA}
        responseB={responseB}
        modelA={initialModelA}
        modelB={initialModelB}
        winner={initialWinner}
      />
    </div>
  );
}
