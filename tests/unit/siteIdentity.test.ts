import {
  SITE_ALTERNATE_NAMES,
  SITE_NAME,
  buildHomeSiteGraphJsonLd,
  websitePartOfRef,
} from "@/lib/seo/siteIdentity";
import { SITE_URL } from "@/lib/siteUrl";

describe("siteIdentity", () => {
  it("exposes آرایه as the preferred Google site name with Latin/AI fallbacks", () => {
    expect(SITE_NAME).toBe("آرایه");
    expect(SITE_ALTERNATE_NAMES[0]).toBe("Araaye");
    expect(SITE_ALTERNATE_NAMES).not.toContain("araaye.com");
  });

  it("buildHomeSiteGraphJsonLd includes WebSite.name + alternateName for site names", () => {
    const graph = buildHomeSiteGraphJsonLd();
    const website = graph["@graph"].find((node) => node["@type"] === "WebSite");
    const org = graph["@graph"].find((node) => node["@type"] === "Organization");

    expect(website).toMatchObject({
      name: "آرایه",
      url: SITE_URL,
      alternateName: ["Araaye", "آرایه AI", "Araaye AI"],
    });
    expect(org).toMatchObject({
      name: "آرایه",
      url: SITE_URL,
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
});
