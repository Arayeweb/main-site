// =========================================================
// حالت Direct — یک مدل، یک پاسخ. سریع‌ترین و ارزان‌ترین mode.
// =========================================================

import type { ChatMessage } from "@/lib/ai/providers/interface";
import { directSystemPrompt } from "@/lib/ai/prompts/direct";
import { sanitizeProviderError } from "@/lib/ai/safety/moderation";
import type { ModeContext, ModeGenerator } from "./types";

export function buildUserContent(
  text: string,
  imageUrls: string[]
): ChatMessage["content"] {
  if (imageUrls.length === 0) return text;
  return [
    { type: "text" as const, text },
    ...imageUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url },
    })),
  ];
}

export async function* runDirectMode(
  ctx: ModeContext,
  modelId: string
): ModeGenerator {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: directSystemPrompt({
        personaSystem: ctx.personaSystem,
        webSearch: ctx.webSearch,
      }),
    },
    ...ctx.history,
    { role: "user", content: buildUserContent(ctx.prompt, ctx.imageUrls) },
  ];

  yield {
    type: "model_started",
    runId: ctx.runId,
    model: modelId,
    provider: ctx.provider.id,
  };

  let text = "";
  let failed = false;

  for await (const ev of ctx.provider.streamChat(
    { model: modelId, messages, maxTokens: ctx.maxTokens, webSearch: ctx.webSearch },
    ctx.signal
  )) {
    if (ctx.signal.aborted) return;
    if (ev.type === "delta") {
      text += ev.text;
      yield { type: "model_delta", runId: ctx.runId, model: modelId, text: ev.text };
    } else if (ev.type === "done") {
      ctx.onCallComplete({
        model: modelId,
        provider: ctx.provider.id,
        role: "answer",
        text: ev.text,
        inputTokens: ev.inputTokens,
        outputTokens: ev.outputTokens,
        cachedTokens: ev.cachedTokens,
        costUsd: ev.costUsd,
        ttftMs: ev.ttftMs,
        latencyMs: ev.latencyMs,
        errorCode: null,
        succeeded: true,
      });
      yield {
        type: "model_done",
        runId: ctx.runId,
        model: modelId,
        inputTokens: ev.inputTokens,
        outputTokens: ev.outputTokens,
        ttftMs: ev.ttftMs,
        latencyMs: ev.latencyMs,
      };
    } else {
      failed = true;
      const safeCode = sanitizeProviderError(ev.errorCode, ev.message, `direct/${modelId}`);
      ctx.onCallComplete({
        model: modelId,
        provider: ctx.provider.id,
        role: "answer",
        text,
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        costUsd: 0,
        ttftMs: null,
        latencyMs: 0,
        errorCode: safeCode,
        succeeded: false,
      });
      yield {
        type: "model_error",
        runId: ctx.runId,
        model: modelId,
        errorCode: safeCode,
        message: "", // پیام فارسی سمت route از friendlyError ساخته می‌شود
      };
    }
  }

  if (failed) return;
}
