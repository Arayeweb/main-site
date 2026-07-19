import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { dbError, str } from '@/lib/adminRouteHelpers';
import { hasCmsCapability } from '@/lib/cms/permissions';
import type { AdminRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = Number(process.env.CMS_UPLOAD_MAX_MB ?? 10) * 1024 * 1024;

export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !hasCmsCapability(session.role as AdminRole, 'cms.read')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const q = str(req.nextUrl.searchParams.get('q'), 200);

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase.from('cms_media_assets').select('*').order('created_at', { ascending: false }).limit(100);
    if (q) query = query.ilike('file_name', `%${q}%`);
    const { data, error } = await query;
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, media: data ?? [] });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSession(req);
  if (!session || !hasCmsCapability(session.role as AdminRole, 'cms.manage_media')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const id = str(body.id, 64);
  if (!id) return NextResponse.json({ ok: false, error: 'missing_id' }, { status: 422 });

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('cms_media_assets')
      .update({
        alt_text: str(body.alt_text, 500) ?? '',
        caption: str(body.caption, 1000) ?? '',
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) return dbError(error.message);
    return NextResponse.json({ ok: true, media: data });
  } catch (e) {
    return dbError(String(e));
  }
}
