import { NextRequest } from "next/server";
import {
  adminLoginClientIp,
  adminLoginErrorResponse,
  adminLoginRateLimited,
  adminLoginSuccessResponse,
  authenticateAdmin,
} from "@/lib/adminLogin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Admin login — Supabase Auth + admin_users role check. */
export async function POST(req: NextRequest) {
  const ip = adminLoginClientIp(req);
  if (adminLoginRateLimited(ip)) {
    return adminLoginErrorResponse("rate_limited", 429);
  }

  let email: string;
  let password: string;
  try {
    const body = await req.json();
    email = String(body.email ?? "").trim().toLowerCase();
    password = String(body.password ?? "");
  } catch {
    return adminLoginErrorResponse("invalid_body", 400);
  }

  if (!email || !password) {
    return adminLoginErrorResponse("missing_fields", 400);
  }

  // #region agent log
  fetch('http://127.0.0.1:7292/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3d11db'},body:JSON.stringify({sessionId:'3d11db',runId:'post-fix',location:'auth/login/route.ts:entry',message:'next panel login attempt',data:{emailDomain:email.split('@')[1]??'none'},timestamp:Date.now(),hypothesisId:'H4'})}).catch(()=>{});
  // #endregion

  const result = await authenticateAdmin(email, password);
  if (!result.ok) {
    return adminLoginErrorResponse(result.error, result.status);
  }

  return adminLoginSuccessResponse(result, { includeUser: true });
}
