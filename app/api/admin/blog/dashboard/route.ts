import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized } from '@/lib/cms/requireCms';
import { runSeoGuard } from '@/lib/cms/seo/guard';
import { getDailyAiSpendUsd } from '@/lib/cms/ai/settings';
import type { CmsArticleRow } from '@/lib/cms/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();

  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [drafts, inReview, scheduled, publishedMonth, articles, aiLogs, aiSpend] = await Promise.all([
      supabase.from('cms_articles').select('id', { count: 'exact', head: true }).eq('status', 'DRAFT'),
      supabase.from('cms_articles').select('id', { count: 'exact', head: true }).eq('status', 'IN_REVIEW'),
      supabase.from('cms_articles').select('id', { count: 'exact', head: true }).eq('status', 'SCHEDULED'),
      supabase
        .from('cms_articles')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'PUBLISHED')
        .gte('published_at', monthStart),
      supabase.from('cms_articles').select('*').order('updated_at', { ascending: false }).limit(50),
      supabase
        .from('cms_ai_usage_logs')
        .select('success, estimated_cost')
        .gte('created_at', monthStart),
      getDailyAiSpendUsd(supabase),
    ]);

    const seoCritical: { id: string; title: string; slug: string }[] = [];
    const missingLinks: { id: string; title: string }[] = [];
    const stale: { id: string; title: string }[] = [];
    const staleCutoff = Date.now() - 180 * 86400000;

    for (const row of articles.data ?? []) {
      const art = row as CmsArticleRow;
      const issues = runSeoGuard(art);
      if (issues.some((i) => i.level === 'critical')) {
        seoCritical.push({ id: art.id, title: art.title, slug: art.slug });
      }
      if (issues.some((i) => i.code === 'no_internal_links')) {
        missingLinks.push({ id: art.id, title: art.title });
      }
      if (art.status === 'PUBLISHED' && art.updated_at && new Date(art.updated_at).getTime() < staleCutoff) {
        stale.push({ id: art.id, title: art.title });
      }
    }

    const logs = aiLogs.data ?? [];
    const aiAccepted = logs.filter((l) => l.success).length;
    const aiTotal = logs.length;
    const aiCostMonth = logs.reduce((s, l) => s + Number(l.estimated_cost ?? 0), 0);

    return NextResponse.json({
      ok: true,
      widgets: {
        drafts: drafts.count ?? 0,
        in_review: inReview.count ?? 0,
        scheduled: scheduled.count ?? 0,
        published_this_month: publishedMonth.count ?? 0,
        seo_critical: seoCritical.slice(0, 10),
        missing_internal_links: missingLinks.slice(0, 10),
        stale_articles: stale.slice(0, 10),
        ai_usage_today_usd: aiSpend,
        ai_cost_month_usd: aiCostMonth,
        ai_acceptance_rate: aiTotal ? Math.round((aiAccepted / aiTotal) * 100) : 0,
        recently_edited: (articles.data ?? []).slice(0, 8).map((a) => ({
          id: a.id,
          title: a.title,
          status: a.status,
          updated_at: a.updated_at,
        })),
      },
    });
  } catch (e) {
    return dbError(String(e));
  }
}
