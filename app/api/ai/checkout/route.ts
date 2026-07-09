import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getAISession } from "@/lib/aiAuth";
import { AI_PACKAGES } from "@/lib/aiPackages";
import { resolveCode } from "@/lib/aiPromo";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";
import { zibalRequest } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = getAISession(req);
  if (!session) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const packageId = String(body.packageId ?? "");
  const code = body.code != null ? String(body.code) : "";
  const utmSource = body.utm_source != null ? String(body.utm_source).slice(0, 200) : null;
  const utmMedium = body.utm_medium != null ? String(body.utm_medium).slice(0, 200) : null;
  const utmCampaign = body.utm_campaign != null ? String(body.utm_campaign).slice(0, 200) : null;
  const pkg = AI_PACKAGES[packageId];
  if (!pkg || !pkg.checkoutEnabled) {
    return jsonNoStore({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  const supabase = getSupabaseAdmin();
  const resolved = await resolveCode(supabase, code, session.userId, packageId);
  if ("error" in resolved) {
    return jsonNoStore(
      { ok: false, error: resolved.error, message: resolved.message },
      { status: 422 }
    );
  }

  const { data: user } = await supabase
    .from("ai_users")
    .select("id, phone")
    .eq("id", session.userId)
    .maybeSingle();

  if (!user) {
    return jsonNoStore({ ok: false, error: "user_not_found" }, { status: 404 });
  }

  const finalAmount = resolved.finalAmountToman;
  const orderId = `arena-${pkg.id}-${String(user.id).slice(0, 8)}-${Date.now()}`;

  const zibal = await zibalRequest({
    amountToman: finalAmount,
    callbackUrl: getPaymentCallbackUrl("ai", "/api/ai/verify"),
    description: `آرایه Arena — پکیج ${pkg.name} (${pkg.credits} کردیت)`,
    orderId,
    mobile: (user.phone as string) || undefined,
  });

  if (!zibal.ok || !zibal.trackId) {
    return jsonNoStore(
      { ok: false, error: zibal.error || "gateway_error" },
      { status: 502 }
    );
  }

  const { error: orderErr } = await supabase.from("ai_orders").insert({
    user_id: session.userId,
    package_id: pkg.id,
    amount_toman: finalAmount,
    list_amount_toman: resolved.listAmountToman,
    discount_toman: resolved.discountToman,
    promo_code: resolved.promoCode || null,
    referral_code: resolved.referralCode || null,
    referrer_user_id: resolved.referrerUserId || null,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    credits_granted: pkg.credits,
    zibal_track_id: zibal.trackId,
    status: "pending",
  });

  if (orderErr) {
    console.error("[api/ai/checkout] order insert:", orderErr);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }

  return jsonNoStore({ ok: true, redirectUrl: zibal.redirectUrl });
}
