import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

export async function GET(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ai_referral_codes")
    .select("code, total_referrals, credits_earned")
    .eq("user_id", session.userId)
    .maybeSingle();

  if (error) {
    console.error("[api/ai/referral/me]", error);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  if (!data) {
    return jsonNoStore({ ok: false, error: "no_code" }, { status: 404 });
  }

  const code = data.code as string;
  return jsonNoStore({
    ok: true,
    code,
    totalReferrals: data.total_referrals,
    creditsEarned: data.credits_earned,
    shareUrl: `${SITE_URL}/ai/pricing?ref=${encodeURIComponent(code)}`,
  });
}
