// =========================================================
// OpenRouter adapter — پیاده‌سازی AIProvider
// منطق streaming از lib/aiEngine.ts مهاجرت کرده و normalize شده:
// deltaها، توکن‌ها، هزینه، TTFT و خطاها همه typed هستند.
// =========================================================

import { Agent } from "undici";
import { getModel, modelRouteId } from "@/lib/aiModels";
import type {
  AIProvider,
  ChatInput,
  CostEstimate,
  ModelStreamEvent,
  ProviderErrorCode,
} from "./interface";

const OPENROUTER_CHAT_API = "https://openrouter.ai/api/v1/chat/completions";

const TRANSIENT_NETWORK_CODES = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_HEADERS_TIMEOUT",
  "UND_ERR_BODY_TIMEOUT",
  "UND_ERR_SOCKET",
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EAI_AGAIN",
]);

function isTransientFetchError(err: unknown): boolean {
  const code = (err as { cause?: { code?: string } })?.cause?.code;
  if (code && TRANSIENT_NETWORK_CODES.has(code)) return true;
  return err instanceof Error && err.message === "fetch failed";
}

function classifyError(err: unknown): ProviderErrorCode {
  if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
  if ((err as { name?: string })?.name === "AbortError") return "cancelled";
  if (isTransientFetchError(err)) return "network_error";
  return "provider_error";
}

function safeLogError(err: unknown): string {
  const code = (err as { cause?: { code?: string }; code?: string })?.cause?.code ??
    (err as { code?: string })?.code;
  if (code) return code;
  if (err instanceof DOMException) return err.name;
  if (err instanceof Error) return err.name;
  return typeof err;
}

let dispatcher: Agent | undefined;

function getDispatcher(): Agent {
  if (!dispatcher) {
    const connectMs = Number(process.env.OPENROUTER_CONNECT_TIMEOUT_MS || 30_000);
    const headersMs = Number(process.env.OPENROUTER_HEADERS_TIMEOUT_MS || 90_000);
    dispatcher = new Agent({
      connect: { timeout: connectMs },
      headersTimeout: headersMs,
      bodyTimeout: 0,
    });
  }
  return dispatcher;
}

function headers(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com",
    "X-Title": "Araaye Arena",
  };
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
  maxAttempts = 3
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetch(url, {
        ...init,
        signal,
        dispatcher: getDispatcher(),
      } as RequestInit & { dispatcher: Agent });
    } catch (err) {
      lastErr = err;
      if (signal?.aborted) throw err;
      const transient = isTransientFetchError(err);
      console.warn(
        `[provider/openrouter] attempt ${attempt}/${maxAttempts} failed:`,
        safeLogError(err)
      );
      if (!transient || attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
  throw lastErr;
}

type OpenRouterStreamChunk = {
  choices?: Array<{ delta?: { content?: string } }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    cost?: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
};

export class OpenRouterProvider implements AIProvider {
  readonly id = "openrouter";

  async *streamChat(
    input: ChatInput,
    signal?: AbortSignal
  ): AsyncIterable<ModelStreamEvent> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      yield { type: "error", errorCode: "provider_error", message: "OPENROUTER_API_KEY not set" };
      return;
    }

    const body: Record<string, unknown> = {
      model: modelRouteId(input.model),
      messages: input.messages,
      max_tokens: input.maxTokens,
      stream: true,
      usage: { include: true },
    };
    if (input.temperature != null) body.temperature = input.temperature;
    if (input.webSearch) {
      body.plugins = [{ id: "web", engine: "exa", max_results: 5 }];
    }

    const startedAt = Date.now();
    let res: Response;
    try {
      res = await fetchWithRetry(
        OPENROUTER_CHAT_API,
        {
          method: "POST",
          headers: headers(apiKey),
          body: JSON.stringify(body),
        },
        signal
      );
    } catch (err) {
      yield {
        type: "error",
        errorCode: classifyError(err),
        message: "provider_request_failed",
      };
      return;
    }

    if (!res.ok) {
      await res.text().catch(() => "");
      yield {
        type: "error",
        errorCode: res.status === 429 ? "rate_limited" : "provider_error",
        message: `openrouter_http_${res.status}`,
      };
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      yield { type: "error", errorCode: "stream_unavailable", message: "no response body" };
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let inputTokens = 0;
    let outputTokens = 0;
    let cachedTokens = 0;
    let costUsd = 0;
    let ttftMs: number | null = null;
    let completed = false;

    try {
      while (true) {
        if (signal?.aborted) {
          yield { type: "error", errorCode: "cancelled", message: "cancelled" };
          return;
        }
        const { done, value } = await reader.read();
        if (done) {
          completed = true;
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;

          let json: OpenRouterStreamChunk;
          try {
            json = JSON.parse(payload) as OpenRouterStreamChunk;
          } catch {
            continue; // partial chunk
          }

          const delta = json.choices?.[0]?.delta?.content;
          if (delta) {
            if (ttftMs === null) ttftMs = Date.now() - startedAt;
            content += delta;
            yield { type: "delta", text: delta };
          }
          const usage = json.usage;
          if (usage) {
            if (usage.prompt_tokens != null) inputTokens = usage.prompt_tokens;
            if (usage.completion_tokens != null) outputTokens = usage.completion_tokens;
            if (usage.prompt_tokens_details?.cached_tokens != null) {
              cachedTokens = usage.prompt_tokens_details.cached_tokens;
            }
            if (usage.cost != null) costUsd = usage.cost;
            // fallback: بعضی مدل‌ها فقط total_tokens می‌دهند
            if (
              usage.prompt_tokens == null &&
              usage.completion_tokens == null &&
              usage.total_tokens != null
            ) {
              outputTokens = usage.total_tokens;
            }
          }
        }
      }
    } catch (err) {
      yield {
        type: "error",
        errorCode: classifyError(err),
        message: "provider_stream_failed",
      };
      return;
    } finally {
      if (!completed) {
        await reader.cancel().catch(() => {});
      }
      reader.releaseLock?.();
    }

    yield {
      type: "done",
      text: content,
      inputTokens,
      outputTokens,
      cachedTokens,
      costUsd,
      ttftMs,
      latencyMs: Date.now() - startedAt,
    };
  }

  async estimateCost(input: ChatInput): Promise<CostEstimate> {
    const m = getModel(input.model);
    const per1k = m?.estCostPer1kTokens ?? 0.005;
    // برآورد خام: ورودی از روی طول متن، خروجی = maxTokens
    const inputChars = input.messages.reduce((sum, msg) => {
      if (typeof msg.content === "string") return sum + msg.content.length;
      return (
        sum +
        msg.content.reduce(
          (s, p) => s + (p.type === "text" ? p.text.length : 0),
          0
        )
      );
    }, 0);
    const estTokens = Math.ceil(inputChars / 3.5) + input.maxTokens;
    return { estimatedUsd: (estTokens / 1000) * per1k };
  }
}

export const openRouterProvider = new OpenRouterProvider();
