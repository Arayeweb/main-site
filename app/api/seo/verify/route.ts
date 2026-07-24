import { NextRequest, NextResponse } from "next/server";
import { paymentSiteUrl } from "@/lib/paymentCallback";
import { getSupabaseAdmin } from "@/lib/supabase";
import { resolveZibalVerify, zibalVerify } from "@/lib/zibal";
import { tomanToIrr, trackServerAnalyticsEvent } from "@/lib/analytics/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = paymentSiteUrl;

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

// GET — Zibal redirects user back here after payment
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const trackId = sp.get("trackId");
  const status = sp.get("status"); // "OK" or "NOK"
  const success = sp.get("success"); // "true" or "false"

  if (!trackId) {
    return NextResponse.redirect(`${SITE_URL}/seo?payment=error`);
  }

  // If Zibal says payment failed, redirect back with error
  if (status === "NOK" || success === "false") {
    return NextResponse.redirect(`${SITE_URL}/seo?payment=failed&trackId=${trackId}`);
  }

  try {
    const verify = await resolveZibalVerify(trackId, sp);
    if (!verify.ok || !verify.paid) {
      console.error("[seo/verify] zibal verify failed:", verify);
      return NextResponse.redirect(`${SITE_URL}/seo?payment=failed&trackId=${trackId}`);
    }

    const data = { amount: verify.amount, orderId: verify.orderId };
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("leads").insert({
        source: "seo_payment_confirmed",
        page: "seo",
        goal: "seo_service",
        plan: str(data.orderId, 30),
        budget: String(data.amount || 0),
        detail: `zibal_trackId: ${trackId} | status: paid | amount: ${data.amount}`,
        raw: { trackId, status: "paid", amount: data.amount, orderId: data.orderId, verifiedAt: new Date().toISOString() },
        consent: true,
      });
    } catch (e) {
      console.error("[seo/verify] failed to save confirmation lead:", e);
    }

    await trackServerAnalyticsEvent({
      event: "purchase_completed",
      dedupeKey: `purchase:seo:${trackId}`,
      productArea: "seo",
      page: "/seo",
      value: tomanToIrr(data.amount),
      currency: "IRR",
      properties: { payment_provider: "zibal" },
    });

    return NextResponse.redirect(`${SITE_URL}/seo?payment=success&trackId=${trackId}`);
  } catch (e) {
    console.error("[seo/verify] error:", e);
    return NextResponse.redirect(`${SITE_URL}/seo?payment=error&trackId=${trackId}`);
  }
}

// POST — manual verification (e.g., from admin panel)
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const trackId = str(body.trackId, 64);
  if (!trackId) {
    return NextResponse.json({ ok: false, error: "missing_trackId" }, { status: 422 });
  }

  try {
    const verify = await zibalVerify(trackId);
    if (!verify.ok) {
      return NextResponse.json({ ok: false, error: "gateway_error" }, { status: 502 });
    }

    if (verify.paid) {
      return NextResponse.json({ ok: true, status: "paid", amount: verify.amount, trackId });
    }
    return NextResponse.json({ ok: false, status: "not_paid", result: verify.result });
  } catch (e) {
    console.error("[seo/verify] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
