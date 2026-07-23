import { NextRequest, NextResponse } from 'next/server';
import { agentDebugLog } from './lib/agentDebug';
import { ADMIN_GATE_COOKIE, isAdminGateEnabled, verifyAdminGateCookieEdge } from './lib/adminGateEdge';
import { updateGrowthHubSession } from './lib/growth-hub/supabase/middleware';

// Edge-compatible token verification using Web Crypto API (no Node.js crypto)
// Token format: base64url(payloadJSON).hmacHex — same as lib/auth.ts signUserToken

const ADMIN_COOKIE = 'ary_admin';
const PUBLIC_ADMIN_PATHS = ['/admin/gate'];
const SHARED_ADMIN_PATHS = ['/admin/login', '/admin/select-panel'];

const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  admin: ['/admin'],
  sales: ['/admin/sales', '/admin/select-panel', '/admin/login', '/admin/gate'],
  support: ['/admin/support', '/admin/select-panel', '/admin/login', '/admin/gate'],
  ai_superadmin: ['/admin/ai-ops', '/admin/select-panel', '/admin/login', '/admin/gate'],
  ai_finance: ['/admin/ai-ops', '/admin/select-panel', '/admin/login', '/admin/gate'],
  ai_support: ['/admin/ai-ops', '/admin/select-panel', '/admin/login', '/admin/gate'],
  ai_ops: ['/admin/ai-ops', '/admin/select-panel', '/admin/login', '/admin/gate'],
};

function canAccessAdminPath(role: string, pathname: string): boolean {
  if (role === 'admin') return true;
  const prefixes = ROLE_ALLOWED_PREFIXES[role];
  if (!prefixes) return SHARED_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  return prefixes.some((p) => pathname === p || pathname.startsWith(p + '/'));
}
const ROLE_DEFAULT_PANEL: Record<string, string> = {
  admin: '/admin/select-panel',
  sales: '/admin/sales',
  support: '/admin/support',
  ai_superadmin: '/admin/ai-ops',
  ai_finance: '/admin/ai-ops',
  ai_support: '/admin/ai-ops',
  ai_ops: '/admin/ai-ops',
};

async function verifyToken(token: string | undefined): Promise<{ role: string } | null> {
  if (!token) return null;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;

  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;

  const body = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);

  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    const expected = Array.from(new Uint8Array(sigBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Timing-safe compare
    if (expected.length !== sigHex.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sigHex.charCodeAt(i);
    if (diff !== 0) return null;

    const payload = JSON.parse(atob(body.replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.role || !payload.exp || payload.exp <= Date.now()) return null;

    return { role: payload.role };
  } catch {
    return null;
  }
}

function permanentApexRedirect(req: NextRequest): NextResponse | null {
  const host = (req.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
  if (
    host !== "www.araaye.com" &&
    host !== "arayeweb.com" &&
    host !== "www.arayeweb.com"
  ) {
    return null;
  }
  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = "araaye.com";
  url.port = "";
  return NextResponse.redirect(url, 308);
}

function blogSubdomainRedirect(req: NextRequest): NextResponse | null {
  const host = (req.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";
  if (host !== "blog.araaye.com") return null;

  const url = req.nextUrl.clone();
  url.protocol = "https:";
  url.hostname = "araaye.com";
  url.port = "";

  const postMatch = url.pathname.match(/^\/posts\/([^/]+?)(?:\.html)?$/);
  if (postMatch) {
    url.pathname = `/blog/${postMatch[1]}`;
    return NextResponse.redirect(url, 301);
  }

  if (url.pathname === "/" || url.pathname === "") {
    url.pathname = "/blog";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.redirect(url, 301);
}

export async function middleware(req: NextRequest) {
  const apex = permanentApexRedirect(req);
  if (apex) return apex;

  const blogRedirect = blogSubdomainRedirect(req);
  if (blogRedirect) return blogRedirect;

  const { pathname } = req.nextUrl;

  // Growth Hub client portal: refresh the Supabase Auth session cookies so
  // SSR sees a valid session. Authorization itself happens in the /app layouts
  // (requireWorkspaceMembership). Scoped strictly to /app so other products and
  // the existing admin auth are untouched.
  if (pathname === "/app" || pathname.startsWith("/app/")) {
    const ghResponse = await updateGrowthHubSession(req);
    return ghResponse ?? NextResponse.next();
  }

  // Host canonicalization runs globally; admin gate only on /admin.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const session = await verifyToken(token);
  const gateOk = await verifyAdminGateCookieEdge(req.cookies.get(ADMIN_GATE_COOKIE)?.value);
  const isPublicPath = PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '?')
  );
  const isLoginPath = pathname === '/admin/login' || pathname.startsWith('/admin/login?');

  agentDebugLog(
    'middleware.ts:session',
    'admin_middleware_session_check',
    {
      pathname,
      hasToken: Boolean(token),
      sessionOk: Boolean(session),
      role: session?.role ?? null,
      isPublicPath,
      gateOk,
      gateEnabled: isAdminGateEnabled(),
      hasAdminSessionSecret: Boolean(process.env.ADMIN_SESSION_SECRET),
    },
    'H1'
  );

  if (isAdminGateEnabled() && !gateOk && !isPublicPath) {
    const gateUrl = req.nextUrl.clone();
    gateUrl.pathname = '/admin/gate';
    gateUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(gateUrl);
  }

  if (isLoginPath && isAdminGateEnabled() && !gateOk) {
    const gateUrl = req.nextUrl.clone();
    gateUrl.pathname = '/admin/gate';
    gateUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(gateUrl);
  }

  if (!session && !isPublicPath && !isLoginPath) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && (isPublicPath || isLoginPath)) {
    const dest = req.nextUrl.searchParams.get('next') ?? ROLE_DEFAULT_PANEL[session.role] ?? '/admin/select-panel';
    const url = req.nextUrl.clone();
    url.pathname = dest;
    url.searchParams.delete('next');
    return NextResponse.redirect(url);
  }

  if (session && !canAccessAdminPath(session.role, pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = ROLE_DEFAULT_PANEL[session.role] ?? '/admin/select-panel';
    url.search = '';
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return res;
}

export const config = {
  matcher: [
    /*
     * Host redirects (www / legacy) + admin gate.
     * Skip static assets and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|monitoring|.*\\..*).*)",
  ],
};
