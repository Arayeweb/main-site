import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// =========================================================
// سشن مشتری سایت فوری — کوکی HMAC روی orderId + accessToken
// =========================================================

export const FASTWEB_COOKIE = "ary_fastweb_session";
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // ۹۰ روز

export interface FastWebSession {
  orderId: string;
  accessToken: string;
  exp: number;
}

function fastwebSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET باید در .env.local تنظیم شود (حداقل ۱۶ کاراکتر)."
    );
  }
  return `fastweb:${s}`;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function createAccessToken(): string {
  return randomBytes(24).toString("hex");
}

export function signFastWebToken(
  orderId: string,
  accessToken: string,
  ttlMs: number = SESSION_TTL_MS
): string {
  const payload = JSON.stringify({
    oid: orderId,
    tok: accessToken,
    exp: Date.now() + ttlMs,
  });
  const body = b64url(Buffer.from(payload, "utf8"));
  const sig = createHmac("sha256", fastwebSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function verifyFastWebToken(
  token: string | undefined | null
): FastWebSession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", fastwebSecret()).update(body).digest("hex");
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
      typeof payload.oid !== "string" ||
      typeof payload.tok !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }
    return {
      orderId: payload.oid,
      accessToken: payload.tok,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function getFastWebSession(req: NextRequest): FastWebSession | null {
  return verifyFastWebToken(req.cookies.get(FASTWEB_COOKIE)?.value);
}

export function setFastWebSessionCookie(
  res: NextResponse,
  orderId: string,
  accessToken: string
): void {
  const token = signFastWebToken(orderId, accessToken);
  res.cookies.set(FASTWEB_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}
