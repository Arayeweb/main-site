const ADMIN_GATE_COOKIE = 'ary_admin_gate';

function getAdminPanelAccessSecret(): string {
  return (process.env.ADMIN_PANEL_ACCESS_SECRET || '').trim();
}

export function isAdminGateEnabled(): boolean {
  return getAdminPanelAccessSecret().length >= 8;
}

async function expectedGateToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode('admin_gate_v1'));
  return Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function verifyAdminGateCookieEdge(value: string | undefined): Promise<boolean> {
  if (!isAdminGateEnabled()) return true;
  const expected = await expectedGateToken();
  if (!expected || !value) return false;
  if (expected.length !== value.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ value.charCodeAt(i);
  return diff === 0;
}

export { ADMIN_GATE_COOKIE };
