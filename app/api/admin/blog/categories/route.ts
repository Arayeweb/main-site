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
    const { data, error } = await supabase.from('cms_categories').select('*').order('name');
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, categories: data ?? [] });
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
    const { data, error } = await supabase
      .from('cms_categories')
      .insert({
        name,
        slug,
        description: str(body.description, 2000) ?? '',
        seo_title: str(body.seo_title, 200) ?? name,
        seo_description: str(body.seo_description, 500) ?? '',
        hub_url: str(body.hub_url, 300),
      })
      .select('*')
      .single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, category: data });
  } catch (e) {
    return dbError(String(e));
  }
}
