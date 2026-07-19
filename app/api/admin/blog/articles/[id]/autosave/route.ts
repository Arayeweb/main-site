import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized, cmsForbidden, cmsNotFound, cmsConflict } from '@/lib/cms/requireCms';
import { canEditArticle } from '@/lib/cms/permissions';
import type { AdminRole } from '@/lib/auth';
import { parseArticleBody } from '@/lib/cms/articleService';
import { tiptapJsonToHtml, countWordsFromDoc, estimateReadingTime } from '@/lib/cms/renderTiptap';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase.from('cms_articles').select('*').eq('id', params.id).maybeSingle();
    if (!existing) return cmsNotFound();
    const article = existing as CmsArticleRow;
    if (!canEditArticle(session.role as AdminRole, session.userId, article)) return cmsForbidden();

    const clientVersion = body.version !== undefined ? Number(body.version) : null;
    if (clientVersion !== null && clientVersion !== article.version) {
      return cmsConflict('version_conflict');
    }

    const parsed = parseArticleBody(body);
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
    };

    for (const [k, v] of Object.entries(parsed)) {
      if (v !== undefined && k !== 'version' && k !== 'status') updates[k] = v;
    }

    if (parsed.content_json) {
      const wc = countWordsFromDoc(parsed.content_json);
      updates.word_count = wc;
      updates.reading_time = estimateReadingTime(wc);
      updates.rendered_html = tiptapJsonToHtml(parsed.content_json);
    }

    const { data, error } = await supabase
      .from('cms_articles')
      .update({ ...updates, version: article.version + 1 })
      .eq('id', params.id)
      .eq('version', article.version)
      .select('*')
      .maybeSingle();

    if (error) return dbError(error.message);
    if (!data) return cmsConflict('version_conflict');

    return NextResponse.json({ ok: true, article: data, saved_at: new Date().toISOString() });
  } catch (e) {
    return dbError(String(e));
  }
}
