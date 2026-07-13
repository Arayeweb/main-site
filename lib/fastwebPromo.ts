import type { SupabaseClient } from "@supabase/supabase-js";
import { FASTWEB_PACKAGES, type FastWebPackageKey } from "@/lib/fastweb";

export const MIN_FASTWEB_CHECKOUT_TOMAN = 1000;

export interface FastWebPromoResult {
  listAmountToman: number;
  discountToman: number;
  finalAmountToman: number;
  promoCode: string;
  label: string;
}

export type FastWebPromoError = { error: string; message?: string };

function normalizeCode(raw: string | null | undefined): string {
  return String(raw ?? "")
    .trim()
    .toUpperCase();
}

function clampFinal(list: number, discount: number): number {
  return Math.max(MIN_FASTWEB_CHECKOUT_TOMAN, list - discount);
}

/** Resolves a FastWeb promo code against a package list price (no order created). */
export async function resolveFastWebPromoCode(
  supabase: SupabaseClient,
  codeRaw: string | null | undefined,
  packageKey: FastWebPackageKey
): Promise<FastWebPromoResult | FastWebPromoError> {
  const pkg = FASTWEB_PACKAGES[packageKey];
  const listAmountToman = pkg.priceToman;
  const code = normalizeCode(codeRaw);

  if (!code) {
    return { error: "missing_code", message: "کد تخفیف را وارد کنید." };
  }

  const { data: promo } = await supabase
    .from("fastweb_promo_codes")
    .select("id, code, kind, value, max_uses, used_count, expires_at, active")
    .eq("code", code)
    .maybeSingle();

  if (!promo) {
    return { error: "invalid_code", message: "کد معتبر نیست." };
  }
  if (!promo.active) {
    return { error: "code_inactive", message: "این کد غیرفعال است." };
  }
  if (promo.expires_at && new Date(promo.expires_at as string) < new Date()) {
    return { error: "code_expired", message: "مهلت این کد تمام شده." };
  }
  if ((promo.used_count as number) >= (promo.max_uses as number)) {
    return { error: "code_exhausted", message: "سقف استفاده از این کد پر شده." };
  }

  let discountToman = 0;
  if (promo.kind === "percent") {
    discountToman = Math.floor(listAmountToman * (Number(promo.value) / 100));
  } else {
    discountToman = Math.min(
      listAmountToman - MIN_FASTWEB_CHECKOUT_TOMAN,
      Number(promo.value)
    );
  }

  return {
    listAmountToman,
    discountToman,
    finalAmountToman: clampFinal(listAmountToman, discountToman),
    promoCode: promo.code as string,
    label: `کد تخفیف ${promo.code}`,
  };
}
