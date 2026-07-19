import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str } from '@/lib/adminRouteHelpers';
import { requireCmsCap, cmsUnauthorized, cmsNotFound } from '@/lib/cms/requireCms';
import { assertTransition, createRevisionSnapshot } from '@/lib/cms/articleService';
import { logCmsAudit } from '@/lib/cms/auditLog';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(req, 'cms.schedule');
  if (!session) return cmsUnauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const scheduledAt = str(body.scheduled_at, 64);
  if (!scheduledAt) {
    return NextResponse.json({ ok: false, error: 'missing_scheduled_at' }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from('cms_articles').select('*').eq('id', params.id).maybeSingle();
    if (!existing) return cmsNotFound();
    const article = existing as CmsArticleRow;

    const err = assertTransition(article.status, 'SCHEDULED', session.role);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

    const { data, error } = await supabase
      .from('cms_articles')
      .update({
        status: 'SCHEDULED',
        scheduled_at: new Date(scheduledAt).toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
        version: article.version + 1,
      })
      .eq('id', params.id)
      .select('*')
      .single();

    if (error) return dbError(error.message);

    await logCmsAudit(supabase, {
      actorId: session.userId,
      action: 'article.schedule',
      entityType: 'cms_articles',
      entityId: params.id,
      metadata: { scheduled_at: scheduledAt },
    });

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}
