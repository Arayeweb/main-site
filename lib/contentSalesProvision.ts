import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { hashPassword } from "@/lib/aiAuth";
import { generateReferralCode } from "@/lib/aiPromo";
import { higherPlan, type AIPlan } from "@/lib/aiPackages";
import { CONTENT_SALES_AI_GRANT } from "@/lib/contentSalesBundle";

export interface ProvisionResult {
  aiUserId: string;
  tempPassword: string | null;
  isNewUser: boolean;
}

export async function provisionContentSalesAI(
  supabase: SupabaseClient,
  phone: string,
  buyerName: string
): Promise<ProvisionResult> {
  const { data: existing } = await supabase
    .from("ai_users")
    .select("id, plan, credits")
    .eq("phone", phone)
    .maybeSingle();

  const grant = CONTENT_SALES_AI_GRANT;

  if (existing) {
    await supabase
      .from("ai_users")
      .update({
        credits: ((existing.credits as number) || 0) + grant.credits,
        plan: higherPlan((existing.plan as string) || "free", grant.grantsPlan),
      })
      .eq("id", existing.id);

    return { aiUserId: existing.id as string, tempPassword: null, isNewUser: false };
  }

  const tempPassword = randomBytes(4).toString("hex").slice(0, 8);
  const password_hash = hashPassword(tempPassword);

  const { data: user, error } = await supabase
    .from("ai_users")
    .insert({
      phone,
      password_hash,
      plan: grant.grantsPlan,
      credits: grant.credits,
    })
    .select("id")
    .single();

  if (error || !user) throw new Error("provision_insert_failed");

  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode();
    const { error: refErr } = await supabase.from("ai_referral_codes").insert({
      user_id: user.id,
      code,
    });
    if (!refErr) break;
  }

  return { aiUserId: user.id as string, tempPassword, isNewUser: true };
}
