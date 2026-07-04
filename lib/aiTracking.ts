import { getUtmParams } from "@/lib/utm";
import { pushGtmEvent } from "@/lib/gtm";
import { recordPageview } from "@/lib/pageviewTracking";

/** ثبت بازدید صفحات /ai در page_views */
export function recordAiPageview(page: string) {
  recordPageview(page);
}

/** خواندن UTM از URL و ذخیره در sessionStorage — قبل از replaceState صدا بزن */
export function captureCampaignParams(): Record<string, string> {
  return getUtmParams();
}

export function trackAiBeginCheckout(payload: {
  packageId: string;
  amountToman: number;
  promoCode?: string;
}) {
  const utm = getUtmParams();
  pushGtmEvent("begin_checkout", {
    page: "ai_pricing",
    package: payload.packageId,
    value: payload.amountToman,
    currency: "IRR",
    promo_code: payload.promoCode,
    ...utm,
  });
}

export function trackAiPurchase(payload: {
  packageId?: string;
  amountToman?: number;
  promoCode?: string;
}) {
  const utm = getUtmParams();
  pushGtmEvent("purchase", {
    page: "ai",
    package: payload.packageId,
    value: payload.amountToman,
    currency: "IRR",
    promo_code: payload.promoCode,
    ...utm,
  });
}

export function trackAiSignup() {
  const utm = getUtmParams();
  pushGtmEvent("sign_up", { page: "ai", method: "phone", ...utm });
}
