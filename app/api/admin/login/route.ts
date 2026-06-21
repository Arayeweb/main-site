import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  signAdminToken,
  verifyAdminToken,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ---------- rate-limit ساده برای جلوگیری از brute-force ----------
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60, // ۱۲ ساعت — هماهنگ با TTL توکن
  });
}

// ورود ادمین
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const password = String(body.password ?? "");
  if (!password) {
    return NextResponse.json({ ok: false, error: "missing_password" }, { status: 422 });
  }

  let ok = false;
  try {
    ok = checkAdminPassword(password);
  } catch (e) {
    console.error("[api/admin/login] config error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }

  if (!ok) {
    return NextResponse.json({ ok: false, error: "invalid_password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, signAdminToken());
  return res;
}

// بررسی نشست فعلی — برای صفحه‌ی ادمین تا بداند لاگین هست یا نه.
export async function GET(req: NextRequest) {
  const authed = verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  return NextResponse.json({ ok: true, authed });
}

// خروج
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
