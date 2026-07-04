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
    const res = await fetch(`${ZIBAL_API}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ merchant: ZIBAL_MERCHANT, trackId }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[googlesabt/verify] zibal verify error:", res.status, data);
      return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=error&trackId=${trackId}`);
    }

    if (data.result === 100 || data.result === 201) {
      try {
        const supabase = getSupabaseAdmin();
        await supabase.from("leads").insert({
          source: "googlesabt_payment_confirmed",
          page: "googlesabt",
          goal: "map_register",
          plan: str(data.orderId, 60),
          budget: String(data.amount || 0),
          channel: "googlesabt_landing",
          detail: `zibal_trackId: ${trackId} | status: paid | amount: ${data.amount}`,
          raw: {
            trackId,
            status: "paid",
            amount: data.amount,
            orderId: data.orderId,
            verifiedAt: new Date().toISOString(),
          },
          consent: true,
        });
      } catch (e) {
        console.error("[googlesabt/verify] failed to save confirmation lead:", e);
      }

      return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=success&trackId=${trackId}`);
    }

    console.error("[googlesabt/verify] zibal verify failed:", data);
    return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=failed&trackId=${trackId}`);
  } catch (e) {
    console.error("[googlesabt/verify] error:", e);
    return NextResponse.redirect(`${SITE_URL}/googlesabt?payment=error&trackId=${trackId}`);
  }
}
