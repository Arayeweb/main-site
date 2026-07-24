import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  applyGooglesabtDiscount,
  GOOGLESABT_PACKAGES,
  resolveGooglesabtDiscount,
  type GooglesabtPackageKey,
} from "@/lib/googlesabtData";

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

function makeTrackId(): string {
  return `GS${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

/**
 * Lead-only checkout: no payment gateway.
 * Experts call the customer after the request is saved.
 */
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
  const businessName = str(body.businessName, 200) || str(body.name, 200) || "";
  const contact = str(body.contact, 200) || "";
  if (!contact) {
    return NextResponse.json({ ok: false, error: "missing_contact" }, { status: 422 });
  }

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
  const contactName = str(body.contactName, 80);
  const preferredCallWindow = str(body.preferredCallWindow, 20) || "anytime";
  const contactChannel = str(body.contactChannel, 20) || "call";

  const discount = resolveGooglesabtDiscount(str(body.discountCode, 40));
  const listPrice = pkg.price;
  const finalPrice = discount
    ? applyGooglesabtDiscount(listPrice, discount.percent)
    : listPrice;

  const trackId = makeTrackId();

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("leads").insert({
      source: "googlesabt_request",
      page: "googlesabt",
      name: businessName || null,
      contact,
      goal: "map_register",
      plan: pkgKey,
      budget: String(finalPrice),
      channel: "googlesabt_landing",
      detail:
        `trackId: ${trackId} | package: ${pkg.name} | list: ${listPrice} | final: ${finalPrice}` +
        ` | discount: ${discount ? `${discount.code} (${discount.percent}%)` : "none"}` +
        ` | includesBizcard: ${pkg.includesBizcard}` +
        ` | contactName: ${contactName || "-"}` +
        ` | callWindow: ${preferredCallWindow} | via: ${contactChannel}` +
        ` | category: ${category || "-"} | ${province || "-"}/${city || "-"}` +
        ` | hours: ${openTime || "-"}-${closeTime || "-"} | days: ${weekdays.join(",")}` +
        ` | flow: expert_callback`,
      raw: {
        trackId,
        amount: finalPrice,
        listPrice,
        fullPayment: false,
        paymentDeferred: true,
        fullPrice: pkg.price,
        package: pkgKey,
        businessName,
        contactName,
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
        preferredCallWindow,
        contactChannel,
        includesBizcard: pkg.includesBizcard,
        discountCode: discount?.code ?? null,
        discountPercent: discount?.percent ?? 0,
        status: "awaiting_expert_call",
      },
      consent: true,
    });

    if (error) {
      console.error("[googlesabt/checkout] failed to save lead:", error.message);
      return NextResponse.json({ ok: false, error: "lead_save_failed" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      trackId,
      finalPrice,
      discountCode: discount?.code ?? null,
      message: "request_saved",
    });
  } catch (e) {
    console.error("[googlesabt/checkout] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
