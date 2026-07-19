import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { dbError } from '@/lib/adminRouteHelpers';
import { requireCmsCap, requireCmsSession, cmsUnauthorized } from '@/lib/cms/requireCms';
import { getCmsSettings, saveCmsSettings } from '@/lib/cms/ai/settings';
import type { CmsAiSettings } from '@/lib/cms/ai/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsSession(req);
  if (!session) return cmsUnauthorized();

  try {
    const settings = await getCmsSettings(getSupabaseAdmin());
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    return dbError(String(e));
  }
}

export async function POST(req: NextRequest) {
  const session = requireCmsCap(req, 'cms.ai_settings');
  if (!session) return cmsUnauthorized();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  try {
    const patch = body.settings as Partial<CmsAiSettings>;
    const settings = await saveCmsSettings(getSupabaseAdmin(), patch ?? {});
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    return dbError(String(e));
  }
}
