import type { SupabaseClient } from '@supabase/supabase-js';
import { str, num, bool } from '@/lib/adminRouteHelpers';
import type { CmsArticleRow, CmsArticleStatus } from './types';
import { CMS_STATUSES } from './types';
import { toPersianSafeSlug, blogArticlePath, normalizeRedirectPath, wouldCreateRedirectLoop } from './slugUtils';
import { tiptapJsonToHtml, countWordsFromDoc, estimateReadingTime } from './renderTiptap';
import { logCmsAudit } from './auditLog';
import { canTransition } from './articleStatus';
import { hasCmsCapability, type CmsCapability } from './permissions';
import type { AdminRole } from '@/lib/auth';
import { validateArticleForPublish, hasCriticalIssues } from './articleValidation';

export function parseArticleBody(body: Record<string, unknown>) {
  const status = str(body.status, 32) as CmsArticleStatus | null;
  const contentJson = body.content_json && typeof body.content_json === 'object'
    ? (body.content_json as Record<string, unknown>)
    : undefined;

  const wordCount = contentJson ? countWordsFromDoc(contentJson) : undefined;

  return {
    title: str(body.title, 500),
    slug: str(body.slug, 200),
    excerpt: str(body.excerpt, 2000),
    content_json: contentJson,
    status: status && CMS_STATUSES.includes(status) ? status : undefined,
    category_id: str(body.category_id, 64),
    author_id: str(body.author_id, 64),
    reviewer_id: str(body.reviewer_id, 64),
    featured_image_id: str(body.featured_image_id, 64),
    primary_keyword: str(body.primary_keyword, 200),
    secondary_keywords: Array.isArray(body.secondary_keywords)
      ? body.secondary_keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 20)
      : undefined,
    search_intent: str(body.search_intent, 200),
    seo_title: str(body.seo_title, 200),
    seo_description: str(body.seo_description, 500),
    canonical_url: str(body.canonical_url, 500),
    robots_index: body.robots_index !== undefined ? bool(body.robots_index) : undefined,
    robots_follow: body.robots_follow !== undefined ? bool(body.robots_follow) : undefined,
    og_title: str(body.og_title, 200),
    og_description: str(body.og_description, 500),
    og_image_id: str(body.og_image_id, 64),
    schema_type: str(body.schema_type, 64),
    primary_cta_label: str(body.primary_cta_label, 200),
    primary_cta_url: str(body.primary_cta_url, 500),
    primary_landing_page: str(body.primary_landing_page, 500),
    scheduled_at: str(body.scheduled_at, 64),
    published_at: str(body.published_at, 64),
    word_count: wordCount,
    reading_time: wordCount !== undefined ? estimateReadingTime(wordCount) : undefined,
    version: body.version !== undefined ? num(body.version) : undefined,
  };
}

export async function createRevisionSnapshot(
  supabase: SupabaseClient,
  article: CmsArticleRow,
  userId: string,
  changeSummary: string
) {
  const { data: latest } = await supabase
    .from('cms_article_revisions')
    .select('version')
    .eq('article_id', article.id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version ?? 0) + 1;
  await supabase.from('cms_article_revisions').insert({
    article_id: article.id,
    version: nextVersion,
    snapshot_json: article,
    change_summary: changeSummary,
    created_by: userId,
  });
}

export async function handleSlugChange(
  supabase: SupabaseClient,
  articleId: string,
  oldSlug: string,
  newSlug: string
) {
  if (oldSlug === newSlug) return;
  const source = normalizeRedirectPath(blogArticlePath(oldSlug));
  const dest = normalizeRedirectPath(blogArticlePath(newSlug));
  if (wouldCreateRedirectLoop(source, dest)) return;

  await supabase.from('cms_slug_redirects').upsert(
    {
      source_path: source,
      destination_path: dest,
      status_code: 301,
      article_id: articleId,
    },
    { onConflict: 'source_path' }
  );
}

export function assertTransition(
  from: CmsArticleStatus,
  to: CmsArticleStatus,
  role: AdminRole
): string | null {
  const ok = canTransition(from, to, (cap) => hasCmsCapability(role, cap as CmsCapability));
  return ok ? null : 'invalid_transition';
}

export async function publishArticle(
  supabase: SupabaseClient,
  article: CmsArticleRow,
  userId: string,
  role: AdminRole
): Promise<{ ok: true; article: CmsArticleRow } | { ok: false; error: string; issues?: ReturnType<typeof validateArticleForPublish> }> {
  const transitionErr = assertTransition(article.status, 'PUBLISHED', role);
  if (transitionErr) return { ok: false, error: transitionErr };

  const issues = validateArticleForPublish(article);
  if (hasCriticalIssues(issues)) return { ok: false, error: 'validation_failed', issues };

  await createRevisionSnapshot(supabase, article, userId, 'publish');

  const now = new Date().toISOString();
  const rendered = tiptapJsonToHtml(article.content_json);

  const { data, error } = await supabase
    .from('cms_articles')
    .update({
      status: 'PUBLISHED',
      published_at: article.published_at ?? now,
      rendered_html: rendered,
      updated_at: now,
      updated_by: userId,
      version: article.version + 1,
    })
    .eq('id', article.id)
    .select('*')
    .single();

  if (error || !data) return { ok: false, error: 'db_error' };

  await logCmsAudit(supabase, {
    actorId: userId,
    action: 'article.publish',
    entityType: 'cms_articles',
    entityId: article.id,
    metadata: { slug: article.slug },
  });

  return { ok: true, article: data as CmsArticleRow };
}

export function buildArticleInsert(
  parsed: ReturnType<typeof parseArticleBody>,
  userId: string
) {
  const title = parsed.title ?? 'پیش‌نویس بدون عنوان';
  const slug = parsed.slug ?? toPersianSafeSlug(title);
  const content = parsed.content_json ?? { type: 'doc', content: [{ type: 'paragraph' }] };
  const wordCount = parsed.word_count ?? countWordsFromDoc(content);

  return {
    title,
    slug,
    excerpt: parsed.excerpt ?? '',
    content_json: content,
    status: 'DRAFT' as const,
    category_id: parsed.category_id,
    author_id: parsed.author_id,
    primary_keyword: parsed.primary_keyword ?? '',
    secondary_keywords: parsed.secondary_keywords ?? [],
    search_intent: parsed.search_intent ?? '',
    seo_title: parsed.seo_title ?? title,
    seo_description: parsed.seo_description ?? '',
    word_count: wordCount,
    reading_time: estimateReadingTime(wordCount),
    created_by: userId,
    updated_by: userId,
  };
}
