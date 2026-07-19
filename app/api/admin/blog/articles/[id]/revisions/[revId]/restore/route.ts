import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsCap, cmsUnauthorized, cmsNotFound } from '@/lib/cms/requireCms';
import { logCmsAudit } from '@/lib/cms/auditLog';
import type { CmsArticleRow } from '@/lib/cms/types';
import { EMPTY_DOC } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string; revId: string } };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(_req, 'cms.restore_revision');
  if (!session) return cmsUnauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data: rev } = await supabase
      .from('cms_article_revisions')
      .select('*')
      .eq('id', params.revId)
      .eq('article_id', params.id)
      .maybeSingle();
    if (!rev) return cmsNotFound();

    const snapshot = rev.snapshot_json as CmsArticleRow;
    const { data: current } = await supabase.from('cms_articles').select('*').eq('id', params.id).maybeSingle();
    if (!current) return cmsNotFound();

    const { data, error } = await supabase
      .from('cms_articles')
      .update({
        title: snapshot.title,
        excerpt: snapshot.excerpt,
        content_json: snapshot.content_json ?? EMPTY_DOC,
        seo_title: snapshot.seo_title,
        seo_description: snapshot.seo_description,
        status: 'DRAFT',
        updated_at: new Date().toISOString(),
        updated_by: session.userId,
        version: (current as CmsArticleRow).version + 1,
      })
      .eq('id', params.id)
      .select('*')
      .single();
    if (error) return dbError(error.message);

    await logCmsAudit(supabase, {
      actorId: session.userId,
      action: 'article.restore_revision',
      entityType: 'cms_articles',
      entityId: params.id,
      metadata: { revision_id: params.revId, version: rev.version },
    });

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}
