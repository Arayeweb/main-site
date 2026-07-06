// =========================================================
// Provider abstraction — Araaye AI orchestration
// همه providerها (OpenRouter, OpenAI, Anthropic, …) این interface را
// پیاده‌سازی می‌کنند تا orchestrator مستقل از provider باشد.
// =========================================================

export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string | ChatContentPart[];
};

export type ChatInput = {
  /** شناسه داخلی مدل (aiModels) — adapter خودش routeId را resolve می‌کند */
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  webSearch?: boolean;
  temperature?: number;
};

export type ProviderErrorCode =
  | "network_error"
  | "provider_error"
  | "rate_limited"
  | "timeout"
  | "cancelled"
  | "stream_unavailable";

/** رویدادهای normalize‌شده‌ی stream یک مدل — مستقل از فرمت provider */
export type ModelStreamEvent =
  | { type: "delta"; text: string }
  | {
      type: "done";
      text: string;
      inputTokens: number;
      outputTokens: number;
      cachedTokens: number;
      costUsd: number;
      ttftMs: number | null;
      latencyMs: number;
    }
  | { type: "error"; errorCode: ProviderErrorCode; message: string };

export type CostEstimate = {
  /** برآورد هزینه provider به دلار (تقریبی، قبل از اجرا) */
  estimatedUsd: number;
};

export interface AIProvider {
  /** 'openrouter' | 'openai' | 'anthropic' | 'google' | 'deepseek' */
  id: string;
  /**
   * یک تماس chat استریمی. هرگز throw نمی‌کند —
   * خطاها به‌صورت event با type:"error" برمی‌گردند و iterable تمام می‌شود.
   */
  streamChat(input: ChatInput, signal?: AbortSignal): AsyncIterable<ModelStreamEvent>;
  estimateCost(input: ChatInput): Promise<CostEstimate>;
}
