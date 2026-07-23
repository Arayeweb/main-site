import "server-only";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { Database } from "@/lib/growth-hub/database.types";

function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY باید برای مرکز رشد تنظیم شوند.",
    );
  }
  return { url, anonKey };
}

/**
 * User-scoped Supabase client for /app Server Components and Server Actions.
 * Reads the Supabase Auth session from cookies and enforces RLS. This client
 * NEVER uses the service-role key (D-005, D-006).
 *
 * In a pure Server Component (read-only) cookie writes are not allowed; the
 * try/catch keeps reads working while session refresh happens in middleware.
 */
export function getGrowthHubServerClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Called from a Server Component render — refresh handled in middleware.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // See note above.
        }
      },
    },
  });
}
