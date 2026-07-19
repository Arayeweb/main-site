import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized, cmsForbidden } from '@/lib/cms/requireCms';
import { requireCmsCap } from '@/lib/cms/requireCms';

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
      .from('cms_article_revisions')
      .select('*')
      .eq('article_id', params.id)
      .order('version', { ascending: false })
      .limit(50);
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, revisions: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}
