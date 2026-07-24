// First-party campaign attribution shared by marketing pages and product surfaces.
// Standard utm_* fields represent the active session campaign. Lifetime first-touch
// and latest-touch values are carried separately for attribution comparisons.

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;
export type TrafficType =
  | "paid"
  | "organic"
  | "social"
  | "email"
  | "referral"
  | "direct"
  | "internal";

export type UtmAttribution = UtmParams & {
  first_utm_source?: string;
  first_utm_medium?: string;
  first_utm_campaign?: string;
  first_utm_content?: string;
  first_utm_term?: string;
  last_utm_source?: string;
  last_utm_medium?: string;
  last_utm_campaign?: string;
  last_utm_content?: string;
  last_utm_term?: string;
  landing_page?: string;
  first_landing_page?: string;
  initial_referrer?: string;
  traffic_type: TrafficType;
  click_id_type?: "gclid" | "fbclid" | "msclkid" | "yclid";
  has_click_id?: boolean;
};

const LEGACY_STORAGE_KEY = "__utms";
const SESSION_TOUCH_KEY = "__ary_utm_session_touch";
const LAST_TOUCH_KEY = "__ary_utm_last_touch";
const FIRST_TOUCH_KEY = "__ary_utm_first_touch";
const SESSION_LANDING_KEY = "__ary_session_landing";
const FIRST_LANDING_KEY = "__ary_first_landing";
const INITIAL_REFERRER_KEY = "__ary_initial_referrer";

/** کد تخفیف کمپین — جدا از arena_ref_code (معرفی کاربر) */
export const ARENA_PROMO_STORAGE_KEY = "arena_promo_code";
export const ARENA_REF_STORAGE_KEY = "arena_ref_code";

function readJson(storage: Storage, key: string): Record<string, string> {
  try {
    const value = JSON.parse(storage.getItem(key) || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function writeJson(storage: Storage, key: string, value: Record<string, string>) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing; analytics must not break UX.
  }
}

export function normalizeUtmValue(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/[^\p{L}\p{N}_:.+]/gu, "")
    .replace(/_+/g, "_")
    .slice(0, 200);
  return normalized || undefined;
}

export function normalizeUtmParams(input: Record<string, string | undefined>): UtmParams {
  const output: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = normalizeUtmValue(input[key]);
    if (value) output[key] = value;
  }
  return output;
}

export function inferCampaignFromReferrer(
  referrer: string,
  currentOrigin: string,
): { params: UtmParams; trafficType: TrafficType } {
  if (!referrer) return { params: {}, trafficType: "direct" };
  try {
    const url = new URL(referrer);
    if (url.origin === currentOrigin) return { params: {}, trafficType: "internal" };
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (/google\.|bing\.com$|duckduckgo\.com$|yahoo\./.test(host)) {
      return {
        params: { utm_source: host.split(".")[0], utm_medium: "organic" },
        trafficType: "organic",
      };
    }
    if (/instagram\.com$|t\.me$|telegram\.me$|linkedin\.com$|x\.com$|twitter\.com$|facebook\.com$/.test(host)) {
      return {
        params: { utm_source: host.split(".")[0], utm_medium: "social" },
        trafficType: "social",
      };
    }
    return {
      params: { utm_source: host, utm_medium: "referral" },
      trafficType: "referral",
    };
  } catch {
    return { params: {}, trafficType: "direct" };
  }
}

export function trafficTypeFor(params: UtmParams, fallback: TrafficType = "direct"): TrafficType {
  const medium = params.utm_medium || "";
  if (/^(cpc|ppc|paid|paid_social|display|affiliate|retargeting)$/.test(medium)) return "paid";
  if (medium === "organic") return "organic";
  if (/^(social|social_media)$/.test(medium)) return "social";
  if (/^(email|newsletter|sms)$/.test(medium)) return "email";
  if (medium === "referral") return "referral";
  if (medium === "internal") return "internal";
  return Object.keys(params).length ? fallback : "direct";
}

function paramsFromUrl(search: string): {
  params: UtmParams;
  clickIdType?: UtmAttribution["click_id_type"];
} {
  const query = new URLSearchParams(search);
  const raw: Record<string, string | undefined> = {};
  for (const key of UTM_KEYS) raw[key] = query.get(key) || undefined;

  const src = query.get("src");
  if (src && !raw.utm_source) {
    raw.utm_source = src;
    raw.utm_medium = raw.utm_medium || "referral";
  }
  const source = query.get("source");
  if (source && !raw.utm_source) {
    raw.utm_source = source;
    raw.utm_medium = raw.utm_medium || "internal";
  }
  const promptSlug = query.get("promptSlug");
  if (promptSlug && !raw.utm_content) raw.utm_content = `prompt:${promptSlug}`;

  let clickIdType: UtmAttribution["click_id_type"];
  if (query.get("gclid")) clickIdType = "gclid";
  else if (query.get("fbclid")) clickIdType = "fbclid";
  else if (query.get("msclkid")) clickIdType = "msclkid";
  else if (query.get("yclid")) clickIdType = "yclid";

  if (clickIdType && !raw.utm_source) {
    const defaults = {
      gclid: { source: "google", medium: "cpc" },
      fbclid: { source: "meta", medium: "paid_social" },
      msclkid: { source: "bing", medium: "cpc" },
      yclid: { source: "yandex", medium: "cpc" },
    }[clickIdType];
    raw.utm_source = defaults.source;
    raw.utm_medium = defaults.medium;
  }

  return { params: normalizeUtmParams(raw), clickIdType };
}

