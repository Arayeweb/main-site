// =========================================================
// Link Telegram users to ai_users for paid credits
// =========================================================

import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import { hashPassword } from "@/lib/auth";
import { generateReferralCode } from "@/lib/aiPromo";

export async function ensureAraayeUser(phone: string): Promise<string | null> {
  const supabase = getSupabaseAdmin();
  const { data: existing } = await supabase
    .from("ai_users")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const password_hash = hashPassword(randomBytes(32).toString("hex"));
  const { data: user, error } = await supabase
    .from("ai_users")
    .insert({
      phone,
      password_hash,
      utm_source: "telegram_bot",
      utm_medium: "telegram",
      utm_campaign: "acquisition",
    })
    .select("id")
    .single();

  if (error || !user) {
    console.error("[telegram/accounts] create failed:", error?.message);
    return null;
  }

  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode();
    const { error: refErr } = await supabase.from("ai_referral_codes").insert({
      user_id: user.id,
      code,
    });
    if (!refErr) break;
  }

  return user.id as string;
}

export async function getAraayeCredits(araayeUserId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("ai_users")
    .select("credits, plan")
    .eq("id", araayeUserId)
    .maybeSingle();
  return (data?.credits as number) || 0;
}

export async function getAraayePlan(araayeUserId: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("ai_users")
    .select("plan")
    .eq("id", araayeUserId)
    .maybeSingle();
  return (data?.plan as string) || "free";
}

export async function linkAraayeUser(telegramUserId: string, araayeUserId: string) {
  const supabase = getSupabaseAdmin();
  await supabase
    .from("telegram_users")
    .update({ araaye_user_id: araayeUserId, updated_at: new Date().toISOString() })
    .eq("id", telegramUserId);
}
