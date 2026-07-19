import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized } from '@/lib/cms/requireCms';
import { suggestInternalLinks } from '@/lib/cms/seo/internalLinks';
import { extractHeadingTexts, tiptapJsonToText } from '@/lib/cms/ai/articleText';

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
    const { data: article } = await supabase.from('cms_articles').select('*').eq('id', articleId).maybeSingle();
    if (!article) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const { data: published } = await supabase
      .from('cms_articles')
      .select('slug, title, primary_keyword')
      .eq('status', 'PUBLISHED');

    const doc = article.content_json as Record<string, unknown>;
    const suggestions = suggestInternalLinks({
      articleText: tiptapJsonToText(doc),
      headings: extractHeadingTexts(doc),
      publishedArticles: published ?? [],
    });

    return NextResponse.json({ ok: true, suggestions });
  } catch (e) {
    return dbError(String(e));
  }
}