export function getStoredPromoCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ARENA_PROMO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredPromoCode(code: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ARENA_PROMO_STORAGE_KEY, code.toUpperCase());
  } catch {
    // Ignore unavailable storage.
  }
}

export function getUtmAttribution(): UtmAttribution {
  if (typeof window === "undefined") return { traffic_type: "direct" };

  const promoCode = new URLSearchParams(window.location.search).get("code")?.trim();
  if (promoCode) setStoredPromoCode(promoCode);

  const explicit = paramsFromUrl(window.location.search);
  const inferred = inferCampaignFromReferrer(document.referrer || "", window.location.origin);
  const hasExplicitCampaign = Object.keys(explicit.params).length > 0;
  const candidate = hasExplicitCampaign ? explicit.params : inferred.params;
  const fallbackType = hasExplicitCampaign ? trafficTypeFor(explicit.params, "referral") : inferred.trafficType;

  let sessionTouch: Record<string, string> = {};
  let firstTouch: Record<string, string> = {};
  let lastTouch: Record<string, string> = {};
  let landingPage = window.location.pathname;
  let firstLandingPage = window.location.pathname;
  let initialReferrer = document.referrer || "";

  try {
    sessionTouch = readJson(sessionStorage, SESSION_TOUCH_KEY);
    firstTouch = readJson(localStorage, FIRST_TOUCH_KEY);
    lastTouch = readJson(localStorage, LAST_TOUCH_KEY);

    if (!sessionStorage.getItem(SESSION_LANDING_KEY)) {
      sessionStorage.setItem(SESSION_LANDING_KEY, window.location.pathname);
    }
    landingPage = sessionStorage.getItem(SESSION_LANDING_KEY) || window.location.pathname;

    if (!localStorage.getItem(FIRST_LANDING_KEY)) {
      localStorage.setItem(FIRST_LANDING_KEY, window.location.pathname);
    }
    firstLandingPage = localStorage.getItem(FIRST_LANDING_KEY) || window.location.pathname;

    if (!sessionStorage.getItem(INITIAL_REFERRER_KEY) && document.referrer) {
      sessionStorage.setItem(INITIAL_REFERRER_KEY, document.referrer);
    }
    initialReferrer = sessionStorage.getItem(INITIAL_REFERRER_KEY) || "";

    if (!Object.keys(sessionTouch).length) {
      sessionTouch = candidate;
      writeJson(sessionStorage, SESSION_TOUCH_KEY, sessionTouch);
    } else if (hasExplicitCampaign) {
      // A new explicit campaign starts a new attribution touch inside the same browser session.
      sessionTouch = explicit.params;
      writeJson(sessionStorage, SESSION_TOUCH_KEY, sessionTouch);
    }

    if (!Object.keys(firstTouch).length && Object.keys(candidate).length) {
      firstTouch = candidate;
      writeJson(localStorage, FIRST_TOUCH_KEY, firstTouch);
    }
    if (Object.keys(candidate).length && (hasExplicitCampaign || inferred.trafficType !== "internal")) {
      lastTouch = candidate;
      writeJson(localStorage, LAST_TOUCH_KEY, lastTouch);
    }

    // Keep legacy consumers working, but with normalized active-session values.
    writeJson(sessionStorage, LEGACY_STORAGE_KEY, sessionTouch);
  } catch {
    sessionTouch = candidate;
    firstTouch = candidate;
    lastTouch = candidate;
  }

  const prefix = (params: Record<string, string>, name: "first" | "last") =>
    Object.fromEntries(
      UTM_KEYS.flatMap((key) => {
        const value = params[key];
        return value ? [[`${name}_${key}`, value]] : [];
      }),
    );

  return {
    ...sessionTouch,
    ...prefix(firstTouch, "first"),
    ...prefix(lastTouch, "last"),
    landing_page: landingPage,
    first_landing_page: firstLandingPage,
    initial_referrer: initialReferrer || undefined,
    traffic_type: trafficTypeFor(sessionTouch, fallbackType),
    click_id_type: explicit.clickIdType,
    has_click_id: Boolean(explicit.clickIdType),
  } as UtmAttribution;
}

/** Backward-compatible active session UTMs for lead/order payloads. */
export function getUtmParams(): Record<string, string> {
  const attribution = getUtmAttribution();
  return Object.fromEntries(
    UTM_KEYS.flatMap((key) => (attribution[key] ? [[key, attribution[key] as string]] : [])),
  );
}

/** فقط سه فیلد اصلی برای ذخیره در دیتابیس */
export function pickUtmForDb(utm: Record<string, string>) {
  return {
    utm_source: utm.utm_source?.slice(0, 200) || null,
    utm_medium: utm.utm_medium?.slice(0, 200) || null,
    utm_campaign: utm.utm_campaign?.slice(0, 200) || null,
  };
}
