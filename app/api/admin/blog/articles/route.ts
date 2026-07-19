import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str, isMissingTableError } from '@/lib/adminRouteHelpers';
import {
  requireCmsCap,
  requireCmsSession,
  cmsUnauthorized,
  cmsForbidden,
} from '@/lib/cms/requireCms';
import { buildArticleInsert, parseArticleBody } from '@/lib/cms/articleService';
import { logCmsAudit } from '@/lib/cms/auditLog';
import { validateArticleForPublish, seoHealthLabel } from '@/lib/cms/articleValidation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();
  if (!requireCmsCap(req, 'cms.read')) return cmsForbidden();

  const sp = req.nextUrl.searchParams;
  const status = str(sp.get('status'), 32);
  const categoryId = str(sp.get('category_id'), 64);
  const authorId = str(sp.get('author_id'), 64);
  const search = str(sp.get('q'), 200);
  const sort = str(sp.get('sort'), 32) ?? 'updated_at';
  const page = Math.max(1, Number(sp.get('page') ?? 1));
  const limit = Math.min(50, Math.max(1, Number(sp.get('limit') ?? 20)));
  const offset = (page - 1) * limit;

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('cms_articles')
      .select('*, cms_categories(name, slug), cms_authors(display_name)', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (categoryId) query = query.eq('category_id', categoryId);
    if (authorId) query = query.eq('author_id', authorId);
    if (search) {
      query = query.or(`title.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    const ascending = sort === 'title';
    const sortCol = sort === 'published_at' ? 'published_at' : sort === 'title' ? 'title' : 'updated_at';
    query = query.order(sortCol, { ascending, nullsFirst: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      if (isMissingTableError(error.message)) {
        return NextResponse.json({ ok: true, articles: [], total: 0, migration_required: true });
      }
      return dbError(error.message);
    }

    const articles = (data ?? []).map((row) => {
      const issues = validateArticleForPublish(row);
      return { ...row, seo_health: seoHealthLabel(issues) };
    });

    return NextResponse.json({
      ok: true,
      articles,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  const session = requireCmsCap(req, 'cms.create');
  if (!session) return cmsUnauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const parsed = parseArticleBody(body);
  const row = buildArticleInsert(parsed, session.userId);

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('cms_articles').insert(row).select('*').single();
    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: false, error: 'duplicate_slug' }, { status: 422 });
      }
      return dbError(error.message);
    }

    await logCmsAudit(supabase, {
      actorId: session.userId,
      action: 'article.create',
      entityType: 'cms_articles',
      entityId: data.id,
    });

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}
