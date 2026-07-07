/** شماره تماس / واتساپ اصلی آرایه */
export const SITE_PHONE_E164 = "+98991300788";
export const SITE_PHONE_WA = "98991300788";
export const SITE_PHONE_DISPLAY = "۰۹۹۹۱۳۰۰۷۸۸";
export const SITE_PHONE_TEL = `tel:${SITE_PHONE_E164}`;

export function siteWhatsAppUrl(text?: string): string {
  const base = `https://wa.me/${SITE_PHONE_WA}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}
