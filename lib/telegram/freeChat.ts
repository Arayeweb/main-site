// =========================================================
// Free trial Direct chat — economy model, no credit charge
// =========================================================

import { telegramSystemPrompt } from "./prompts";
import { openRouterProvider } from "@/lib/ai/providers/openrouter";
import type { ChatMessage } from "@/lib/ai/providers/interface";
import { getTelegramConfig } from "./config";
import type { ChatContextEntry } from "./types";

export type FreeChatResult =
  | {
      ok: true;
      text: string;
      providerTtftMs: number | null;
      providerTotalMs: number;
      promptTokens: number;
      completionTokens: number;
      providerModelId: string;
      providerName: "openrouter";
      timeoutUsed: number;
    }
  | { ok: false; error: "timeout" | "provider_error" | "empty" };

function toShortPrompt(): string {
  return telegramSystemPrompt();
}

function trimHistory(history: ChatContextEntry[], maxMessages = 4): ChatContextEntry[] {
  return history.slice(-maxMessages);
}

export async function runFreeDirectChat(
  prompt: string,
  history: ChatContextEntry[],
  modelId = "economy",
  onDelta?: (fullText: string) => void
): Promise<FreeChatResult> {
  const { freeChatMaxTokens, freeChatTimeoutMs } = getTelegramConfig();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), freeChatTimeoutMs);
  const startedAt = Date.now();

  const messages: ChatMessage[] = [
    { role: "system", content: toShortPrompt() },
    ...trimHistory(history).map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: prompt },
  ];

  let text = "";
  let providerTtftMs: number | null = null;
  let promptTokens = 0;
  let completionTokens = 0;
  try {
    for await (const ev of openRouterProvider.streamChat(
      {
        model: modelId,
        messages,
        maxTokens: freeChatMaxTokens,
        webSearch: false,
      },
      ac.signal
    )) {
      if (ev.type === "delta") {
        text += ev.text;
        onDelta?.(text);
      }
      if (ev.type === "error") {
        clearTimeout(timer);
        return { ok: false, error: "provider_error" };
      }
      if (ev.type === "done") {
        text = ev.text || text;
        providerTtftMs = ev.ttftMs ?? null;
        promptTokens = ev.inputTokens || 0;
        completionTokens = ev.outputTokens || 0;
      }
    }
  } catch (e) {
    clearTimeout(timer);
    if (ac.signal.aborted) return { ok: false, error: "timeout" };
    return { ok: false, error: "provider_error" };
  } finally {
    clearTimeout(timer);
  }

  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: "empty" };
  return {
    ok: true,
    text: trimmed,
    providerTtftMs,
    providerTotalMs: Date.now() - startedAt,
    promptTokens,
    completionTokens,
    providerModelId: modelId,
    providerName: "openrouter",
    timeoutUsed: freeChatTimeoutMs,
  };
}
