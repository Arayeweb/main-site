import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsSession, cmsUnauthorized, cmsForbidden, cmsNotFound } from '@/lib/cms/requireCms';
import { signPreviewToken } from '@/lib/cms/previewToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();
  if (!requireCmsSession(req)) return cmsForbidden();

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase.from('cms_articles').select('id, slug').eq('id', params.id).maybeSingle();
    if (!data) return cmsNotFound();

    const token = signPreviewToken(params.id, session.userId);
    const previewUrl = `/blog/preview/${token}`;

    return NextResponse.json({ ok: true, token, preview_url: previewUrl });
  } catch (e) {
    return dbError(String(e));
  }
}
