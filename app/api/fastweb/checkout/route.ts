import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import {
  FASTWEB_PACKAGES,
  isFastWebPackageKey,
  isUuid,
  normalizeIranPhone,
  type FastWebBrief,
} from "@/lib/fastweb";
import { getPaymentCallbackUrl } from "@/lib/paymentCallback";
import { resolveFastWebPromoCode } from "@/lib/fastwebPromo";
import { getSupabaseAdmin } from "@/lib/supabase";
import { zibalRequest } from "@/lib/zibal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const orderId = typeof body.orderId === "string" ? body.orderId : "";
  const accessToken =
    typeof body.accessToken === "string" ? body.accessToken : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone : "";
  const phone = normalizeIranPhone(phoneRaw);
  const packageKey = isFastWebPackageKey(body.package) ? body.package : null;
  const promoCodeRaw =
    typeof body.promoCode === "string" ? body.promoCode.trim() : "";

  if (!isUuid(orderId) || !accessToken) {
    return jsonNoStore({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!phone) {
    return jsonNoStore({ ok: false, error: "invalid_phone" }, { status: 422 });
  }
  if (!packageKey) {
    return jsonNoStore({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  const pkg = FASTWEB_PACKAGES[packageKey];

  try {
    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("fastweb_orders")
      .select("*")
      .eq("id", orderId)
      .eq("access_token", accessToken)
      .maybeSingle();

    if (error || !row) {
      return jsonNoStore({ ok: false, error: "not_found" }, { status: 404 });
    }

    if (row.payment_status === "paid") {
      return jsonNoStore({
        ok: true,
        alreadyPaid: true,
        redirectUrl: `/dashboard/fastweb/${orderId}?paid=1`,
      });
    }

    const brief = {
      ...((row.brief as FastWebBrief) || {}),
      contacts: {
        ...(((row.brief as FastWebBrief)?.contacts) || {}),
        phone,
      },
    };

    let amountToman: number = pkg.priceToman;
    let discountToman = 0;
    let appliedPromoCode: string | null = null;

    if (promoCodeRaw) {
      const promo = await resolveFastWebPromoCode(
        supabase,
        promoCodeRaw,
        packageKey
      );
      if ("error" in promo) {
        return jsonNoStore(
          { ok: false, error: promo.error, message: promo.message },
          { status: 422 }
        );
      }
      amountToman = promo.finalAmountToman;
      discountToman = promo.discountToman;
      appliedPromoCode = promo.promoCode;
    }

    const callbackUrl = getPaymentCallbackUrl(
      "fastweb",
      "/api/fastweb/verify"
    );

    const zibal = await zibalRequest({
      amountToman,
      callbackUrl,
      description: `آرایه سایت فوری - ${pkg.name} - ${row.business_name || phone}`,
      orderId: `fastweb-${orderId}`,
      mobile: phone,
    });

    if (!zibal.ok || !zibal.trackId || !zibal.redirectUrl) {
      return jsonNoStore(
        { ok: false, error: zibal.error || "gateway_error" },
        { status: 502 }
      );
    }

    const { error: upErr } = await supabase
      .from("fastweb_orders")
      .update({
        phone,
        brief,
        package: packageKey,
        amount_toman: amountToman,
        discount_toman: discountToman,
        promo_code: appliedPromoCode,
        payment_status: "pending",
        zibal_track_id: zibal.trackId,
      })
      .eq("id", orderId)
      .eq("access_token", accessToken);

    if (upErr) {
      console.error("[fastweb/checkout] update", upErr);
      return jsonNoStore({ ok: false, error: "db_error" }, { status: 500 });
    }

    return jsonNoStore({
      ok: true,
      trackId: zibal.trackId,
      redirectUrl: zibal.redirectUrl,
    });
  } catch (e) {
    console.error("[fastweb/checkout]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
