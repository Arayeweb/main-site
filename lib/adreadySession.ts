import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { hashPassword, verifyPassword } from "./auth";

// =========================================================
// احراز هویت کاربران کمپین‌ساز آرایه (AdReady)
// توکن HMAC جدا از AI — cookie و payload مستقل.
// =========================================================

export const ADREADY_COOKIE = "ary_adready_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // ۳۰ روز

export interface AdReadySession {
  userId: string;
  exp: number;
}

function adreadySecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET باید در .env.local تنظیم شود (حداقل ۱۶ کاراکتر)."
    );
  }
  return `adready:${s}`;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** توکن نشست امضاشده برای کاربر AdReady می‌سازد. */
export function signAdReadyToken(
  userId: string,
  ttlMs: number = SESSION_TTL_MS
): string {
  const payload = JSON.stringify({ sub: userId, exp: Date.now() + ttlMs });
  const body = b64url(Buffer.from(payload, "utf8"));
  const sig = createHmac("sha256", adreadySecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

/** توکن AdReady را تأیید و payload را برمی‌گرداند. */
export function verifyAdReadyToken(
  token: string | undefined | null
): AdReadySession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", adreadySecret()).update(body).digest("hex");
  } catch {
    return null;
  }
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64").toString("utf8")
    ) as Record<string, unknown>;
    if (
      typeof payload.sub !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }
    return { userId: payload.sub, exp: payload.exp };
  } catch {
    return null;
  }
}

/** نشست AdReady را از کوکی request می‌خواند. */
export function getAdReadySession(req: NextRequest): AdReadySession | null {
  return verifyAdReadyToken(req.cookies.get(ADREADY_COOKIE)?.value);
}

export { hashPassword, verifyPassword };
