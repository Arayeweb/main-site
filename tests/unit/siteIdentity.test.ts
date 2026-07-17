import {
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  buildHomeSiteGraphJsonLd,
  buildWebPageJsonLd,
  organizationProviderRef,
  websitePartOfRef,
} from "@/lib/seo/siteIdentity";
import { COMPANY_LEGAL_NAME } from "@/lib/companyIdentity";
import { SITE_URL } from "@/lib/siteUrl";

describe("siteIdentity", () => {
  it("exposes آرایه as the preferred Google site name with brand fallbacks", () => {
    expect(SITE_NAME).toBe("آرایه");
    expect(SITE_ALTERNATE_NAMES[0]).toBe("شرکت آرایه");
    expect(SITE_ALTERNATE_NAMES).toContain("Araaye");
    expect(SITE_ALTERNATE_NAMES).toContain("ارایه");
    expect(SITE_ALTERNATE_NAMES).toContain("Araaye AI");
    expect(SITE_ALTERNATE_NAMES).not.toContain("araaye.com");
  });

  it("buildHomeSiteGraphJsonLd includes WebSite + Organization brand identity once", () => {
    const graph = buildHomeSiteGraphJsonLd();
    const website = graph["@graph"].find((node) => node["@type"] === "WebSite");
    const org = graph["@graph"].find((node) => node["@type"] === "Organization");

    expect(website).toMatchObject({
      name: "آرایه",
      url: SITE_URL,
      alternateName: ["شرکت آرایه", "Araaye", "ارایه", "Araaye AI"],
    });
    expect(org).toMatchObject({
      name: "آرایه",
      legalName: COMPANY_LEGAL_NAME,
      url: SITE_URL,
      email: "support@araaye.com",
      telephone: "+989991300788",
      alternateName: ["شرکت آرایه", "Araaye", "ارایه", "Araaye AI", "هوش ارایه پارس"],
      sameAs: [
        "https://www.linkedin.com/company/araaye",
        "https://instagram.com/araayecom",
      ],
    });
    expect(org?.address).toMatchObject({
      "@type": "PostalAddress",
      addressLocality: "تهران",
      addressCountry: "IR",
    });
    expect(org?.logo).toMatchObject({
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/logo-icon-192.png`,
    });
  });

  it("websitePartOfRef links inner pages back to the same WebSite @id", () => {
    expect(websitePartOfRef()).toMatchObject({
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "آرایه",
      url: SITE_URL,
    });
  });

  it("organizationProviderRef keeps legalName and logo consistent", () => {
    expect(organizationProviderRef()).toMatchObject({
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "آرایه",
      legalName: COMPANY_LEGAL_NAME,
      url: SITE_URL,
    });
  });

  it("buildWebPageJsonLd links inner pages to the canonical WebSite entity", () => {
    expect(
      buildWebPageJsonLd({
        name: "درباره شرکت آرایه",
        url: `${SITE_URL}/about`,
        description: "درباره آرایه",
      }),
    ).toMatchObject({
      "@type": "WebPage",
      name: "درباره شرکت آرایه",
      url: `${SITE_URL}/about`,
      description: "درباره آرایه",
      inLanguage: "fa-IR",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "آرایه",
        url: SITE_URL,
      },
      about: { "@id": `${SITE_URL}/#organization` },
    });
  });
});
