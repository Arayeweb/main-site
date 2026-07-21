import type { SupabaseClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { hashPassword } from "@/lib/aiAuth";
import { generateReferralCode } from "@/lib/aiPromo";
import { FREE_SIGNUP_CREDITS } from "@/lib/aiPricingConfig";
import { getGuestState } from "@/lib/aiGuest";

export type CreatedAiUser = {
  id: string;
  plan: string;
  credits: number;
  referralCode: string | null;
};

/** Create ai_users row + signup credits + referral code. Rolls back user on credit failure. */
export async function createAiUserAccount(
  supabase: SupabaseClient,
  input: {
    phone: string;
    password: string;
    utm?: {
      utm_source?: string | null;
      utm_medium?: string | null;
      utm_campaign?: string | null;
    };
    req?: NextRequest;
  }
): Promise<
  | { ok: true; user: CreatedAiUser }
  | { ok: false; error: "phone_taken" | "server_error" }
> {
  const password_hash = hashPassword(input.password);

  const { data: user, error } = await supabase
    .from("ai_users")
    .insert({
      phone: input.phone,
      password_hash,
      utm_source: input.utm?.utm_source ?? null,
      utm_medium: input.utm?.utm_medium ?? null,
      utm_campaign: input.utm?.utm_campaign ?? null,
    })
    .select("id, plan, credits")
    .single();

  if (error || !user) {
    console.error("[createAiUserAccount]", error);
    if ((error as { code?: string } | null)?.code === "23505") {
      return { ok: false, error: "phone_taken" };
    }
    return { ok: false, error: "server_error" };
  }

  const signupExpiresAt = new Date();
  signupExpiresAt.setUTCFullYear(signupExpiresAt.getUTCFullYear() + 1);
  const { error: lotError } = await supabase.from("ai_credit_lots").insert({
    user_id: user.id,
    source: "signup_bonus",
    amount: FREE_SIGNUP_CREDITS,
    remaining: FREE_SIGNUP_CREDITS,
    expires_at: signupExpiresAt.toISOString(),
    metadata: {
      guest_token: input.req ? getGuestState(input.req)?.token ?? null : null,
      signup_bonus_granted: true,
    },
  });
  const { error: ledgerError } = lotError
    ? { error: lotError }
    : await supabase.from("ai_credit_ledger").insert({
        user_id: user.id,
        delta: FREE_SIGNUP_CREDITS,
        balance_after: FREE_SIGNUP_CREDITS,
        reason: "signup_bonus",
        note: "initial signup credit grant",
      });
  if (lotError || ledgerError) {
    console.error("[createAiUserAccount] signup credit grant failed");
    await supabase.from("ai_users").delete().eq("id", user.id);
    return { ok: false, error: "server_error" };
  }

  let referralCode: string | null = null;
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateReferralCode();
    const { error: refErr } = await supabase.from("ai_referral_codes").insert({
      user_id: user.id,
      code,
    });
    if (!refErr) {
      referralCode = code;
      break;
    }
  }

  return {
    ok: true,
    user: {
      id: user.id as string,
      plan: user.plan as string,
      credits: user.credits as number,
      referralCode,
    },
  };
}
