import { createClient, SupabaseClient } from "@supabase/supabase-js";

// کلاینت سمت‌سرور با service-role key. هرگز در کد کلاینت import نشود.
// RLS روی جدول leads فعال است و فقط service-role می‌تواند بنویسد/بخواند.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY باید در .env.local تنظیم شوند."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Next.js patches global fetch with its Data Cache, which can replay
      // stale PostgREST responses inside route handlers (jobs stuck "pending").
      fetch: (input, init) =>
        fetch(input as RequestInfo, { ...init, cache: "no-store" } as RequestInit),
    },
  });
  return cached;
}
