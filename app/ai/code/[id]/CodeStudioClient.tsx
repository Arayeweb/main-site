"use client";

import CodeStudioView from "../../CodeStudioView";
import type { CodeTurn } from "@/lib/hooks/useCodeStudio";
import type { CodeFileMap } from "@/lib/codeStudio";

export default function CodeStudioClient({
  threadId,
  initialTurns,
  initialFiles,
  initialActiveFile,
  plan,
}: {
  threadId: string;
  initialTurns: CodeTurn[];
  initialFiles: CodeFileMap;
  initialActiveFile: string;
  plan: string;
}) {
  return (
    <div className="ar-main--chat">
      <CodeStudioView
        threadId={threadId}
        initialTurns={initialTurns}
        initialFiles={initialFiles}
        initialActiveFile={initialActiveFile}
        plan={plan}
        onCreditsChange={() => window.dispatchEvent(new Event("ai:refresh"))}
      />
    </div>
  );
}
