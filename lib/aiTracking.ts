import { getUtmParams } from "@/lib/utm";
import { pushGtmEvent } from "@/lib/gtm";
import { recordPageview } from "@/lib/pageviewTracking";
import { captureAiEvent } from "@/lib/posthog/client";

/** ثبت بازدید صفحات /ai در page_views + PostHog */
export function recordAiPageview(page: string) {
  recordPageview(page);
  captureAiEvent("$pageview", { page, section: "ai" });
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
  const props = {
    page: "ai_pricing",
    package: payload.packageId,
    value: payload.amountToman,
    currency: "IRR",
    promo_code: payload.promoCode,
    ...utm,
  };
  pushGtmEvent("begin_checkout", props);
  captureAiEvent("begin_checkout", props);
}

export function trackAiPurchase(payload: {
  packageId?: string;
  amountToman?: number;
  promoCode?: string;
}) {
  const utm = getUtmParams();
  const props = {
    page: "ai",
    package: payload.packageId,
    value: payload.amountToman,
    currency: "IRR",
    promo_code: payload.promoCode,
    ...utm,
  };
  pushGtmEvent("purchase", props);
  captureAiEvent("purchase", props);
}

export function trackAiSignup() {
  const utm = getUtmParams();
  const props = { page: "ai", method: "phone", ...utm };
  pushGtmEvent("sign_up", props);
  captureAiEvent("sign_up", props);
}
