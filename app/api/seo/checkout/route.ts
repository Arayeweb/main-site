import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zibal merchant config — via env vars
const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const ZIBAL_API = "https://api.zibal.ir/v1";
const ZIBAL_GATEWAY = "https://gateway.zibal.ir/start";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com";

// Valid SEO packages with their prices (toman)
const SEO_PACKAGES: Record<string, { name: string; price: number }> = {
  basic: { name: "پایه", price: 890000 },
  growth: { name: "رشد", price: 1690000 },
  pro: { name: "حرفه‌ای", price: 2900000 },
  bundle: { name: "ترکیبی سئو+گوگل", price: 3100000 },
};

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

  const callbackUrl = `${SITE_URL}/api/seo/verify`;

  // Create transaction in Zibal
  try {
    const res = await fetch(`${ZIBAL_API}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        amount,
        callbackUrl,
        description: `سئو آرایه - پکیج ${pkg.name} - ${name}`,
        mobile: contact, // optional — Zibal can auto-fill
        orderId: `seo-${pkgKey}-${Date.now()}`,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data) {
      console.error("[seo/checkout] zibal request error:", res.status, data);
      return NextResponse.json({ ok: false, error: "gateway_error" }, { status: 502 });
    }

    // Zibal returns { result: 100, trackId: 12345, ... }
    if (data.result !== 100 || !data.trackId) {
      console.error("[seo/checkout] zibal rejected:", data);
      return NextResponse.json({ ok: false, error: "gateway_rejected", detail: data.message || data.result }, { status: 400 });
    }

    const trackId = String(data.trackId);

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

    const redirectUrl = `${ZIBAL_GATEWAY}/${trackId}`;
    return NextResponse.json({ ok: true, redirectUrl, trackId });
  } catch (e) {
    console.error("[seo/checkout] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
