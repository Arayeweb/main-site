import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError, str } from '@/lib/adminRouteHelpers';
import { requireCmsCap, requireCmsSession, cmsUnauthorized, cmsForbidden } from '@/lib/cms/requireCms';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();
  if (!requireCmsCap(req, 'cms.read')) return cmsForbidden();

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('cms_tags').select('*').order('name');
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, tags: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  const session = requireCmsCap(req, 'cms.manage_categories');
  if (!session) return cmsUnauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const name = str(body.name, 200);
  const slug = str(body.slug, 200);
  if (!name || !slug) {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 422 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('cms_tags').insert({ name, slug }).select('*').single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, tag: data });
  } catch (e) {
    return dbError(String(e));
  }
}
