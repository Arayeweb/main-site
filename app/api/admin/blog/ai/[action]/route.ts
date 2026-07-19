import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str } from '@/lib/adminRouteHelpers';
import { requireCmsCap, cmsUnauthorized } from '@/lib/cms/requireCms';
import { runCmsAiAction } from '@/lib/cms/ai/runAction';
import type { CmsAiAction, CmsAiMode } from '@/lib/cms/ai/types';
import { DEFAULT_CMS_AI_SETTINGS } from '@/lib/cms/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED = new Set(DEFAULT_CMS_AI_SETTINGS.enabled_actions);

type Ctx = { params: { action: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(req, 'cms.ai_use');
  if (!session) return cmsUnauthorized();

  const action = params.action as CmsAiAction;
  if (!ALLOWED.has(action)) {
    return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 55_000);

  try {
    const result = await runCmsAiAction(
      getSupabaseAdmin(),
      {
        action,
        mode: (str(body.mode, 32) as CmsAiMode) ?? 'article',
        articleId: str(body.article_id, 64) ?? undefined,
        userId: session.userId,
        title: str(body.title, 500) ?? '',
        excerpt: str(body.excerpt, 2000) ?? '',
        primaryKeyword: str(body.primary_keyword, 200) ?? '',
        searchIntent: str(body.search_intent, 200) ?? '',
        contentJson: (body.content_json as Record<string, unknown>) ?? {},
        selection: str(body.selection, 8000) ?? undefined,
        modelOverride: str(body.model, 64),
      },
      ac.signal
    );
    clearTimeout(timer);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.error === 'rate_limited' ? 429 : 422 });
    }

    return NextResponse.json({
      ok: true,
      action: result.action,
      result: result.result,
      raw_text: result.rawText,
      model: result.model,
      tokens: result.tokens,
      cost_usd: result.costUsd,
    });
  } catch (e) {
    clearTimeout(timer);
    return dbError(String(e));
  }
}
