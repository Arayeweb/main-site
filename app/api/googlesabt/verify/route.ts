import { NextRequest, NextResponse } from "next/server";
import { paymentSiteUrl } from "@/lib/paymentCallback";
import { getSupabaseAdmin } from "@/lib/supabase";
import { resolveZibalVerify } from "@/lib/zibal";
import { tomanToIrr, trackServerAnalyticsEvent } from "@/lib/analytics/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = paymentSiteUrl;

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const trackId = sp.get("trackId");
  const status = sp.get("status");
  const success = sp.get("success");

  if (!trackId) {
    return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=error`);
  }

  if (status === "NOK" || success === "false") {
    return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=failed&trackId=${trackId}`);
  }

  try {
    const verify = await resolveZibalVerify(trackId, sp);
    if (!verify.ok || !verify.paid) {
      console.error("[googlesabt/verify] zibal verify failed:", verify);
      return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=failed&trackId=${trackId}`);
    }

    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("leads").insert({
        source: "googlesabt_payment_confirmed",
        page: "googlesabt",
        goal: "map_register",
        plan: str(verify.orderId, 60),
        budget: String(verify.amount || 0),
        channel: "googlesabt_landing",
        detail: `zibal_trackId: ${trackId} | status: paid | amount: ${verify.amount}`,
        raw: {
          trackId,
          status: "paid",
          amount: verify.amount,
          orderId: verify.orderId,
          verifiedAt: new Date().toISOString(),
        },
        consent: true,
      });
    } catch (e) {
      console.error("[googlesabt/verify] failed to save confirmation lead:", e);
    }

    await trackServerAnalyticsEvent({
      event: "purchase_completed",
      dedupeKey: `purchase:googlesabt:${trackId}`,
      productArea: "local_seo",
      page: "/googlesabt",
      value: tomanToIrr(verify.amount),
      currency: "IRR",
      properties: { payment_provider: "zibal" },
    });

    return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=success&trackId=${trackId}`);
  } catch (e) {
    console.error("[googlesabt/verify] error:", e);
    return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=error&trackId=${trackId}`);
  }
}
