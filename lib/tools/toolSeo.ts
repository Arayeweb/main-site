import type { Metadata } from "next";
import { canonicalUrl } from "@/lib/siteUrl";
import {
  ORGANIZATION_ID,
  organizationProviderRef,
  SITE_NAME,
} from "@/lib/seo/siteIdentity";
import {
  getHubLabel,
  getHubPath,
  type ToolHub,
  type ToolRegistryEntry,
} from "./toolRegistry";
import type { ToolFaq, ToolProgrammaticPage } from "./toolPageContent";

export function toolProgrammaticMetadata(page: ToolProgrammaticPage): Metadata {
  return {
    title: { absolute: page.meta.title },
    description: page.meta.description,
    alternates: { canonical: page.meta.canonicalPath },
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url: page.meta.canonicalPath,
      type: "website",
      locale: "fa_IR",
    },
  };
}

export function buildToolProgrammaticJsonLd(page: ToolProgrammaticPage) {
  const pageUrl = canonicalUrl(page.meta.canonicalPath);
  const hubUrl = canonicalUrl(getHubPath(page.hub));
  const hubName = getHubLabel(page.hub);
  const isPaidService = page.hub === "googlesabt";

  const productNode = isPaidService
    ? {
        "@type": "Service",
        name: page.primaryKeyword,
        serviceType: "ثبت کسب‌وکار در گوگل مپ و نقشه‌ها",
        description: page.meta.description,
        url: pageUrl,
        provider: { "@id": ORGANIZATION_ID },
        areaServed: { "@type": "Country", name: "Iran" },
        offers: {
          "@type": "Offer",
          price: "590000",
          priceCurrency: "IRR",
          url: hubUrl,
        },
      }
    : {
        "@type": "WebApplication",
        name: hubName,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "IRR",
        },
        url: hubUrl,
        provider: { "@id": ORGANIZATION_ID },
      };

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationProviderRef(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: hubName, item: hubUrl },
          { "@type": "ListItem", position: 3, name: page.primaryKeyword, item: pageUrl },
        ],
      },
      {
        "@type": "WebPage",
        name: page.primaryKeyword,
        description: page.meta.description,
        url: pageUrl,
        isPartOf: { "@id": `${canonicalUrl("/")}#website` },
        provider: { "@id": ORGANIZATION_ID },
      },
      productNode,
      {
        "@type": "HowTo",
        name: page.steps.title,
        step: page.steps.items.map((text, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text,
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: page.faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "ItemList",
        name: `صفحات مرتبط ${hubName}`,
        itemListElement: page.related.map((r, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: r.keyword,
          url: canonicalUrl(r.href),
        })),
      },
    ],
  };
}

export function buildToolHubJsonLd({
  hub,
  name,
  description,
  faqs,
  children,
}: {
  hub: ToolHub;
  name: string;
  description: string;
  faqs: ToolFaq[];
  children: ToolRegistryEntry[];
}) {
  const hubUrl = canonicalUrl(getHubPath(hub));

  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationProviderRef(),
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: name, item: hubUrl },
        ],
      },
      {
        "@type": "WebApplication",
        name,
        description,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: hubUrl,
        offers: { "@type": "Offer", price: "0", priceCurrency: "IRR" },
        provider: { "@id": ORGANIZATION_ID },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "ItemList",
        name: `راهنماهای ${getHubLabel(hub)}`,
        numberOfItems: children.length,
        itemListElement: children.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.primaryKeyword,
          url: canonicalUrl(`${getHubPath(hub)}/${c.slug}`),
        })),
      },
    ],
  };
}
