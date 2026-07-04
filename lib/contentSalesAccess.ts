import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const CONTENT_SALES_COOKIE = "ary_content_sales_access";

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET required");
  return `content-sales:${s}`;
}

export function generateAccessToken(): string {
  return randomBytes(24).toString("base64url");
}

export function signContentSalesSession(orderId: string, ttlMs = 365 * 24 * 60 * 60 * 1000): string {
  const payload = JSON.stringify({ oid: orderId, exp: Date.now() + ttlMs });
  const body = Buffer.from(payload, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function verifyContentSalesSession(token: string | null | undefined): { orderId: string } | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", secret()).update(body).digest("hex");
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      oid?: string;
      exp?: number;
    };
    if (!payload.oid || !payload.exp || payload.exp <= Date.now()) return null;
    return { orderId: payload.oid };
  } catch {
    return null;
  }
}

export function getContentSalesSession(req: NextRequest): { orderId: string } | null {
  return verifyContentSalesSession(req.cookies.get(CONTENT_SALES_COOKIE)?.value);
}

export function attachContentSalesCookie(res: NextResponse, orderId: string) {
  res.cookies.set(CONTENT_SALES_COOKIE, signContentSalesSession(orderId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
}
