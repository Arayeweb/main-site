import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  signUserToken,
  ADMIN_COOKIE,
  type AdminRole,
} from "@/lib/auth";

const COOKIE_MAX_AGE = 12 * 60 * 60;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, number[]>();

export function adminLoginRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > MAX_PER_WINDOW;
}

export function adminLoginClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export type AdminLoginError =
  | "invalid_body"
  | "missing_fields"
  | "rate_limited"
  | "config_error"
  | "invalid_credentials"
  | "not_an_admin"
  | "account_disabled"
  | "server_error";

export type AdminLoginSuccess = {
  ok: true;
  userId: string;
  name: string;
  email: string;
  role: AdminRole;
};

export type AdminLoginFailure = {
  ok: false;
  error: AdminLoginError;
  status: number;
};

export type AdminLoginResult = AdminLoginSuccess | AdminLoginFailure;

/** Supabase Auth (password) + admin_users (role). Single login flow for all admin UIs. */
export async function authenticateAdmin(
  email: string,
  password: string
): Promise<AdminLoginResult> {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { ok: false, error: "config_error", status: 500 };
  }

  const supabaseAuth = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } =
    await supabaseAuth.auth.signInWithPassword({ email, password });

  // #region agent log
  fetch('http://127.0.0.1:7292/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3d11db'},body:JSON.stringify({sessionId:'3d11db',runId:'post-fix',location:'lib/adminLogin.ts:supabase',message:'authenticateAdmin supabase result',data:{authOk:!!authData?.user,authError:authError?.message??null},timestamp:Date.now(),hypothesisId:'H2'})}).catch(()=>{});
  // #endregion

  if (authError || !authData.user) {
    return { ok: false, error: "invalid_credentials", status: 401 };
  }

  const authUserId = authData.user.id;

  try {
    const supabase = getSupabaseAdmin();
    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("id, name, email, role, is_active")
      .eq("id", authUserId)
      .single();

    // #region agent log
    fetch('http://127.0.0.1:7292/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3d11db'},body:JSON.stringify({sessionId:'3d11db',runId:'post-fix',location:'lib/adminLogin.ts:admin_users',message:'authenticateAdmin admin_users lookup',data:{found:!!adminUser,adminError:adminError?.message??null,role:adminUser?.role??null},timestamp:Date.now(),hypothesisId:'H3'})}).catch(()=>{});
    // #endregion

    if (adminError || !adminUser) {
      return { ok: false, error: "not_an_admin", status: 403 };
    }

    if (!adminUser.is_active) {
      return { ok: false, error: "account_disabled", status: 403 };
    }

    await supabase
      .from("admin_users")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", authUserId);

    return {
      ok: true,
      userId: adminUser.id,
      name: adminUser.name ?? "",
      email: adminUser.email,
      role: adminUser.role as AdminRole,
    };
  } catch (e) {
    console.error("[adminLogin] server error:", e);
    return { ok: false, error: "server_error", status: 500 };
  }
}

export function setAdminSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export function adminLoginSuccessResponse(
  result: AdminLoginSuccess,
  opts?: { includeUser?: boolean }
) {
  const token = signUserToken(result.userId, result.role);
  const body = opts?.includeUser
    ? {
        ok: true,
        user: {
          id: result.userId,
          name: result.name,
          email: result.email,
          role: result.role,
        },
      }
    : { ok: true, role: result.role };

  const res = NextResponse.json(body);
  setAdminSessionCookie(res, token);

  // #region agent log
  fetch('http://127.0.0.1:7292/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3d11db'},body:JSON.stringify({sessionId:'3d11db',runId:'post-fix',location:'lib/adminLogin.ts:success',message:'login cookie set',data:{role:result.role,tokenLen:token.length},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  return res;
}

export function adminLoginErrorResponse(error: AdminLoginError, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}
