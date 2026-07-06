// =========================================================
// Paid Direct chat via prepareRun — uses Araaye credit system
// =========================================================

import { prepareRun } from "@/lib/ai/orchestrator";
import type { ChatMessage } from "@/lib/ai/providers/interface";
import { getAraayePlan } from "./accounts";
import type { ChatContextEntry } from "./types";

export type PaidChatResult =
  | { ok: true; text: string; runId: string; creditsRemaining?: number }
  | { ok: false; error: string };

function historyToMessages(history: ChatContextEntry[]): ChatMessage[] {
  return history.map((h) => ({ role: h.role, content: h.content }));
}

export async function runPaidDirectChat(opts: {
  araayeUserId: string;
  prompt: string;
  history: ChatContextEntry[];
}): Promise<PaidChatResult> {
  const plan = await getAraayePlan(opts.araayeUserId);
  const prep = await prepareRun({
    userId: opts.araayeUserId,
    plan,
    mode: "direct",
    prompt: opts.prompt,
    models: ["economy"],
    conversationId: null,
    history: historyToMessages(opts.history),
    webSearch: false,
  });

  if ("error" in prep) {
    return { ok: false, error: prep.error };
  }

  const ac = new AbortController();
  let text = "";
  let runId = "";
  let creditsRemaining: number | undefined;

  try {
    for await (const ev of prep.execute(ac.signal)) {
      if (ev.type === "run_started") runId = ev.runId;
      if (ev.type === "model_delta") text += ev.text;
      if (ev.type === "usage_update") creditsRemaining = ev.creditsRemaining;
      if (ev.type === "run_error") {
        return { ok: false, error: ev.errorCode };
      }
    }
  } catch {
    return { ok: false, error: "provider_error" };
  } finally {
    await prep.cleanup();
  }

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  return { ok: true, text: trimmed, runId, creditsRemaining };
}
