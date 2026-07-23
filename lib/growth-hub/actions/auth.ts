"use server";

import { getGrowthHubServerClient } from "@/lib/growth-hub/supabase/server";
import { signInSchema } from "@/lib/growth-hub/validation";

export type AuthActionResult =
  | { ok: true }
  | { ok: false; error: string };

/** Email + password sign-in (D-012). Sets the SSR session cookies. */
export async function signInAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }

  const supabase = getGrowthHubServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Generic message — never reveal whether the email exists.
    return { ok: false, error: "ایمیل یا رمز عبور نادرست است." };
  }
  return { ok: true };
}

/**
 * Creates an account (for an invited user) then signs in. Whether a session is
 * established immediately depends on the Supabase project's email-confirmation
 * setting (see manual setup notes).
 */
export async function signUpAction(input: unknown): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر است." };
  }

  const supabase = getGrowthHubServerClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, error: "ساخت حساب ناموفق بود. ممکن است قبلاً ثبت شده باشید." };
  }

  // Attempt immediate sign-in (works when email confirmation is disabled).
  await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  return { ok: true };
}

export async function signOutAction(): Promise<AuthActionResult> {
  const supabase = getGrowthHubServerClient();
  await supabase.auth.signOut();
  return { ok: true };
}
