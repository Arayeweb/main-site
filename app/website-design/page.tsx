import type { Metadata } from "next";
import WebsiteDesignNavbar from "@/components/website-design/WebsiteDesignNavbar";
import Footer from "@/components/Footer";
import WebsiteDesignHero from "@/components/website-design/website-design-hero";
import WebsiteDesignLogic from "@/components/website-design/website-design-logic";
import WebsiteDesignProblems from "@/components/website-design/website-design-problems";
import WebsiteDesignDeliverables from "@/components/website-design/website-design-deliverables";
import {
  WebsiteDesignAudiences,
  WebsiteDesignOutputs,
} from "@/components/website-design/website-design-sections";
import WebsiteDesignTestimonials from "@/components/website-design/website-design-testimonials";
import WebsiteDesignProcess from "@/components/website-design/website-design-process";
import WebsiteDesignPortfolio from "@/components/website-design/website-design-portfolio";
import WebsiteTypeComparison from "@/components/website-design/website-type-comparison";
import WebsiteDesignPricing from "@/components/website-design/website-design-pricing";
import {
  WebsiteDesignSeoBlock,
  WebsiteDesignTechnology,
} from "@/components/website-design/website-design-more-sections";
import WebsiteDesignFaq from "@/components/website-design/website-design-faq";
import WebsiteDesignLeadForm from "@/components/website-design/website-design-lead-form";
import WebsiteDesignFinalCta from "@/components/website-design/website-design-final-cta";
import IndustryHubLinks from "@/components/seo/IndustryHubLinks";
import { canonicalUrl } from "@/lib/siteUrl";
import { organizationProviderRef } from "@/lib/seo/siteIdentity";
import { websiteDesignFaq } from "@/data/website-design";

export const metadata: Metadata = {
  title: "طراحی سایت حرفه‌ای | قیمت و نمونه | آرایه",
  description:
    "طراحی سایت حرفه‌ای و اختصاصی برای کسب‌وکارها؛ سفارش طراحی سایت شرکتی و خدماتی با فرم تماس، سئو پایه و پشتیبانی. قیمت و هزینه طراحی سایت.",
  alternates: {
    canonical: "/website-design",
  },
  openGraph: {
    title: "طراحی سایت حرفه‌ای و فروش‌محور | آرایه",
    description:
      "طراحی سایت حرفه‌ای، سریع و فروش‌محور برای کسب‌وکارها؛ همراه با طراحی اختصاصی، فرم تماس و درخواست، سئو پایه، آمار بازدید و پشتیبانی آرایه.",
    url: "/website-design",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت حرفه‌ای و فروش‌محور | آرایه",
    description:
      "طراحی سایت حرفه‌ای، سریع و فروش‌محور برای کسب‌وکارها؛ همراه با طراحی اختصاصی، فرم تماس و درخواست، سئو پایه و آمار بازدید.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "طراحی سایت حرفه‌ای و فروش‌محور",
      serviceType:
        "Website design, responsive development, lead capture forms, technical SEO foundations, analytics integration",
      provider: organizationProviderRef(),
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl("/website-design"),
      description:
        "طراحی و توسعه سایت‌های حرفه‌ای برای جذب مشتری، ایجاد اعتماد، تبلیغات و رشد کسب‌وکار.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "آرایه",
          item: canonicalUrl("/"),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "طراحی سایت",
          item: canonicalUrl("/website-design"),
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: websiteDesignFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function WebsiteDesignPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WebsiteDesignNavbar />
      <main>
        <WebsiteDesignHero />
        <WebsiteDesignLogic />
        <WebsiteDesignTestimonials />
        <WebsiteDesignPortfolio />
        <WebsiteDesignProblems />
        <WebsiteDesignDeliverables />
        <WebsiteDesignAudiences />
        <WebsiteDesignOutputs />
        <WebsiteDesignProcess />
        <WebsiteDesignPricing />
        <WebsiteDesignFaq />
        <WebsiteTypeComparison />
        <WebsiteDesignSeoBlock />
        <WebsiteDesignTechnology />
        <IndustryHubLinks
          productType="website"
          title="طراحی سایت برای حوزه‌های مختلف"
          subtitle="راهکارهای تخصصی طراحی سایت برای صنایعی که بیشترین جستجو و تبدیل را دارند."
        />
        <WebsiteDesignLeadForm />
        <WebsiteDesignFinalCta />
      </main>
      <Footer />
    </>
  );
}
