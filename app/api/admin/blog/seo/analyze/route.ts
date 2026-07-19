import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized } from '@/lib/cms/requireCms';
import { runSeoGuard, publishReadiness } from '@/lib/cms/seo/guard';
import { checkCannibalization } from '@/lib/cms/seo/cannibalization';
import { suggestInternalLinks } from '@/lib/cms/seo/internalLinks';
import { extractHeadingTexts, tiptapJsonToText } from '@/lib/cms/ai/articleText';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();

  const articleId = str(req.nextUrl.searchParams.get('article_id'), 64);
  if (!articleId) {
    return NextResponse.json({ ok: false, error: 'missing_article_id' }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: article, error } = await supabase
      .from('cms_articles')
      .select('*')
      .eq('id', articleId)
      .maybeSingle();
    if (error) return dbError(error.message);
    if (!article) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const row = article as CmsArticleRow;
    const issues = runSeoGuard(row);
    const readiness = publishReadiness(issues);

    const { data: others } = await supabase
      .from('cms_articles')
      .select('id, title, slug, primary_keyword, search_intent')
      .in('status', ['PUBLISHED', 'APPROVED', 'SCHEDULED']);

    const cannibalization = checkCannibalization({
      primaryKeyword: row.primary_keyword,
      title: row.title,
      slug: row.slug,
      searchIntent: row.search_intent,
      excludeArticleId: row.id,
      articles: others ?? [],
    });

    const doc = row.content_json as Record<string, unknown>;
    const internalLinks = suggestInternalLinks({
      articleText: tiptapJsonToText(doc),
      headings: extractHeadingTexts(doc),
      publishedArticles: (others ?? []).map((a) => ({
        slug: a.slug as string,
        title: a.title as string,
        primary_keyword: (a.primary_keyword as string) ?? '',
      })),
    });

    return NextResponse.json({
      ok: true,
      issues,
      readiness,
      cannibalization,
      internal_links: internalLinks,
    });
  } catch (e) {
    return dbError(String(e));
  }
}
