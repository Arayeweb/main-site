import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsCap, cmsUnauthorized, cmsNotFound } from '@/lib/cms/requireCms';
import { assertTransition } from '@/lib/cms/articleService';
import { logCmsAudit } from '@/lib/cms/auditLog';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(_req, 'cms.approve');
  if (!session) return cmsUnauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from('cms_articles').select('*').eq('id', params.id).maybeSingle();
    if (!existing) return cmsNotFound();
    const article = existing as CmsArticleRow;

    const err = assertTransition(article.status, 'APPROVED', session.role);
    if (err) return NextResponse.json({ ok: false, error: err }, { status: 400 });

    const { data, error } = await supabase
      .from('cms_articles')
      .update({
        status: 'APPROVED',
        reviewer_id: session.userId,
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
      action: 'article.approve',
      entityType: 'cms_articles',
      entityId: params.id,
    });

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}
