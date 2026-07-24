import { getUtmParams } from "@/lib/utm";
import { pushGtmEvent } from "@/lib/gtm";
import { recordPageview } from "@/lib/pageviewTracking";
import { captureAiEvent } from "@/lib/posthog/client";

const LANDING_STORAGE_KEY = "ai_landing_type";

/** ثبت بازدید صفحات /ai در page_views + PostHog */
export function recordAiPageview(page: string) {
  recordPageview(page);
  captureAiEvent("$pageview", { page, section: "ai" });
}

/** خواندن UTM از URL و ذخیره در sessionStorage — قبل از replaceState حتماً بزن */
export function captureCampaignParams(): Record<string, string> {
  return getUtmParams();
}

export type AiLandingCtaKind = "primary" | "secondary" | "nav_login";

export function getClientDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 720) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

function landingBaseProps(landing_type: string, extra?: Record<string, string | number | undefined>) {
  const utm = getUtmParams();
  return {
    landing_type,
    source: utm.utm_source || undefined,
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    device_type: getClientDeviceType(),
    ...extra,
  };
}

export function storeAiLandingType(landingType: string) {
  try {
    sessionStorage.setItem(LANDING_STORAGE_KEY, landingType);
  } catch {
    /* ignore */
  }
}

export function getStoredAiLandingType(): string | null {
  try {
    return sessionStorage.getItem(LANDING_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function trackAiLandingView(payload: { landing_type: string }) {
  const props = landingBaseProps(payload.landing_type);
  pushGtmEvent("ai_landing_view", props);
  captureAiEvent("ai_landing_view", props);
}

export function trackAiLandingCta(payload: {
  landing_type: string;
  cta: AiLandingCtaKind;
  href?: string;
  placement?: string;
}) {
  const event =
    payload.cta === "secondary" ? "ai_landing_secondary_cta" : "ai_landing_primary_cta";
  const props = landingBaseProps(payload.landing_type, {
    cta: payload.cta,
    href: payload.href,
    placement: payload.placement,
  });
  pushGtmEvent(event, props);
  captureAiEvent(event, props);
}

export function trackAiPromptExampleClick(payload: {
  landing_type: string;
  prompt_index: number;
}) {
  const props = landingBaseProps(payload.landing_type, {
    prompt_index: payload.prompt_index,
  });
  pushGtmEvent("ai_prompt_example_click", props);
  captureAiEvent("ai_prompt_example_click", props);
}

export function trackAiCompareDemoInteraction(payload: {
  landing_type: string;
  action: string;
  model?: string;
}) {
  const props = landingBaseProps(payload.landing_type, {
    action: payload.action,
    model: payload.model,
  });
  pushGtmEvent("ai_compare_demo_interaction", props);
  captureAiEvent("ai_compare_demo_interaction", props);
}

export function trackAiSignupStart(payload?: { landing_type?: string }) {
  const landing_type = payload?.landing_type || getStoredAiLandingType() || "ai";
  const props = landingBaseProps(landing_type);
  pushGtmEvent("ai_signup_start", props);
  captureAiEvent("ai_signup_start", props);
}

export function trackAiFirstMessage(payload?: { landing_type?: string }) {
  const landing_type = payload?.landing_type || getStoredAiLandingType() || "ai";
  const props = landingBaseProps(landing_type);
  pushGtmEvent("ai_first_message", props);
  captureAiEvent("ai_first_message", props);
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
    value: payload.amountToman * 10,
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
    value:
      typeof payload.amountToman === "number"
        ? payload.amountToman * 10
        : undefined,
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
