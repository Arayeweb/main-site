// =========================================================
// Free trial Direct chat — economy model, no credit charge
// =========================================================

import { directSystemPrompt } from "@/lib/ai/prompts/direct";
import { openRouterProvider } from "@/lib/ai/providers/openrouter";
import type { ChatMessage } from "@/lib/ai/providers/interface";
import { getTelegramConfig } from "./config";
import type { ChatContextEntry } from "./types";

export type FreeChatResult =
  | { ok: true; text: string }
  | { ok: false; error: "timeout" | "provider_error" | "empty" };

export async function runFreeDirectChat(
  prompt: string,
  history: ChatContextEntry[]
): Promise<FreeChatResult> {
  const { freeChatMaxTokens, freeChatTimeoutMs } = getTelegramConfig();
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), freeChatTimeoutMs);

  const messages: ChatMessage[] = [
    { role: "system", content: directSystemPrompt({ webSearch: false }) },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user", content: prompt },
  ];

  let text = "";
  try {
    for await (const ev of openRouterProvider.streamChat(
      {
        model: "economy",
        messages,
        maxTokens: freeChatMaxTokens,
        webSearch: false,
      },
      ac.signal
    )) {
      if (ev.type === "delta") text += ev.text;
      if (ev.type === "error") {
        clearTimeout(timer);
        return { ok: false, error: "provider_error" };
      }
      if (ev.type === "done") text = ev.text || text;
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
  return { ok: true, text: trimmed };
}
