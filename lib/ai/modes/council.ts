// =========================================================
// حالت Council («همفکری AIها») — سه فاز:
//   ۱) چند مدل موازی پاسخ می‌دهند
//   ۲) moderator اختلاف‌ها را نقد می‌کند
//   ۳) moderator سنتز نهایی (قوی‌ترین خروجی) را می‌سازد
// اگر یک مدل fail شود، شورا با بقیه ادامه می‌دهد.
// =========================================================

import type { ChatMessage, ModelStreamEvent } from "@/lib/ai/providers/interface";
import { COUNCIL_MEMBER_SYSTEM_PROMPT } from "@/lib/ai/prompts/council";
import {
  CRITIQUE_SYSTEM_PROMPT,
  SYNTHESIS_SYSTEM_PROMPT,
  buildCritiqueUserMessage,
  buildSynthesisUserMessage,
} from "@/lib/ai/prompts/moderator";
import { multiplex } from "@/lib/ai/streaming/multiplexer";
import { sanitizeProviderError } from "@/lib/ai/safety/moderation";
import { modelName } from "@/lib/aiModels";
import { buildUserContent } from "./direct";
import type { CallRole, ModeContext, ModeGenerator } from "./types";

/** مدل moderator شورا — به کاربر افشا نمی‌شود */
export const COUNCIL_MODERATOR_MODEL = "precise";

const CRITIQUE_MAX_TOKENS = 700;
const SYNTHESIS_MAX_TOKENS = 1400;

export async function* runCouncilMode(
  ctx: ModeContext,
  memberModelIds: string[]
): ModeGenerator {
  // ---------- فاز ۱: پاسخ موازی اعضا ----------
  const memberMessages: ChatMessage[] = [
    { role: "system", content: COUNCIL_MEMBER_SYSTEM_PROMPT },
    ...ctx.history,
    { role: "user", content: buildUserContent(ctx.prompt, ctx.imageUrls) },
  ];

  for (const model of memberModelIds) {
    yield { type: "model_started", runId: ctx.runId, model, provider: ctx.provider.id };
  }

  const answers = new Map<string, string>();
  const collected = new Map<string, string>(memberModelIds.map((m) => [m, ""]));

  const streams = memberModelIds.map(
    (model) =>
      [
        model,
        ctx.provider.streamChat(
          { model, messages: memberMessages, maxTokens: ctx.maxTokens, webSearch: ctx.webSearch },
          ctx.signal
        ),
      ] as [string, AsyncIterable<ModelStreamEvent>]
  );

  for await (const { model, event } of multiplex(streams)) {
    if (ctx.signal.aborted) return;
    if (event.type === "delta") {
      collected.set(model, (collected.get(model) ?? "") + event.text);
      yield { type: "model_delta", runId: ctx.runId, model, text: event.text };
    } else if (event.type === "done") {
      answers.set(model, event.text);
      ctx.onCallComplete({
        model,
        provider: ctx.provider.id,
        role: "answer",
        text: event.text,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        cachedTokens: event.cachedTokens,
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
      const safeCode = sanitizeProviderError(event.errorCode, event.message, `council/${model}`);
      ctx.onCallComplete({
        model,
        provider: ctx.provider.id,
        role: "answer",
        text: collected.get(model) ?? "",
        inputTokens: 0,
        outputTokens: 0,
        cachedTokens: 0,
        costUsd: 0,
        ttftMs: null,
        latencyMs: 0,
        errorCode: safeCode,
        succeeded: false,
      });
      yield { type: "model_error", runId: ctx.runId, model, errorCode: safeCode, message: "" };
    }
  }

  // حداقل یک پاسخ لازم است تا نقد/سنتز معنا داشته باشد
  if (answers.size === 0 || ctx.signal.aborted) return;

  const answerList = Array.from(answers.entries()).map(([model, text], i) => ({
    label: `${i + 1} (${modelName(model)})`,
    text,
  }));

  // ---------- فاز ۲ و ۳: نقد و سنتز با moderator ----------
  const moderatorPhase = async function* (
    role: Extract<CallRole, "critique" | "synthesis">,
    systemPrompt: string,
    userMessage: string,
    maxTokens: number
  ): AsyncGenerator<{ delta?: string; final?: string; failed?: boolean }> {
    let text = "";
    for await (const ev of ctx.provider.streamChat(
      {
        model: COUNCIL_MODERATOR_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        maxTokens,
      },
      ctx.signal
    )) {
      if (ev.type === "delta") {
        text += ev.text;
        yield { delta: ev.text };
      } else if (ev.type === "done") {
        ctx.onCallComplete({
          model: COUNCIL_MODERATOR_MODEL,
          provider: ctx.provider.id,
          role,
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
        yield { final: ev.text };
      } else {
        const safeCode = sanitizeProviderError(ev.errorCode, ev.message, `council/${role}`);
        ctx.onCallComplete({
          model: COUNCIL_MODERATOR_MODEL,
          provider: ctx.provider.id,
          role,
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
        yield { failed: true };
      }
    }
  };

  // فاز ۲: نقد
  yield { type: "critique_started", runId: ctx.runId };
  let critique = "";
  let critiqueFailed = false;
  for await (const step of moderatorPhase(
    "critique",
    CRITIQUE_SYSTEM_PROMPT,
    buildCritiqueUserMessage(ctx.prompt, answerList),
    CRITIQUE_MAX_TOKENS
  )) {
    if (ctx.signal.aborted) return;
    if (step.delta) yield { type: "critique_delta", runId: ctx.runId, text: step.delta };
    if (step.final != null) critique = step.final;
    if (step.failed) critiqueFailed = true;
  }

  // فاز ۳: سنتز — حتی اگر نقد fail شده باشد، با نقد خالی ادامه می‌دهیم
  if (critiqueFailed) critique = "(نقد در دسترس نیست)";

  yield { type: "summary_started", runId: ctx.runId };
  for await (const step of moderatorPhase(
    "synthesis",
    SYNTHESIS_SYSTEM_PROMPT,
    buildSynthesisUserMessage(ctx.prompt, answerList, critique),
    SYNTHESIS_MAX_TOKENS
  )) {
    if (ctx.signal.aborted) return;
    if (step.delta) yield { type: "summary_delta", runId: ctx.runId, text: step.delta };
  }
}
