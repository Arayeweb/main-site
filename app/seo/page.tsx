import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHero from "@/components/seo/SeoHero";
import SeoTrustSignals from "@/components/seo/SeoTrustSignals";
import SeoProblem from "@/components/seo/SeoProblem";
import SeoServicesArchitecture from "@/components/seo/SeoServicesArchitecture";
import SeoDeliverables from "@/components/seo/SeoDeliverables";
import SeoSampleDeliverables from "@/components/seo/SeoSampleDeliverables";
import SeoCustomerQuotes from "@/components/seo/SeoCustomerQuotes";
import SeoExecutionFlow from "@/components/seo/SeoExecutionFlow";
import SeoPackagesForm from "@/components/seo/SeoPackagesForm";
import SeoFitCheck from "@/components/seo/SeoFitCheck";
import SeoFaq from "@/components/seo/SeoFaq";
import SeoFinalCta from "@/components/seo/SeoFinalCta";
import SeoExitIntent from "@/components/seo/SeoExitIntent";
import SeoStickyCta from "@/components/seo/SeoStickyCta";
import SeoChatWidget from "@/components/seo/SeoChatWidget";
import SeoPageAnalytics from "@/components/seo/SeoPageAnalytics";
import IndustryHubLinks from "@/components/seo/IndustryHubLinks";
import { canonicalUrl } from "@/lib/siteUrl";
import { seoFaq, seoFooterColumns } from "@/lib/seoData";

export const metadata: Metadata = {
  title: "خدمات سئو سایت | قیمت و پکیج | آرایه",
  description:
    "خدمات سئو سایت شرکتی و خدماتی: استراتژی، فنی، محتوا، Local SEO و CRO. قیمت و هزینه سئو سایت — سفارش سئو با گزارش تماس و فرم.",
  alternates: {
    canonical: "/seo",
  },
  openGraph: {
    title: "خدمات سئو آرایه — از جست‌وجو تا مشتری",
    description:
      "از تحقیق کلمات کلیدی و سئوی فنی تا صفحات خدمات، اعتبار دامنه و سئوی محلی در یک برنامه شفاف.",
    url: "/seo",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "خدمات سئو آرایه — از جست‌وجو تا مشتری",
    description:
      "سئوی کامل با استراتژی، فنی، محتوا، Local SEO، CRO و گزارش KPI.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "خدمات سئو آرایه",
      serviceType:
        "SEO strategy, technical SEO, content SEO, on-page SEO, off-page SEO, local SEO, CRO, analytics",
      provider: { "@type": "Organization", name: "آرایه", url: canonicalUrl("/") },
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl("/seo"),
      description:
        "سئوی کامل آرایه برای تبدیل جست‌وجوی گوگل به تماس، درخواست و مشتری.",
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
      <SeoPageAnalytics />
      <Navbar ctaHref="/seo#audit-form" ctaLabel="دریافت بررسی اولیه" />
      <main className="pb-20 sm:pb-0">
        <SeoHero />
        <SeoTrustSignals />
        <SeoProblem />
        <SeoServicesArchitecture />
        <SeoDeliverables />
        <SeoSampleDeliverables />
        <SeoCustomerQuotes />
        <SeoExecutionFlow />
        <SeoPackagesForm />
        <SeoFitCheck />
        <IndustryHubLinks
          productType="seo"
          title="راهکارهای تخصصی سئو برای صنایع مختلف"
          subtitle="سئوی صنعت‌محور با تمرکز روی تماس، فرم و نوبت — نه فقط رتبه."
        />
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
