import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  getSession,
  signUserToken,
  verifyPassword,
  type AdminRole,
  ROLES,
} from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase";

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

function str(v: unknown, max = 200): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

// ورود کاربران پنل
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

  const email = str(body.email, 200)?.toLowerCase();
  const password = str(body.password, 200);
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "missing_credentials" },
      { status: 422 }
    );
  }

  // ---------- fallback ادمین با ADMIN_PASSWORD ----------
  if (email === "admin") {
    try {
      if (checkAdminPassword(password)) {
        const res = NextResponse.json({ ok: true, role: "admin" });
        setSessionCookie(res, signUserToken("admin", "admin"));
        return res;
      }
    } catch (e) {
      console.error("[api/admin/login] config error:", e);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }
    // اگر رمز نادرست بود، ادامه بده تا پیام یکسان بدهد.
  }

  // ---------- احراز هویت از جدول admin_users ----------
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("admin_users")
      .select("id, role, password_hash, is_active")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.error("[api/admin/login] db error:", error.message);
      return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
    }

    if (!data || !data.is_active || !verifyPassword(password, data.password_hash as string)) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    const role = data.role as AdminRole;
    if (!ROLES.includes(role)) {
      return NextResponse.json({ ok: false, error: "invalid_role" }, { status: 403 });
    }

    // به‌روزرسانی آخرین ورود
    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", data.id);

    const res = NextResponse.json({ ok: true, role });
    setSessionCookie(res, signUserToken(data.id as string, role));
    return res;
  } catch (e) {
    console.error("[api/admin/login] server error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

// بررسی نشست فعلی — برای صفحه‌ی ادمین تا بداند لاگین هست یا نه و نقش چیست.
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: true, authed: false });
  }
  return NextResponse.json({
    ok: true,
    authed: true,
    userId: session.userId,
    role: session.role,
  });
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
