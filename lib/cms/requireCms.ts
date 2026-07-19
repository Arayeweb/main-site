import { NextRequest, NextResponse } from 'next/server';
import { getSession, type AdminRole } from '@/lib/auth';
import { hasCmsCapability, type CmsCapability } from './permissions';

export function requireCmsSession(req: NextRequest) {
  return getSession(req);
}

export function requireCmsCap(req: NextRequest, cap: CmsCapability) {
  const session = getSession(req);
  if (!session) return null;
  if (!hasCmsCapability(session.role as AdminRole, cap)) return null;
  return session;
}

export function cmsUnauthorized() {
  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

export function cmsForbidden() {
  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}

export function cmsNotFound() {
  return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
}

export function cmsConflict(msg = 'conflict') {
  return NextResponse.json({ ok: false, error: msg }, { status: 409 });
}
