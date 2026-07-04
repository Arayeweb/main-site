"use client";

import { useArenaAuth } from "../ArenaAuthContext";
import CodeStudioView from "../CodeStudioView";

export default function CodeStudioPageInner({
  bootstrapPrompt = null,
}: {
  bootstrapPrompt?: string | null;
}) {
  const auth = useArenaAuth();
  const plan = auth?.plan ?? "free";

  return (
    <div className="ar-main--chat">
      <CodeStudioView
        plan={plan}
        bootstrapPrompt={bootstrapPrompt}
        onCreditsChange={() => window.dispatchEvent(new Event("ai:refresh"))}
      />
    </div>
  );
}
