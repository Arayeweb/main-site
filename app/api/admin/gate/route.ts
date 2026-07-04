import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_GATE_COOKIE,
  isAdminGateEnabled,
  isValidAdminGateSecret,
  signAdminGateCookie,
} from '@/lib/adminGate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isAdminGateEnabled()) {
    return NextResponse.json({ ok: true, gate: 'disabled' });
  }

  let body: { secret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const secret = String(body.secret || '').trim();
  if (!isValidAdminGateSecret(secret)) {
    return NextResponse.json({ ok: false, error: 'invalid_secret' }, { status: 403 });
  }

  const token = signAdminGateCookie();
  if (!token) {
    return NextResponse.json({ ok: false, error: 'config_error' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_GATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
