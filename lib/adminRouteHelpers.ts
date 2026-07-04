import { NextRequest, NextResponse } from 'next/server';
import { getSession, type AdminRole } from '@/lib/auth';

export function str(v: unknown, max = 2000): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export function num(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.round(n);
}

export function bool(v: unknown): boolean {
  return v === true || v === 'true' || v === 1 || v === '1';
}

export function normDate(v: unknown): string | null {
  const s = str(v, 32);
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

export function unauthorized() {
  return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
}

export function dbError(msg?: string) {
  console.error('[admin-api]', msg);
  return NextResponse.json({ ok: false, error: 'db_error' }, { status: 500 });
}

/** True when Supabase/Postgres reports a missing relation (migration not applied). */
export function isMissingTableError(msg?: string | null): boolean {
  if (!msg) return false;
  return (
    msg.includes('does not exist') ||
    msg.includes('Could not find the table') ||
    msg.includes('schema cache')
  );
}

export function requireSession(req: NextRequest) {
  return getSession(req);
}

export function requireRoles(req: NextRequest, roles: AdminRole[]) {
  const s = getSession(req);
  return s && roles.includes(s.role) ? s : null;
}

export function requireAdmin(req: NextRequest) {
  const s = getSession(req);
  return s?.role === 'admin' ? s : null;
}
