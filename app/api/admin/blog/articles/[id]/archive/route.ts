import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsCap, cmsUnauthorized, cmsNotFound } from '@/lib/cms/requireCms';
import { logCmsAudit } from '@/lib/cms/auditLog';
import { revalidateArticle } from '@/lib/cms/revalidateBlog';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(_req, 'cms.archive');
  if (!session) return cmsUnauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from('cms_articles').select('*').eq('id', params.id).maybeSingle();
    if (!existing) return cmsNotFound();
    const article = existing as CmsArticleRow;

    const { data, error } = await supabase
      .from('cms_articles')
      .update({ status: 'ARCHIVED', updated_at: new Date().toISOString(), updated_by: session.userId })
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) return dbError(error.message);

    await logCmsAudit(supabase, {
      actorId: session.userId,
      action: 'article.archive',
      entityType: 'cms_articles',
      entityId: params.id,
    });

    if (article.status === 'PUBLISHED') {
      await revalidateArticle(article.slug);
    }

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}
