import { NextRequest, NextResponse } from "next/server";
import { noStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { AI_PACKAGES, higherPlan, type AIPlan } from "@/lib/aiPackages";
import { paymentSiteUrl } from "@/lib/paymentCallback";
import { REFERRAL_REFERRER_CREDITS } from "@/lib/aiPromo";
import { resolveZibalVerify } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = paymentSiteUrl;
const AMOUNT_TOLERANCE = 10;

function redirectNoStore(url: string) {
  return noStore(NextResponse.redirect(url));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const trackId = sp.get("trackId");
  const status = sp.get("status");
  const success = sp.get("success");

  if (!trackId) {
    return redirectNoStore(`${SITE_URL}/ai/pricing?payment=error`);
  }

  const supabase = getSupabaseAdmin();

  const { data: order } = await supabase
    .from("ai_orders")
    .select(
      "id, user_id, package_id, amount_toman, credits_granted, status, promo_code, referral_code, referrer_user_id"
    )
    .eq("zibal_track_id", trackId)
    .maybeSingle();

  if (!order) {
    return redirectNoStore(`${SITE_URL}/ai/pricing?payment=error`);
  }

  if (order.status === "paid") {
    return redirectNoStore(`${SITE_URL}/ai?payment=success`);
  }

  if (status === "NOK" || success === "false") {
    await supabase.from("ai_orders").update({ status: "failed" }).eq("id", order.id);
    return redirectNoStore(`${SITE_URL}/ai/pricing?payment=failed`);
  }

  const verify = await resolveZibalVerify(trackId, sp);
  if (!verify.ok || !verify.paid) {
    await supabase.from("ai_orders").update({ status: "failed" }).eq("id", order.id);
    return redirectNoStore(`${SITE_URL}/ai/pricing?payment=failed`);
  }

  const paidAmount = verify.amount ?? 0;
  const expectedAmount = order.amount_toman as number;
  if (Math.abs(paidAmount - expectedAmount) > AMOUNT_TOLERANCE) {
    console.error(
      `[api/ai/verify] amount mismatch: paid=${paidAmount} expected=${expectedAmount} track=${trackId}`
    );
    await supabase.from("ai_orders").update({ status: "failed" }).eq("id", order.id);
    return redirectNoStore(`${SITE_URL}/ai/pricing?payment=error`);
  }

  const pkg = AI_PACKAGES[order.package_id as string];
  const { data: user } = await supabase
    .from("ai_users")
    .select("id, plan, credits")
    .eq("id", order.user_id)
    .maybeSingle();

  if (user && pkg) {
    await supabase
      .from("ai_users")
      .update({
        credits: ((user.credits as number) || 0) + (order.credits_granted as number),
        plan: higherPlan((user.plan as string) || "free", pkg.grantsPlan as AIPlan),
      })
      .eq("id", user.id);
  }

  await supabase
    .from("ai_orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", order.id);

  // promo used_count++
  if (order.promo_code) {
    const { data: promo } = await supabase
      .from("ai_promo_codes")
      .select("id, used_count")
      .eq("code", order.promo_code as string)
      .maybeSingle();

    if (promo) {
      await supabase
        .from("ai_promo_codes")
        .update({ used_count: (promo.used_count as number) + 1 })
        .eq("id", promo.id);
    }
  }

  // referral reward — فقط اولین redemption هر buyer
  if (order.referral_code && order.referrer_user_id) {
    const { data: refCode } = await supabase
      .from("ai_referral_codes")
      .select("id, total_referrals, credits_earned")
      .eq("code", order.referral_code as string)
      .maybeSingle();

    if (refCode) {
      const { data: existingRedemption } = await supabase
        .from("ai_referral_redemptions")
        .select("id")
        .eq("user_id", order.user_id)
        .maybeSingle();

      if (!existingRedemption) {
        await supabase.from("ai_referral_redemptions").insert({
          user_id: order.user_id,
          referral_code_id: refCode.id,
          order_id: order.id,
        });

        const { data: referrer } = await supabase
          .from("ai_users")
          .select("id, credits")
          .eq("id", order.referrer_user_id)
          .maybeSingle();

        if (referrer) {
          await supabase
            .from("ai_users")
            .update({
              credits: ((referrer.credits as number) || 0) + REFERRAL_REFERRER_CREDITS,
            })
            .eq("id", referrer.id);
        }

        await supabase
          .from("ai_referral_codes")
          .update({
            total_referrals: (refCode.total_referrals as number) + 1,
            credits_earned: (refCode.credits_earned as number) + REFERRAL_REFERRER_CREDITS,
          })
          .eq("id", refCode.id);
      }
    }
  }

  return redirectNoStore(`${SITE_URL}/ai?payment=success`);
}
