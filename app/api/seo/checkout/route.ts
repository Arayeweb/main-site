import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";
import { getSeoCheckoutPackages } from "@/lib/seoData";
import { zibalRequest } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Valid SEO packages with their prices (toman) — synced from lib/seoData.ts
const SEO_PACKAGES = getSeoCheckoutPackages();

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

  const pkgKey = str(body.package, 30);
  if (!pkgKey || !SEO_PACKAGES[pkgKey]) {
    return NextResponse.json({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  const pkg = SEO_PACKAGES[pkgKey];
  const amount = pkg.price;

  // Amount must be > 0 for Zibal
  if (amount <= 0) {
    return NextResponse.json({ ok: false, error: "zero_amount" }, { status: 422 });
  }

  const name = str(body.name, 200) || "";
  const contact = str(body.contact, 200) || "";
  const website = str(body.website, 500) || "";

  const callbackUrl = getPaymentCallbackUrl("seo", "/api/seo/verify");

  try {
    const zibal = await zibalRequest({
      amountToman: amount,
      callbackUrl,
      description: `سئو آرایه - پکیج ${pkg.name} - ${name}`,
      mobile: contact,
      orderId: `seo-${pkgKey}-${Date.now()}`,
    });

    if (!zibal.ok || !zibal.trackId || !zibal.redirectUrl) {
      console.error("[seo/checkout] zibal rejected:", zibal.error);
      return NextResponse.json(
        { ok: false, error: "gateway_rejected", detail: zibal.error },
        { status: 400 }
      );
    }

    const trackId = zibal.trackId;

    // Save transaction record to Supabase for reconciliation
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("leads").insert({
        source: "seo_checkout",
        page: "seo",
        name: name || null,
        contact: contact || null,
        goal: "seo_service",
        plan: pkgKey,
        budget: String(amount),
        detail: `zibal_trackId: ${trackId} | package: ${pkg.name} | website: ${website}`,
        raw: { trackId, amount, package: pkgKey, name, contact, website, status: "pending_payment" },
        consent: true,
      });
    } catch (e) {
      console.error("[seo/checkout] failed to save lead:", e);
      // Don't fail the checkout if lead save fails — payment is the priority
    }

    return NextResponse.json({ ok: true, redirectUrl: zibal.redirectUrl, trackId });
  } catch (e) {
    console.error("[seo/checkout] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
