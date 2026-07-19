import { NextResponse } from 'next/server';
import { getCmsModelOptions } from '@/lib/cms/ai/cmsModelOptions';
import { requireCmsCap, cmsUnauthorized } from '@/lib/cms/requireCms';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = requireCmsCap(req, 'cms.ai_use');
  if (!session) return cmsUnauthorized();
  return NextResponse.json({ ok: true, models: getCmsModelOptions() });
}
