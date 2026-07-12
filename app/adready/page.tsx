import type { Metadata } from "next";
import AdReadyLanding, { adReadyFaq } from "@/components/adready/AdReadyLanding";
import { canonicalUrl } from "@/lib/siteUrl";
import "./adready.css";

const title = "AdReady | صفحه آماده تبلیغ";
const description =
  "با AdReady صفحه، متن، فرم درخواست و راه‌های تماس را آماده کن. پیش‌نمایش رایگان و انتشار یک‌ماهه یا مادام‌العمر.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: canonicalUrl("/adready") },
  openGraph: {
    title,
    description,
    type: "website",
    url: canonicalUrl("/adready"),
    locale: "fa_IR",
    siteName: "آرایه",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "AdReady",
      alternateName: "صفحه آماده تبلیغ آرایه",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description,
      url: canonicalUrl("/adready"),
      provider: {
        "@type": "Organization",
        name: "آرایه",
        url: canonicalUrl("/"),
      },
      offers: [
        { "@type": "Offer", name: "پیش‌نمایش", price: "0", priceCurrency: "IRR" },
        { "@type": "Offer", name: "انتشار یک‌ماهه", price: "15000000", priceCurrency: "IRR" },
        { "@type": "Offer", name: "انتشار مادام‌العمر", price: "31000000", priceCurrency: "IRR" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: adReadyFaq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ],
};

export default function AdReadyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AdReadyLanding />
    </>
  );
}
