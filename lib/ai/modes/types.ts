// =========================================================
// Typeهای مشترک modeها — نتیجه هر تماس مدل برای persistence و تسویه.
// =========================================================

import type { AIProvider, ChatMessage } from "@/lib/ai/providers/interface";
import type { RunSSEEvent } from "@/lib/ai/streaming/sse";

export type CallRole = "answer" | "critique" | "synthesis";

export type ModeCallResult = {
  model: string;
  provider: string;
  role: CallRole;
  text: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  reasoningTokens: number;
  costUsd: number;
  extraCredits?: number;
  ttftMs: number | null;
  latencyMs: number;
  errorCode: string | null;
  succeeded: boolean;
};

export type ModeContext = {
  runId: string;
  provider: AIProvider;
  /** پیام‌های گفتگو (system + history + user) بدون system prompt مود */
  history: ChatMessage[];
  prompt: string;
  imageUrls: string[];
  webSearch: boolean;
  answerSurchargeCredits: number;
  personaSystem?: string;
  maxTokens: number;
  signal: AbortSignal;
  /** هر تماس تمام‌شده (موفق یا ناموفق) اینجا گزارش می‌شود */
  onCallComplete: (result: ModeCallResult) => void;
};

export type ModeGenerator = AsyncGenerator<RunSSEEvent, void, unknown>;
