import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { str } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized } from '@/lib/cms/requireCms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();

  const slug = str(req.nextUrl.searchParams.get('slug'), 200);
  const excludeId = str(req.nextUrl.searchParams.get('exclude_id'), 64);
  if (!slug) {
    return NextResponse.json({ ok: false, error: 'missing_slug' }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('cms_articles').select('id, title, slug').eq('slug', slug);
    const { data, error } = await query.maybeSingle();
    if (error) {
      return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    const available = !data || (excludeId && data.id === excludeId);
    return NextResponse.json({ ok: true, available, conflict: data ?? null });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
