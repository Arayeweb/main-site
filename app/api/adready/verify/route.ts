import { NextRequest, NextResponse } from "next/server";
import {
  getAdReadyExpiry,
  isAdReadyPackageKey,
} from "@/lib/adreadyPackages";
import { noStore } from "@/lib/apiHeaders";
import { paymentSiteUrl } from "@/lib/paymentCallback";
import { getSupabaseAdmin } from "@/lib/supabase";
import { resolveZibalVerify } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const AMOUNT_TOLERANCE = 10;

function redirect(path: string) {
  return noStore(NextResponse.redirect(`${paymentSiteUrl()}${path}`));
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const trackId = searchParams.get("trackId");
  if (!trackId) {
    return redirect("/dashboard/adready/pages?payment=error");
  }

  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from("adready_orders")
    .select(
      "id, user_id, campaign_page_id, package, payment_status, amount_toman"
    )
    .eq("zibal_track_id", trackId)
    .maybeSingle();

  if (orderError || !order || !isAdReadyPackageKey(order.package)) {
    console.error("[adready/verify] order not found", orderError);
    return redirect("/dashboard/adready/pages?payment=error");
  }

  const failPath = `/dashboard/adready/pages/${order.campaign_page_id}?payment=failed`;
  if (
    searchParams.get("status") === "NOK" ||
    searchParams.get("success") === "false"
  ) {
    await supabase
      .from("adready_orders")
      .update({ payment_status: "failed" })
      .eq("id", order.id)
      .neq("payment_status", "paid");
    return redirect(failPath);
  }

  try {
    const verification = await resolveZibalVerify(trackId, searchParams);
    if (!verification.ok || !verification.paid) {
      await supabase
        .from("adready_orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id)
        .neq("payment_status", "paid");
      return redirect(failPath);
    }
    const paidAmount = verification.amount ?? 0;
    const expectedAmount = Number(order.amount_toman);
    if (
      !Number.isFinite(expectedAmount) ||
      Math.abs(paidAmount - expectedAmount) > AMOUNT_TOLERANCE
    ) {
      console.error(
        `[adready/verify] amount mismatch: paid=${paidAmount} expected=${expectedAmount} track=${trackId}`
      );
      return redirect(
        `/dashboard/adready/pages/${order.campaign_page_id}?payment=error`
      );
    }

    const { data: campaign, error: campaignError } = await supabase
      .from("campaign_pages")
      .select(
        "id, payment_status, active_package, paid_at, published_at, expires_at"
      )
      .eq("id", order.campaign_page_id)
      .eq("user_id", order.user_id)
      .maybeSingle();
    if (campaignError || !campaign) {
      console.error("[adready/verify] campaign not found", campaignError);
      return redirect(
        `/dashboard/adready/pages/${order.campaign_page_id}?payment=error`
      );
    }

    const paidAt = new Date();
    const preserveLifetime =
      campaign.payment_status === "paid" &&
      campaign.active_package === "lifetime";
    const effectivePackage = preserveLifetime ? "lifetime" : order.package;
    const expiresAt = preserveLifetime
      ? null
      : getAdReadyExpiry(order.package, paidAt, campaign.expires_at);
    const { error: publishError } = await supabase
      .from("campaign_pages")
      .update({
        status: "published",
        plan: effectivePackage,
        payment_status: "paid",
        active_package: effectivePackage,
        paid_at:
          preserveLifetime && campaign.paid_at
            ? campaign.paid_at
            : paidAt.toISOString(),
        published_at: campaign.published_at || paidAt.toISOString(),
        expires_at: expiresAt,
      })
      .eq("id", order.campaign_page_id)
      .eq("user_id", order.user_id);
    if (publishError) {
      console.error("[adready/verify] publish", publishError);
      return redirect(
        `/dashboard/adready/pages/${order.campaign_page_id}?payment=error`
      );
    }

    const { error: paidError } = await supabase
      .from("adready_orders")
      .update({
        payment_status: "paid",
        paid_at: paidAt.toISOString(),
      })
      .eq("id", order.id);
    if (paidError) {
      console.error("[adready/verify] mark order paid", paidError);
    }

    return redirect(
      `/dashboard/adready/pages/${order.campaign_page_id}?paid=1`
    );
  } catch (error) {
    console.error("[adready/verify]", error);
    return redirect(
      `/dashboard/adready/pages/${order.campaign_page_id}?payment=error`
    );
  }
}
