import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str } from '@/lib/adminRouteHelpers';
import {
  requireCmsCap,
  requireCmsSession,
  cmsUnauthorized,
  cmsForbidden,
  cmsNotFound,
  cmsConflict,
} from '@/lib/cms/requireCms';
import { canEditArticle } from '@/lib/cms/permissions';
import type { AdminRole } from '@/lib/auth';
import {
  parseArticleBody,
  handleSlugChange,
  createRevisionSnapshot,
} from '@/lib/cms/articleService';
import { tiptapJsonToHtml, countWordsFromDoc, estimateReadingTime } from '@/lib/cms/renderTiptap';
import { logCmsAudit } from '@/lib/cms/auditLog';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();
  if (!requireCmsCap(req, 'cms.read')) return cmsForbidden();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('cms_articles')
      .select('*, cms_categories(*), cms_authors(*)')
      .eq('id', params.id)
      .maybeSingle();
    if (error) return dbError(error.message);
    if (!data) return cmsNotFound();

    let article = data as Record<string, unknown>;
    if (data.featured_image_id) {
      const { data: img } = await supabase
        .from('cms_media_assets')
        .select('id, url, alt_text, file_name')
        .eq('id', data.featured_image_id)
        .maybeSingle();
      if (img) article = { ...article, featured_image: img };
    }

    return NextResponse.json({ ok: true, article });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
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
    const { data: existing, error: fetchErr } = await supabase
      .from('cms_articles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
    if (fetchErr) return dbError(fetchErr.message);
    if (!existing) return cmsNotFound();

    const article = existing as CmsArticleRow;
    if (!canEditArticle(session.role as AdminRole, session.userId, article)) {
      return cmsForbidden();
    }

    const clientVersion = body.version !== undefined ? Number(body.version) : null;
    if (clientVersion !== null && clientVersion !== article.version) {
      return cmsConflict('version_conflict');
    }

    const parsed = parseArticleBody(body);
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: session.userId,
      version: article.version + 1,
    };

    for (const [k, v] of Object.entries(parsed)) {
      if (v !== undefined && k !== 'version') updates[k] = v;
    }

    if (parsed.content_json) {
      const wc = countWordsFromDoc(parsed.content_json);
      updates.word_count = wc;
      updates.reading_time = estimateReadingTime(wc);
      updates.rendered_html = tiptapJsonToHtml(parsed.content_json);
    }

    if (parsed.slug && parsed.slug !== article.slug && article.status === 'PUBLISHED') {
      await handleSlugChange(supabase, article.id, article.slug, parsed.slug);
    }

    const { data, error } = await supabase
      .from('cms_articles')
      .update(updates)
      .eq('id', params.id)
      .eq('version', article.version)
      .select('*')
      .maybeSingle();

    if (error) return dbError(error.message);
    if (!data) return cmsConflict('version_conflict');

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = requireCmsCap(req, 'cms.archive');
  if (!session) return cmsUnauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const { data: existing } = await supabase
      .from('cms_articles')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();
    if (!existing) return cmsNotFound();

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

    return NextResponse.json({ ok: true, article: data });
  } catch (e) {
    return dbError(String(e));
  }
}
