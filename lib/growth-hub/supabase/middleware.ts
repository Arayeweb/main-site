import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/growth-hub/database.types";

/**
 * Refreshes the Supabase Auth session for /app routes and writes the rotated
 * cookies onto the response. Edge-compatible. Only mutates cookies — it does
 * not perform authorization (that happens in the /app layouts via
 * requireWorkspaceMembership). Returns null when Supabase env is not
 * configured so the caller can fall through without breaking other routes.
 */
export async function updateGrowthHubSession(
  request: NextRequest,
): Promise<NextResponse | null> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({ request });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // Touch the session so expired tokens are refreshed and cookies rotated.
  try {
    await supabase.auth.getUser();
  } catch {
    // Network/JWT errors must not break navigation; the layout re-checks auth.
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
