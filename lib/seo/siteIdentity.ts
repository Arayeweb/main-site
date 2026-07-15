import { SITE_URL } from "@/lib/siteUrl";

/** Preferred Google site name (SERP brand label above the URL). */
export const SITE_NAME = "آرایه";

/**
 * Fallbacks if Google does not select SITE_NAME.
 * Order = preference. Do not put the bare domain first — that is already the failure mode.
 */
export const SITE_ALTERNATE_NAMES = [
  "Araaye",
  "آرایه AI",
  "Araaye AI",
] as const;

export const SITE_NAME_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const SITE_LOGO_URL = `${SITE_URL}/assets/logo-icon-192.png`;

const SITE_DESCRIPTION =
  "آرایه شرکت توسعه نرم‌افزار است؛ سایت، وب‌اپلیکیشن، CRM، داشبورد، چت‌بات هوشمند و ابزارهای اختصاصی برای کسب‌وکارها می‌سازد.";

const ORG_DESCRIPTION =
  "توسعه نرم‌افزار اختصاصی، طراحی سایت، وب‌اپلیکیشن، CRM و هوش مصنوعی برای کسب‌وکارهای ایرانی.";

/** Homepage @graph: WebSite + Organization for Google site name + Knowledge Panel signals. */
export function buildHomeSiteGraphJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_NAME_ID,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: "fa-IR",
        publisher: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE_NAME,
        alternateName: [...SITE_ALTERNATE_NAMES],
        url: SITE_URL,
        description: ORG_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
          width: 192,
          height: 192,
        },
        image: SITE_LOGO_URL,
      },
    ],
  };
}

/** Compact WebSite node for isPartOf on inner pages. */
export function websitePartOfRef() {
  return {
    "@type": "WebSite" as const,
    "@id": SITE_NAME_ID,
    name: SITE_NAME,
    url: SITE_URL,
  };
}
