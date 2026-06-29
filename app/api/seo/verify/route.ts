import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const ZIBAL_API = "https://api.zibal.ir/v1";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

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

  // Verify the transaction with Zibal
  try {
    const res = await fetch(`${ZIBAL_API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        trackId,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[seo/verify] zibal verify error:", res.status, data);
      return NextResponse.redirect(`${SITE_URL}/seo?payment=error&trackId=${trackId}`);
    }

    // result 100 = verified, 201 = already verified, 102 = not found
    if (data.result === 100 || data.result === 201) {
      // Payment confirmed — update lead record
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

      return NextResponse.redirect(`${SITE_URL}/seo?payment=success&trackId=${trackId}`);
    } else {
      console.error("[seo/verify] zibal verify failed:", data);
      return NextResponse.redirect(`${SITE_URL}/seo?payment=failed&trackId=${trackId}`);
    }
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
    const res = await fetch(`${ZIBAL_API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant: ZIBAL_MERCHANT, trackId }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      return NextResponse.json({ ok: false, error: "gateway_error" }, { status: 502 });
    }

    if (data.result === 100 || data.result === 201) {
      return NextResponse.json({ ok: true, status: "paid", amount: data.amount, trackId });
    } else {
      return NextResponse.json({ ok: false, status: "not_paid", result: data.result });
    }
  } catch (e) {
    console.error("[seo/verify] POST error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
