import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CMS_AI_SETTINGS, type CmsAiSettings } from './types';

export async function getCmsSettings(supabase: SupabaseClient): Promise<CmsAiSettings> {
  const { data } = await supabase.from('cms_settings').select('data').eq('id', 1).maybeSingle();
  if (!data?.data || typeof data.data !== 'object') return DEFAULT_CMS_AI_SETTINGS;
  return { ...DEFAULT_CMS_AI_SETTINGS, ...(data.data as Partial<CmsAiSettings>) };
}

export async function saveCmsSettings(
  supabase: SupabaseClient,
  patch: Partial<CmsAiSettings>
): Promise<CmsAiSettings> {
  const current = await getCmsSettings(supabase);
  const next = { ...current, ...patch };
  await supabase
    .from('cms_settings')
    .upsert({ id: 1, data: next, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  return next;
}

const rateBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(userId: string, limitPerMinute: number): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (bucket.count >= limitPerMinute) return false;
  bucket.count += 1;
  return true;
}

export async function getDailyAiSpendUsd(supabase: SupabaseClient): Promise<number> {
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { data } = await supabase
    .from('cms_ai_usage_logs')
    .select('estimated_cost')
    .gte('created_at', since.toISOString());
  return (data ?? []).reduce((sum, r) => sum + Number(r.estimated_cost ?? 0), 0);
}

export async function logAiUsage(
  supabase: SupabaseClient,
  row: {
    articleId?: string | null;
    userId: string;
    action: string;
    model: string;
    promptVersion: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    latencyMs: number;
    success: boolean;
    errorCode?: string | null;
  }
) {
  await supabase.from('cms_ai_usage_logs').insert({
    article_id: row.articleId ?? null,
    user_id: row.userId,
    action: row.action,
    model: row.model,
    prompt_version: row.promptVersion,
    input_tokens: row.inputTokens,
    output_tokens: row.outputTokens,
    estimated_cost: row.estimatedCost,
    latency_ms: row.latencyMs,
    success: row.success,
    error_code: row.errorCode ?? null,
  });
}
