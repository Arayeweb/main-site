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
    return NextResponse.redirect(`${SITE_URL}/doctors?payment=error`);
  }

  if (status === "NOK" || success === "false") {
    return NextResponse.redirect(`${SITE_URL}/doctors?payment=failed&trackId=${trackId}`);
  }

  try {
    const verify = await resolveZibalVerify(trackId, sp);
    if (!verify.ok || !verify.paid) {
      console.error("[doctors/verify] zibal verify failed:", verify);
      return NextResponse.redirect(`${SITE_URL}/doctors?payment=failed&trackId=${trackId}`);
    }

    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("leads").insert({
        source: "doctors_payment_confirmed",
        page: "doctors",
        goal: "doctor_site",
        plan: str(verify.orderId, 60),
        budget: String(verify.amount || 0),
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
      console.error("[doctors/verify] failed to save confirmation lead:", e);
    }

    await trackServerAnalyticsEvent({
      event: "purchase_completed",
      dedupeKey: `purchase:doctors:${trackId}`,
      productArea: "healthcare",
      page: "/doctors",
      value: tomanToIrr(verify.amount),
      currency: "IRR",
      properties: { payment_provider: "zibal" },
    });

    return NextResponse.redirect(`${SITE_URL}/doctors?payment=success&trackId=${trackId}`);
  } catch (e) {
    console.error("[doctors/verify] error:", e);
    return NextResponse.redirect(`${SITE_URL}/doctors?payment=error&trackId=${trackId}`);
  }
}
