// خواندن و نگه‌داری UTMها در sessionStorage — فقط سمت کلاینت.
// همان الگوی public/assets/js/seo.js تا attribution بین صفحات استاتیک و Next یکدست بماند.

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const STORAGE_KEY = "__utms";

/** کد تخفیف کمپین — جدا از arena_ref_code (معرفی کاربر) */
export const ARENA_PROMO_STORAGE_KEY = "arena_promo_code";
export const ARENA_REF_STORAGE_KEY = "arena_ref_code";

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
    /* ignore */
  }
}

export function getUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  const fromUrl: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) fromUrl[key] = v;
  }

  // ?src=pageA → utm_source=pageA (میانبر کمپین اینفلوئنسر)
  const src = params.get("src")?.trim();
  if (src && !fromUrl.utm_source) {
    fromUrl.utm_source = src;
  }

  // ?code=PAGEA20 → ذخیره برای pricing/checkout
  const promoCode = params.get("code")?.trim();
  if (promoCode) {
    setStoredPromoCode(promoCode);
  }

  let stored: Record<string, string> = {};
  try {
    stored = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    /* ignore */
  }

  const merged = { ...stored, ...fromUrl };
  if (Object.keys(merged).length) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      /* ignore */
    }
  }
  return merged;
}

/** فقط سه فیلد اصلی برای ذخیره در دیتابیس */
export function pickUtmForDb(utm: Record<string, string>) {
  return {
    utm_source: utm.utm_source?.slice(0, 200) || null,
    utm_medium: utm.utm_medium?.slice(0, 200) || null,
    utm_campaign: utm.utm_campaign?.slice(0, 200) || null,
  };
}
