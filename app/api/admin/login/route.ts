import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, getSession } from "@/lib/auth";
import {
  adminLoginClientIp,
  adminLoginErrorResponse,
  adminLoginRateLimited,
  adminLoginSuccessResponse,
  authenticateAdmin,
} from "@/lib/adminLogin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Legacy admin API for public/admin.html — same Supabase Auth flow as /api/admin/auth/login.
 */

export async function POST(req: NextRequest) {
  const ip = adminLoginClientIp(req);
  if (adminLoginRateLimited(ip)) {
    return adminLoginErrorResponse("rate_limited", 429);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return adminLoginErrorResponse("invalid_body", 400);
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!email || !password) {
    return adminLoginErrorResponse("missing_fields", 422);
  }

  // #region agent log
  fetch('http://127.0.0.1:7292/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3d11db'},body:JSON.stringify({sessionId:'3d11db',runId:'post-fix',location:'api/admin/login/route.ts:entry',message:'legacy panel login attempt',data:{emailDomain:email.split('@')[1]??'none'},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  const result = await authenticateAdmin(email, password);
  if (!result.ok) {
    return adminLoginErrorResponse(result.error, result.status);
  }

  return adminLoginSuccessResponse(result);
}

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
