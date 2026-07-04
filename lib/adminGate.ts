import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_GATE_COOKIE = 'ary_admin_gate';

export function getAdminPanelAccessSecret(): string {
  return (process.env.ADMIN_PANEL_ACCESS_SECRET || '').trim();
}

/** Gate is optional in dev when ADMIN_PANEL_ACCESS_SECRET is unset. */
export function isAdminGateEnabled(): boolean {
  return getAdminPanelAccessSecret().length >= 8;
}

export function isValidAdminGateSecret(secret: string): boolean {
  if (!isAdminGateEnabled()) return true;
  const expected = getAdminPanelAccessSecret();
  const a = Buffer.from(secret);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function gateSigningSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

export function signAdminGateCookie(): string | null {
  if (!isAdminGateEnabled()) return 'open';
  const secret = gateSigningSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update('admin_gate_v1').digest('hex');
}

export function verifyAdminGateCookie(value: string | undefined): boolean {
  if (!isAdminGateEnabled()) return true;
  const expected = signAdminGateCookie();
  if (!expected || !value) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
