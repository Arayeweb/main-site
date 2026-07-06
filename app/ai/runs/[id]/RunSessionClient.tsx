"use client";

import Link from "next/link";
import DirectChatView from "../../DirectChatView";
import CompareSessionView from "../../CompareSessionView";
import CouncilSessionView from "../../CouncilSessionView";
import type { ThreadHydration } from "@/lib/ai/runs/types";
import { runStreamErrorMessage } from "@/lib/ai/client/runStream";

export default function RunSessionClient({
  thread,
  statusMessage,
}: {
  thread: ThreadHydration;
  statusMessage?: string | null;
}) {
  const latest = thread.runs[thread.runs.length - 1];
  const banner =
    statusMessage ||
    (latest.status === "cancelled"
      ? runStreamErrorMessage("cancelled")
      : latest.status === "failed" || latest.status === "settlement_failed"
        ? runStreamErrorMessage("provider_error")
        : null);

  return (
    <div className="ar-main--chat">
      {banner && latest.status !== "completed" && (
        <div className="ar-composer-err ar-run-status-banner">{banner}</div>
      )}
      {latest.mode === "direct" ? (
        <DirectChatView
          modelId={latest.models[0] ?? "economy"}
          threadId={thread.conversationId}
          initialTurns={thread.runs.map((r) => ({
            id: r.runId,
            prompt: r.prompt,
            response:
              r.answers[r.models[0] ?? ""] ?? Object.values(r.answers)[0] ?? "",
          }))}
        />
      ) : latest.mode === "compare" ? (
        <CompareSessionView
          conversationId={thread.conversationId}
          threadRuns={thread.runs}
          modelAId={latest.models[0]}
          modelBId={latest.models[1]}
        />
      ) : (
        <CouncilSessionView
          conversationId={thread.conversationId}
          threadRuns={thread.runs}
          modelAId={latest.models[0]}
          modelBId={latest.models[1]}
        />
      )}
      <div className="ar-run-back-link">
        <Link href="/ai">گفتگوی جدید</Link>
      </div>
    </div>
  );
}
