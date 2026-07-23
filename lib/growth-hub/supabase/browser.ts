"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/growth-hub/database.types";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * User-scoped Supabase client for /app Client Components (sign-in, sign-up).
 * Uses the public anon key only. Never has service-role access.
 */
export function getGrowthHubBrowserClient() {
  if (cached) return cached;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY باید تنظیم شوند.",
    );
  }

  cached = createBrowserClient<Database>(url, anonKey);
  return cached;
}
