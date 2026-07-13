import { NextRequest } from "next/server";
import { jsonNoStore } from "@/lib/apiHeaders";
import { isFastWebPackageKey } from "@/lib/fastweb";
import { resolveFastWebPromoCode } from "@/lib/fastwebPromo";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Preview discount for a package + promo code (no order mutation). */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const packageKey = isFastWebPackageKey(body.package) ? body.package : null;
  const promoCode = typeof body.promoCode === "string" ? body.promoCode : "";

  if (!packageKey) {
    return jsonNoStore({ ok: false, error: "invalid_package" }, { status: 422 });
  }

  try {
    const result = await resolveFastWebPromoCode(
      getSupabaseAdmin(),
      promoCode,
      packageKey
    );

    if ("error" in result) {
      return jsonNoStore(
        { ok: false, error: result.error, message: result.message },
        { status: 422 }
      );
    }

    return jsonNoStore({
      ok: true,
      listAmountToman: result.listAmountToman,
      discountToman: result.discountToman,
      finalAmountToman: result.finalAmountToman,
      promoCode: result.promoCode,
      label: result.label,
    });
  } catch (e) {
    console.error("[fastweb/apply-coupon]", e);
    return jsonNoStore({ ok: false, error: "server_error" }, { status: 500 });
  }
}
