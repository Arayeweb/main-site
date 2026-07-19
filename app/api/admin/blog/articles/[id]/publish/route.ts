import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsCap, cmsUnauthorized, cmsNotFound } from '@/lib/cms/requireCms';
import { publishArticle } from '@/lib/cms/articleService';
import { revalidateArticle } from '@/lib/cms/revalidateBlog';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(req, 'cms.publish');
  if (!session) return cmsUnauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from('cms_articles').select('*').eq('id', params.id).maybeSingle();
    if (!existing) return cmsNotFound();

    const result = await publishArticle(supabase, existing as CmsArticleRow, session.userId, session.role);
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, issues: result.issues },
        { status: result.error === 'validation_failed' ? 422 : 400 }
      );
    }

    await revalidateArticle(result.article.slug);

    return NextResponse.json({ ok: true, article: result.article });
  } catch (e) {
    return dbError(String(e));
  }
}
