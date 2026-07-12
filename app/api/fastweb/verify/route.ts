import { NextRequest, NextResponse } from "next/server";
import { paymentSiteUrl } from "@/lib/paymentCallback";
import { setFastWebSessionCookie } from "@/lib/fastwebSession";
import { getSupabaseAdmin } from "@/lib/supabase";
import { resolveZibalVerify } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = paymentSiteUrl;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const trackId = sp.get("trackId");
  const status = sp.get("status");
  const success = sp.get("success");

  if (!trackId) {
    return NextResponse.redirect(`${SITE_URL}/fastweb/new?payment=error`);
  }

  if (status === "NOK" || success === "false") {
    return NextResponse.redirect(
      `${SITE_URL}/fastweb/new?payment=failed&trackId=${trackId}`
    );
  }

  try {
    const verify = await resolveZibalVerify(trackId, sp);
    if (!verify.ok || !verify.paid) {
      console.error("[fastweb/verify] failed:", verify);
      return NextResponse.redirect(
        `${SITE_URL}/fastweb/new?payment=failed&trackId=${trackId}`
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("fastweb_orders")
      .select("id, access_token, payment_status")
      .eq("zibal_track_id", trackId)
      .maybeSingle();

    if (error || !row) {
      console.error("[fastweb/verify] order not found", error);
      return NextResponse.redirect(
        `${SITE_URL}/fastweb/new?payment=error&trackId=${trackId}`
      );
    }

    if (row.payment_status !== "paid") {
      const { error: upErr } = await supabase
        .from("fastweb_orders")
        .update({
          payment_status: "paid",
          fulfillment_status: "received",
          paid_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      if (upErr) {
        console.error("[fastweb/verify] update", upErr);
        return NextResponse.redirect(
          `${SITE_URL}/fastweb/new?payment=error&trackId=${trackId}`
        );
      }
    }

    const res = NextResponse.redirect(
      `${SITE_URL}/dashboard/fastweb/${row.id}?paid=1`
    );
    setFastWebSessionCookie(res, row.id, row.access_token);
    return res;
  } catch (e) {
    console.error("[fastweb/verify]", e);
    return NextResponse.redirect(
      `${SITE_URL}/fastweb/new?payment=error&trackId=${trackId}`
    );
  }
}
