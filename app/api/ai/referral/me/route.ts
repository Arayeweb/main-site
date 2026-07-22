import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { generateReferralCode } from "@/lib/aiPromo";
import { SITE_URL } from "@/lib/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReferralRow = {
  code: string;
  total_referrals: number;
  credits_earned: number;
};

async function ensureReferralCode(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  userId: string
): Promise<{ data: ReferralRow | null; error: string | null }> {
  const { data, error } = await supabase
    .from("ai_referral_codes")
    .select("code, total_referrals, credits_earned")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[api/ai/referral/me]", error);
    return { data: null, error: "server_error" };
  }

  if (data) {
    return { data: data as ReferralRow, error: null };
  }

  // Older accounts (or failed signup inserts) may lack a code — create lazily.
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateReferralCode();
    const { data: inserted, error: insertErr } = await supabase
      .from("ai_referral_codes")
      .insert({ user_id: userId, code })
      .select("code, total_referrals, credits_earned")
      .maybeSingle();

    if (!insertErr && inserted) {
      return { data: inserted as ReferralRow, error: null };
    }

    // Unique conflict on user_id: another request created it — re-fetch.
    if (insertErr?.code === "23505") {
      const { data: existing } = await supabase
        .from("ai_referral_codes")
        .select("code, total_referrals, credits_earned")
        .eq("user_id", userId)
        .maybeSingle();
      if (existing) {
        return { data: existing as ReferralRow, error: null };
      }
      // Conflict was on code uniqueness — retry with a new code.
      continue;
    }

    console.error("[api/ai/referral/me] insert", insertErr);
    return { data: null, error: "server_error" };
  }

  return { data: null, error: "server_error" };
}

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await ensureReferralCode(supabase, session.userId);

  if (error || !data) {
    return jsonNoStore({ ok: false, error: error || "server_error" }, { status: 500 });
  }

  const code = data.code;
  return jsonNoStore({
    ok: true,
    code,
    totalReferrals: data.total_referrals,
    creditsEarned: data.credits_earned,
    shareUrl: `${SITE_URL}/ai/pricing?ref=${encodeURIComponent(code)}`,
  });
}
