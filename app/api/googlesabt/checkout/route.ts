import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { GOOGLESABT_PACKAGES, type GooglesabtPackageKey } from "@/lib/googlesabtData";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";
import { zibalRequest } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function str(v: unknown, max = 500): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

function num(v: unknown): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
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
  const category = str(body.category, 80);
  const province = str(body.province, 80);
  const city = str(body.city, 80);
  const address = str(body.address, 500);
  const lat = num(body.lat);
  const lng = num(body.lng);
  const openTime = str(body.openTime, 16);
  const closeTime = str(body.closeTime, 16);
  const weekdays = Array.isArray(body.weekdays)
    ? body.weekdays.map((d) => String(d).slice(0, 12)).filter(Boolean).slice(0, 7)
    : [];

  const callbackUrl = getPaymentCallbackUrl("googlesabt", "/api/googlesabt/verify");

  try {
    const zibal = await zibalRequest({
      amountToman: amount,
      callbackUrl,
      description: `آرایه ثبت گوگل - پیش‌پرداخت پکیج ${pkg.name} - ${businessName}`,
      mobile: contact,
      orderId: `googlesabt-${pkgKey}-${Date.now()}`,
    });

    if (!zibal.ok || !zibal.trackId || !zibal.redirectUrl) {
      console.error("[googlesabt/checkout] zibal rejected:", zibal.error);
      return NextResponse.json(
        { ok: false, error: "gateway_rejected", detail: zibal.error },
        { status: 400 }
      );
    }

    const trackId = zibal.trackId;

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
        detail:
          `zibal_trackId: ${trackId} | package: ${pkg.name} | deposit: ${amount}` +
          ` | includesBizcard: ${pkg.includesBizcard}` +
          ` | category: ${category || "-"} | ${province || "-"}/${city || "-"}` +
          ` | hours: ${openTime || "-"}-${closeTime || "-"} | days: ${weekdays.join(",")}`,
        raw: {
          trackId,
          amount,
          deposit: true,
          fullPrice: pkg.price,
          package: pkgKey,
          businessName,
          contact,
          category,
          province,
          city,
          address,
          lat,
          lng,
          openTime,
          closeTime,
          weekdays,
          includesBizcard: pkg.includesBizcard,
          status: "pending_payment",
        },
        consent: true,
      });
    } catch (e) {
      console.error("[googlesabt/checkout] failed to save lead:", e);
    }

    return NextResponse.json({ ok: true, redirectUrl: zibal.redirectUrl, trackId });
  } catch (e) {
    console.error("[googlesabt/checkout] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
