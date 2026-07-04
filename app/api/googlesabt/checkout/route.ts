import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { GOOGLESABT_PACKAGES, type GooglesabtPackageKey } from "@/lib/googlesabtData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const ZIBAL_API = "https://api.zibal.ir/v1";
const ZIBAL_GATEWAY = "https://gateway.zibal.ir/start";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const pkgKey = str(body.package, 30) as GooglesabtPackageKey | null;
  if (!pkgKey || !GOOGLESABT_PACKAGES[pkgKey]) {
    return NextResponse.json({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  const pkg = GOOGLESABT_PACKAGES[pkgKey];
  const amount = pkg.deposit;

  if (amount <= 0) {
    return NextResponse.json({ ok: false, error: "zero_amount" }, { status: 422 });
  }

  const businessName = str(body.businessName, 200) || str(body.name, 200) || "";
  const contact = str(body.contact, 200) || "";

  const callbackUrl = `${SITE_URL}/api/googlesabt/verify`;

  try {
    const res = await fetch(`${ZIBAL_API}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        amount,
        callbackUrl,
        description: `آرایه ثبت گوگل - پیش‌پرداخت پکیج ${pkg.name} - ${businessName}`,
        mobile: contact,
        orderId: `googlesabt-${pkgKey}-${Date.now()}`,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[googlesabt/checkout] zibal request error:", res.status, data);
      return NextResponse.json({ ok: false, error: "gateway_error" }, { status: 502 });
    }

    if (data.result !== 100 || !data.trackId) {
      console.error("[googlesabt/checkout] zibal rejected:", data);
      return NextResponse.json(
        { ok: false, error: "gateway_rejected", detail: data.message || data.result },
        { status: 400 }
      );
    }

    const trackId = String(data.trackId);

    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("leads").insert({
        source: "googlesabt_checkout",
        page: "googlesabt",
        name: businessName || null,
        contact: contact || null,
        goal: "map_register",
        plan: pkgKey,
        budget: String(pkg.price),
        channel: "googlesabt_landing",
        detail: `zibal_trackId: ${trackId} | package: ${pkg.name} | deposit: ${amount} | includesBizcard: ${pkg.includesBizcard}`,
        raw: {
          trackId,
          amount,
          deposit: true,
          fullPrice: pkg.price,
          package: pkgKey,
          businessName,
          contact,
          includesBizcard: pkg.includesBizcard,
          status: "pending_payment",
        },
        consent: true,
      });
    } catch (e) {
      console.error("[googlesabt/checkout] failed to save lead:", e);
    }

    const redirectUrl = `${ZIBAL_GATEWAY}/${trackId}`;
    return NextResponse.json({ ok: true, redirectUrl, trackId });
  } catch (e) {
    console.error("[googlesabt/checkout] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
