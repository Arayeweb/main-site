import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getSession } from '@/lib/auth';
import { hasCmsCapability } from '@/lib/cms/permissions';
import type { AdminRole } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = Number(process.env.CMS_UPLOAD_MAX_MB ?? 10) * 1024 * 1024;
const BUCKET = 'blog-uploads';

export async function POST(req: NextRequest) {
  const session = getSession(req);
  if (!session || !hasCmsCapability(session.role as AdminRole, 'cms.manage_media')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ ok: false, error: 'missing_file' }, { status: 422 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ ok: false, error: 'invalid_type' }, { status: 422 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ ok: false, error: 'file_too_large' }, { status: 422 });
  }

  const ext = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
  const safeName = file.name.replace(/[^a-zA-Z0-9._\u0600-\u06FF-]/g, '-').slice(0, 80);
  const storageKey = `${session.userId}/${Date.now()}-${safeName || 'image'}.${ext}`;

  try {
    const supabase = getSupabaseAdmin();
    const buffer = await file.arrayBuffer();

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storageKey, buffer, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[cms/media/upload]', uploadError.message);
      return NextResponse.json({ ok: false, error: 'upload_failed' }, { status: 500 });
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(uploadData.path);

    const { data: row, error: dbError } = await supabase
      .from('cms_media_assets')
      .insert({
        url: publicUrl,
        storage_key: storageKey,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
        uploaded_by: session.userId,
      })
      .select('*')
      .single();

    if (dbError) {
      return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, media: row });
  } catch (e) {
    console.error('[cms/media/upload]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
