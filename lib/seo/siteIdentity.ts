import {
  COMPANY_ADDRESS_COUNTRY,
  COMPANY_ADDRESS_FULL,
  COMPANY_ADDRESS_LOCALITY,
  COMPANY_BRAND_NAME,
  COMPANY_DISPLAY_NAME,
  COMPANY_EMAIL,
  COMPANY_LEGAL_NAME,
  COMPANY_PHONE_E164,
  COMPANY_SAME_AS,
  COMPANY_STREET_ADDRESS,
} from "@/lib/companyIdentity";
import { SITE_URL } from "@/lib/siteUrl";

/** Preferred Google site name (SERP brand label above the URL). */
export const SITE_NAME = COMPANY_BRAND_NAME;

/**
 * Fallbacks if Google does not select SITE_NAME.
 * Order = preference. Do not put the bare domain first — that is already the failure mode.
 */
export const SITE_ALTERNATE_NAMES = [
  COMPANY_DISPLAY_NAME,
  "Araaye",
  "ارایه",
  "Araaye AI",
] as const;

export const ORGANIZATION_ALTERNATE_NAMES = [
  COMPANY_DISPLAY_NAME,
  "Araaye",
  "ارایه",
  "Araaye AI",
  "هوش ارایه پارس",
] as const;

export const SITE_NAME_ID = `${SITE_URL}/#website`;
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const SITE_LOGO_URL = `${SITE_URL}/assets/logo-icon-192.png`;

const SITE_DESCRIPTION =
  "آرایه طراحی سایت، سئو، نرم‌افزار اختصاصی و راهکارهای هوش مصنوعی را برای دیده‌شدن، جذب مشتری و رشد کسب‌وکار یکپارچه می‌کند.";

const ORG_DESCRIPTION =
  "طراحی سایت، سئو، توسعه نرم‌افزار اختصاصی و راهکارهای هوش مصنوعی برای کسب‌وکارهای ایرانی.";

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
        legalName: COMPANY_LEGAL_NAME,
        alternateName: [...ORGANIZATION_ALTERNATE_NAMES],
        url: SITE_URL,
        description: ORG_DESCRIPTION,
        email: COMPANY_EMAIL,
        telephone: COMPANY_PHONE_E164,
        logo: {
          "@type": "ImageObject",
          url: SITE_LOGO_URL,
          width: 192,
          height: 192,
        },
        image: SITE_LOGO_URL,
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY_STREET_ADDRESS,
          addressLocality: COMPANY_ADDRESS_LOCALITY,
          addressCountry: COMPANY_ADDRESS_COUNTRY,
        },
        sameAs: [...COMPANY_SAME_AS],
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

/** Compact Organization node for provider refs — keep name/logo consistent with homepage. */
export function organizationProviderRef() {
  return {
    "@type": "Organization" as const,
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: COMPANY_LEGAL_NAME,
    url: SITE_URL,
    logo: SITE_LOGO_URL,
  };
}

/** WebPage node linking inner pages back to the canonical WebSite entity. */
export function buildWebPageJsonLd({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    url,
    ...(description ? { description } : {}),
    inLanguage: "fa-IR",
    isPartOf: websitePartOfRef(),
    about: { "@id": ORGANIZATION_ID },
  };
}

export { COMPANY_ADDRESS_FULL, COMPANY_DISPLAY_NAME, COMPANY_LEGAL_NAME };
