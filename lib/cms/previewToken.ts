import { createHmac, timingSafeEqual } from 'crypto';

const TTL_MS = 15 * 60 * 1000;

function secret(): string {
  const s = process.env.CMS_PREVIEW_SECRET || process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('CMS_PREVIEW_SECRET or ADMIN_SESSION_SECRET required');
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

function fromB64url(s: string): Buffer {
  return Buffer.from(s, 'base64url');
}

export function signPreviewToken(articleId: string, userId: string): string {
  const exp = Date.now() + TTL_MS;
  const payload = JSON.stringify({ articleId, userId, exp, mode: 'preview' });
  const body = b64url(Buffer.from(payload, 'utf8'));
  const sig = createHmac('sha256', secret()).update(body).digest('hex');
  return `${body}.${sig}`;
}

export function verifyPreviewToken(
  token: string
): { articleId: string; userId: string } | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac('sha256', secret()).update(body).digest('hex');
  try {
    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(fromB64url(body).toString('utf8')) as {
      articleId?: string;
      userId?: string;
      exp?: number;
      mode?: string;
    };
    if (!payload.articleId || !payload.userId || payload.mode !== 'preview') return null;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return { articleId: payload.articleId, userId: payload.userId };
  } catch {
    return null;
  }
}
