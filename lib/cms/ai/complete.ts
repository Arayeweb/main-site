import { openRouterProvider } from '@/lib/ai/providers/openrouter';
import type { ChatMessage } from '@/lib/ai/providers/interface';
import type { CmsAiSettings } from './types';
import { ANALYSIS_ACTIONS, SHORT_ACTIONS, type CmsAiAction } from './types';

export type CompleteResult =
  | {
      ok: true;
      text: string;
      inputTokens: number;
      outputTokens: number;
      costUsd: number;
      latencyMs: number;
      model: string;
    }
  | { ok: false; error: string };

export function modelForAction(action: CmsAiAction, settings: CmsAiSettings): string {
  if (SHORT_ACTIONS.has(action)) return settings.models.short;
  if (ANALYSIS_ACTIONS.has(action)) return settings.models.analysis;
  return settings.models.long;
}

export async function completeCmsAi(
  action: CmsAiAction,
  system: string,
  user: string,
  settings: CmsAiSettings,
  signal?: AbortSignal,
  modelOverride?: string | null
): Promise<CompleteResult> {
  const model = modelOverride?.trim() || modelForAction(action, settings);
  const maxTokens = Math.min(settings.max_tokens_per_action, 4000);
  const started = Date.now();

  const messages: ChatMessage[] = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  let text = '';
  let inputTokens = 0;
  let outputTokens = 0;
  let costUsd = 0;

  try {
    for await (const ev of openRouterProvider.streamChat({ model, messages, maxTokens }, signal)) {
      if (ev.type === 'delta') text += ev.text;
      if (ev.type === 'error') return { ok: false, error: ev.errorCode };
      if (ev.type === 'done') {
        text = ev.text || text;
        inputTokens = ev.inputTokens;
        outputTokens = ev.outputTokens;
        costUsd = ev.costUsd;
      }
    }
  } catch (e) {
    if ((e as { name?: string })?.name === 'AbortError') return { ok: false, error: 'timeout' };
    return { ok: false, error: 'provider_error' };
  }

  if (!text.trim()) return { ok: false, error: 'empty_response' };

  return {
    ok: true,
    text: text.trim(),
    inputTokens,
    outputTokens,
    costUsd,
    latencyMs: Date.now() - started,
    model,
  };
}
