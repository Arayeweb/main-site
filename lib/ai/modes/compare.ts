// =========================================================
// حالت Compare — دو مدل موازی، stream همزمان.
// اگر یکی fail شود دیگری ادامه می‌دهد (refund تماس ناموفق در settle).
// =========================================================

import type { ChatMessage } from "@/lib/ai/providers/interface";
import { compareSystemPrompt } from "@/lib/ai/prompts/compare";
import { multiplex } from "@/lib/ai/streaming/multiplexer";
import { sanitizeProviderError } from "@/lib/ai/safety/moderation";
import { buildUserContent } from "./direct";
import type { ModeContext, ModeGenerator } from "./types";

export async function* runCompareMode(
  ctx: ModeContext,
  modelIds: [string, string]
): ModeGenerator {
  const messages: ChatMessage[] = [
    { role: "system", content: compareSystemPrompt({ webSearch: ctx.webSearch }) },
    ...ctx.history,
    { role: "user", content: buildUserContent(ctx.prompt, ctx.imageUrls) },
  ];

  for (const model of modelIds) {
    yield { type: "model_started", runId: ctx.runId, model, provider: ctx.provider.id };
  }

  const collected = new Map<string, string>(modelIds.map((m) => [m, ""]));

  const streams = modelIds.map(
    (model) =>
      [
        model,
        ctx.provider.streamChat(
          { model, messages, maxTokens: ctx.maxTokens, webSearch: ctx.webSearch },
          ctx.signal
        ),
      ] as [string, AsyncIterable<import("@/lib/ai/providers/interface").ModelStreamEvent>]
  );

  for await (const { model, event } of multiplex(streams)) {
    if (ctx.signal.aborted) return;
    if (event.type === "delta") {
      collected.set(model, (collected.get(model) ?? "") + event.text);
      yield { type: "model_delta", runId: ctx.runId, model, text: event.text };
    } else if (event.type === "done") {
      ctx.onCallComplete({
        model,
        provider: ctx.provider.id,
        role: "answer",
        text: event.text,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        cachedTokens: event.cachedTokens,
        reasoningTokens: event.reasoningTokens ?? 0,
        costUsd: event.costUsd,
        extraCredits: ctx.answerSurchargeCredits,
        ttftMs: event.ttftMs,
        latencyMs: event.latencyMs,
        errorCode: null,
        succeeded: true,
      });
      yield {
        type: "model_done",
        runId: ctx.runId,
        model,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        ttftMs: event.ttftMs,
        latencyMs: event.latencyMs,
      };
    } else {
      const safeCode = sanitizeProviderError(event.errorCode, event.message, `compare/${model}`);
      ctx.onCallComplete({
        model,
        provider: ctx.provider.id,
        role: "answer",
        text: collected.get(model) ?? "",
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        reasoningTokens: 0,
        costUsd: 0,
        ttftMs: null,
        latencyMs: 0,
        errorCode: safeCode,
        succeeded: false,
      });
      yield {
        type: "model_error",
        runId: ctx.runId,
        model,
        errorCode: safeCode,
        message: "",
      };
    }
  }
}
