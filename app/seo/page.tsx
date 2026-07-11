import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHero from "@/components/seo/SeoHero";
import SeoCustomerQuotes from "@/components/seo/SeoCustomerQuotes";
import SeoInitialAudit from "@/components/seo/SeoInitialAudit";
import SeoCollaboration from "@/components/seo/SeoCollaboration";
import SeoPackagesForm from "@/components/seo/SeoPackagesForm";
import SeoFaq from "@/components/seo/SeoFaq";
import SeoFinalCta from "@/components/seo/SeoFinalCta";
import SeoExitIntent from "@/components/seo/SeoExitIntent";
import SeoStickyCta from "@/components/seo/SeoStickyCta";
import SeoChatWidget from "@/components/seo/SeoChatWidget";
import { seoFaq, seoFooterColumns } from "@/lib/seoData";

export const metadata: Metadata = {
  title: "سئو برای لید و مشتری | سیستم سرچ تا لید — آرایه",
  description:
    "آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند. سیستم سرچ تا لید برای پزشکان، کلینیک‌ها، وکلا و کسب‌وکارهای خدماتی.",
  alternates: {
    canonical: "/seo",
  },
  openGraph: {
    title: "سئو برای لید و مشتری — آرایه",
    description:
      "آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند. از گوگل مشتری بگیرید، نه فقط بازدید.",
    url: "/seo",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "سئو برای لید و مشتری — آرایه",
    description: "آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "سیستم سئو برای لید و تولید مشتری",
      serviceType:
        "SEO, landing page design, lead capture, CRM integration, conversion optimization",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/seo",
      description:
        "آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند — سیستم کامل سرچ تا لید.",
    },
    {
      "@type": "FAQPage",
      mainEntity: seoFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function SeoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar ctaHref="/free-seo-audit" ctaLabel="بررسی وضعیت در گوگل" />
      <main className="pb-20 sm:pb-0">
        <SeoHero />
        <SeoCustomerQuotes />
        <SeoInitialAudit />
        <SeoCollaboration />
        <SeoPackagesForm />
        <SeoFaq />
        <SeoFinalCta />
      </main>
      <Footer columns={seoFooterColumns} />
      <SeoChatWidget />
      <SeoExitIntent />
      <SeoStickyCta />
    </>
  );
}
