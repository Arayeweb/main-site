import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// =========================================================
// سشن صاحب کارت ویزیت — کوکی HMAC روی slug + accessToken
// =========================================================

export const BIZCARD_OWNER_COOKIE = "ary_bizcard_owner";
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // ۹۰ روز

export interface BizcardOwnerSession {
  slug: string;
  accessToken: string;
  exp: number;
}

function ownerSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_SESSION_SECRET باید در .env.local تنظیم شود (حداقل ۱۶ کاراکتر)."
    );
  }
  return `bizcard-owner:${s}`;
}

function b64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function createBizcardOwnerAccessToken(): string {
  return randomBytes(24).toString("hex");
}

export function signBizcardOwnerToken(
  slug: string,
  accessToken: string,
  ttlMs: number = SESSION_TTL_MS
): string {
  const payload = JSON.stringify({
    slug,
    tok: accessToken,
    exp: Date.now() + ttlMs,
  });
  const body = b64url(Buffer.from(payload, "utf8"));
  const sig = createHmac("sha256", ownerSecret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function verifyBizcardOwnerToken(
  token: string | undefined | null
): BizcardOwnerSession | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = createHmac("sha256", ownerSecret()).update(body).digest("hex");
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
      typeof payload.slug !== "string" ||
      typeof payload.tok !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }
    return {
      slug: payload.slug,
      accessToken: payload.tok,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function getBizcardOwnerSession(
  req: NextRequest
): BizcardOwnerSession | null {
  return verifyBizcardOwnerToken(req.cookies.get(BIZCARD_OWNER_COOKIE)?.value);
}

export function setBizcardOwnerSessionCookie(
  res: NextResponse,
  slug: string,
  accessToken: string
): void {
  const token = signBizcardOwnerToken(slug, accessToken);
  res.cookies.set(BIZCARD_OWNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export function clearBizcardOwnerSessionCookie(res: NextResponse): void {
  res.cookies.set(BIZCARD_OWNER_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
