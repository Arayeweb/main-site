import { getSupabaseAdmin } from '@/lib/supabase';
import type { CmsArticleRow } from '../types';

export type CmsArticleView = CmsArticleRow & {
  author?: { display_name: string; slug: string; job_title?: string } | null;
  featured_image?: { url: string; alt_text: string } | null;
  category?: { name: string; slug: string } | null;
};

async function hydrateArticle(row: CmsArticleRow): Promise<CmsArticleView> {
  const supabase = getSupabaseAdmin();
  const view: CmsArticleView = { ...row };

  if (row.author_id) {
    const { data } = await supabase.from('cms_authors').select('display_name, slug, job_title').eq('id', row.author_id).maybeSingle();
    view.author = data;
  }
  if (row.featured_image_id) {
    const { data } = await supabase.from('cms_media_assets').select('url, alt_text').eq('id', row.featured_image_id).maybeSingle();
    view.featured_image = data;
  }
  if (row.category_id) {
    const { data } = await supabase.from('cms_categories').select('name, slug').eq('id', row.category_id).maybeSingle();
    view.category = data;
  }
  return view;
}

export async function getPublishedArticleBySlug(slug: string): Promise<CmsArticleView | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('cms_articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'PUBLISHED')
    .maybeSingle();
  if (error || !data) return null;
  return hydrateArticle(data as CmsArticleRow);
}

export async function getArticleByIdForPreview(id: string): Promise<CmsArticleView | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('cms_articles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return hydrateArticle(data as CmsArticleRow);
}

export async function getArticleById(id: string): Promise<CmsArticleRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from('cms_articles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return data as CmsArticleRow;
}

export async function getSlugRedirect(sourcePath: string): Promise<{ destination_path: string; status_code: number } | null> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('cms_slug_redirects')
    .select('destination_path, status_code')
    .eq('source_path', sourcePath)
    .maybeSingle();
  return data;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from('cms_articles')
    .select('slug')
    .eq('status', 'PUBLISHED');
  return (data ?? []).map((r) => r.slug as string);
}
