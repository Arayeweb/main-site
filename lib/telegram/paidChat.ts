// =========================================================
// Paid Direct chat — lightweight Telegram path with credit settle
// =========================================================

import { randomUUID } from "crypto";
import type { ChatMessage } from "@/lib/ai/providers/interface";
import { openRouterProvider } from "@/lib/ai/providers/openrouter";
import { getModel } from "@/lib/aiModels";
import { creditsForModel } from "@/lib/ai/usage/estimate";
import { prepareRunAndReserveCredits } from "@/lib/billing/credits";
import { settleRun } from "@/lib/ai/usage/settle";
import { directSystemPrompt } from "@/lib/ai/prompts/direct";
import { getTelegramConfig } from "./config";
import type { ChatContextEntry } from "./types";

export type PaidChatResult =
  | {
      ok: true;
      text: string;
      runId: string;
      creditsRemaining?: number;
      providerTtftMs: number | null;
      providerTotalMs: number;
      promptTokens: number;
      completionTokens: number;
      timeoutUsed: number;
      providerName: "openrouter";
    }
  | { ok: false; error: string };

function historyToMessages(history: ChatContextEntry[]): ChatMessage[] {
  return history.slice(-4).map((h) => ({ role: h.role, content: h.content }));
}

export async function runPaidDirectChat(opts: {
  araayeUserId: string;
  prompt: string;
  history: ChatContextEntry[];
  modelId?: string;
}): Promise<PaidChatResult> {
  const modelId = opts.modelId || "economy";
  const { freeChatTimeoutMs } = getTelegramConfig();
  const timeoutMs = Math.min(Math.max(freeChatTimeoutMs, 8_000), 12_000);
  const model = getModel(modelId);
  if (!model) return { ok: false, error: "invalid_model" };
  const reservedCredits = creditsForModel(model);
  const runId = randomUUID();
  const prep = await prepareRunAndReserveCredits({
    userId: opts.araayeUserId,
    runId,
    mode: "direct",
    conversationId: runId,
    reservedCredits,
    metadata: { source: "telegram_direct", modelId, prompt: opts.prompt.slice(0, 1000) },
  });
  if (!prep.ok) {
    return { ok: false, error: prep.error };
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  const startedAt = Date.now();
  let text = "";
  let ttftMs: number | null = null;
  let promptTokens = 0;
  let completionTokens = 0;
  let creditsRemaining: number | undefined;
  let succeeded = false;

  try {
    const messages: ChatMessage[] = [
      {
        role: "system",
        content: `${directSystemPrompt({ webSearch: false })}\n\nجواب‌ها کوتاه، کاربردی و مستقیم باشند.`,
      },
      ...historyToMessages(opts.history),
      { role: "user", content: opts.prompt },
    ];

    for await (const ev of openRouterProvider.streamChat(
      {
        model: modelId,
        messages,
        maxTokens: model.tier === "economy" ? 450 : 600,
        webSearch: false,
      },
      ac.signal
    )) {
      if (ev.type === "delta") text += ev.text;
      if (ev.type === "error") return { ok: false, error: ev.errorCode };
      if (ev.type === "done") {
        text = ev.text || text;
        ttftMs = ev.ttftMs ?? null;
        promptTokens = ev.inputTokens || 0;
        completionTokens = ev.outputTokens || 0;
        succeeded = true;
      }
    }
  } catch {
    if (ac.signal.aborted) return { ok: false, error: "timeout" };
    return { ok: false, error: "provider_error" };
  } finally {
    clearTimeout(timer);
    const settled = await settleRun(opts.araayeUserId, runId, reservedCredits, [
      { model: modelId, credits: reservedCredits, succeeded },
    ]);
    if (settled.ok) creditsRemaining = settled.creditsRemaining ?? undefined;
  }

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  return {
    ok: true,
    text: trimmed,
    runId,
    creditsRemaining,
    providerTtftMs: ttftMs,
    providerTotalMs: Date.now() - startedAt,
    promptTokens,
    completionTokens,
    timeoutUsed: timeoutMs,
    providerName: "openrouter",
  };
}
