import type { SupabaseClient } from '@supabase/supabase-js';
import { systemPromptForAction, userPromptForAction, PROMPT_VERSION } from './prompts';
import { completeCmsAi } from './complete';
import {
  getCmsSettings,
  checkRateLimit,
  getDailyAiSpendUsd,
  logAiUsage,
} from './settings';
import type { CmsAiAction, CmsAiMode } from './types';

const STRICT_JSON_ACTIONS = new Set<CmsAiAction>([
  'content_brief',
  'outline',
  'seo_analysis',
  'seo_titles',
  'seo_descriptions',
  'generate_faq',
]);
import {
  parseAiJson,
  ContentBriefSchema,
  SeoAnalysisSchema,
  OutlineSchema,
  TextResultSchema,
  TitleVariantsSchema,
  DescriptionVariantsSchema,
  FaqSuggestionSchema,
} from './schemas';
import { tiptapJsonToText } from './articleText';

export type AiRunInput = {
  action: CmsAiAction;
  mode: CmsAiMode;
  articleId?: string;
  userId: string;
  title: string;
  excerpt: string;
  primaryKeyword: string;
  searchIntent?: string;
  contentJson: Record<string, unknown>;
  selection?: string;
  modelOverride?: string | null;
};

export type AiRunOutput =
  | { ok: true; action: CmsAiAction; result: unknown; rawText: string; model: string; tokens: { in: number; out: number }; costUsd: number }
  | { ok: false; error: string };

function parseResult(action: CmsAiAction, raw: string): unknown | null {
  if (action === 'content_brief') return parseAiJson(raw, ContentBriefSchema);
  if (action === 'outline') return parseAiJson(raw, OutlineSchema);
  if (action === 'seo_analysis') return parseAiJson(raw, SeoAnalysisSchema);
  if (action === 'seo_titles') return parseAiJson(raw, TitleVariantsSchema);
  if (action === 'seo_descriptions') return parseAiJson(raw, DescriptionVariantsSchema);
  if (action === 'generate_faq') return parseAiJson(raw, FaqSuggestionSchema);
  const text = parseAiJson(raw, TextResultSchema);
  if (text) return text;
  const plain = raw.replace(/```json|```/g, '').trim();
  return plain ? { text: plain } : null;
}

export async function runCmsAiAction(
  supabase: SupabaseClient,
  input: AiRunInput,
  signal?: AbortSignal
): Promise<AiRunOutput> {
  const settings = await getCmsSettings(supabase);
  if (!settings.ai_enabled) return { ok: false, error: 'ai_disabled' };
  if (!settings.enabled_actions.includes(input.action)) return { ok: false, error: 'action_disabled' };

  if (!checkRateLimit(input.userId, settings.rate_limit_per_minute)) {
    return { ok: false, error: 'rate_limited' };
  }

  const spent = await getDailyAiSpendUsd(supabase);
  if (spent >= settings.daily_budget_usd) return { ok: false, error: 'budget_exceeded' };

  const articleText = tiptapJsonToText(input.contentJson);
  const system = systemPromptForAction(input.action);
  const user = userPromptForAction(input.action, {
    title: input.title,
    excerpt: input.excerpt,
    primaryKeyword: input.primaryKeyword,
    selection: input.selection,
    articleText,
  });

  const completed = await completeCmsAi(
    input.action,
    system,
    user,
    settings,
    signal,
    input.modelOverride
  );
  if (!completed.ok) {
    if (settings.logging_enabled) {
      await logAiUsage(supabase, {
        articleId: input.articleId,
        userId: input.userId,
        action: input.action,
        model: settings.fallback_model,
        promptVersion: PROMPT_VERSION,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        latencyMs: 0,
        success: false,
        errorCode: completed.error,
      });
    }
    return { ok: false, error: completed.error };
  }

  const parsed = parseResult(input.action, completed.text);
  if (parsed === null) {
    return { ok: false, error: STRICT_JSON_ACTIONS.has(input.action) ? 'invalid_json' : 'empty_response' };
  }

  if (settings.logging_enabled) {
    await logAiUsage(supabase, {
      articleId: input.articleId,
      userId: input.userId,
      action: input.action,
      model: completed.model,
      promptVersion: PROMPT_VERSION,
      inputTokens: completed.inputTokens,
      outputTokens: completed.outputTokens,
      estimatedCost: completed.costUsd,
      latencyMs: completed.latencyMs,
      success: true,
    });
  }

  return {
    ok: true,
    action: input.action,
    result: parsed,
    rawText: completed.text,
    model: completed.model,
    tokens: { in: completed.inputTokens, out: completed.outputTokens },
    costUsd: completed.costUsd,
  };
}
