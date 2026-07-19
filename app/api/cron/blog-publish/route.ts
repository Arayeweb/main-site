import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { publishArticle } from '@/lib/cms/articleService';
import { revalidateArticle } from '@/lib/cms/revalidateBlog';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CRON_SECRET = process.env.CMS_CRON_SECRET || process.env.TELEGRAM_CRON_SECRET;

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  const { data: due, error } = await supabase
    .from('cms_articles')
    .select('*')
    .eq('status', 'SCHEDULED')
    .lte('scheduled_at', now);

  if (error) {
    return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
  }

  const results: { id: string; slug: string; ok: boolean; error?: string }[] = [];

  for (const row of due ?? []) {
    const article = row as CmsArticleRow;
    const result = await publishArticle(supabase, article, 'system', 'admin');
    if (result.ok) {
      await revalidateArticle(result.article.slug);
      results.push({ id: article.id, slug: article.slug, ok: true });
    } else {
      results.push({ id: article.id, slug: article.slug, ok: false, error: result.error });
    }
  }

  return NextResponse.json({ ok: true, published: results.filter((r) => r.ok).length, results });
}
