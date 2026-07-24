import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Shared helpers for live Growth Hub integration tests. */

export function requireGhTestEnv(): {
  url: string;
  service: string;
  anon: string;
} {
  const url = process.env.GH_TEST_SUPABASE_URL;
  const service = process.env.GH_TEST_SERVICE_ROLE;
  const anon = process.env.GH_TEST_ANON_KEY;
  if (!url || !service || !anon) {
    throw new Error("GH_TEST_* env vars required");
  }
  return { url, service, anon };
}

export function createAdminClient(url: string, service: string): SupabaseClient {
  return createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function createAnonClient(url: string, anon: string): SupabaseClient {
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * Auth Admin createUser can flake with new sb_secret_ keys + ES256 signing.
 * Retry a few times before failing the suite.
 */
export async function createConfirmedUser(
  admin: SupabaseClient,
  email: string,
  password: string,
  attempts = 5,
): Promise<string> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (!error && data.user?.id) return data.user.id;
    lastError = error ?? new Error("createUser returned no user");
    await sleep(400 * (i + 1));
  }
  throw lastError;
}

export async function signedInClient(
  url: string,
  anon: string,
  email: string,
  password: string,
): Promise<SupabaseClient> {
  const c = createAnonClient(url, anon);
  let lastError: unknown;
  for (let i = 0; i < 5; i++) {
    const { error } = await c.auth.signInWithPassword({ email, password });
    if (!error) return c;
    lastError = error;
    await sleep(300 * (i + 1));
  }
  throw lastError;
}
