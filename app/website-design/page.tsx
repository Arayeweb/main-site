import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebsiteDesignHero from "@/components/website-design/website-design-hero";
import WebsiteDesignProblems from "@/components/website-design/website-design-problems";
import WebsiteDesignDeliverables from "@/components/website-design/website-design-deliverables";
import {
  WebsiteDesignAudiences,
  WebsiteDesignOutputs,
} from "@/components/website-design/website-design-sections";
import { WebsiteDesignTypes } from "@/components/website-design/website-type-comparison";
import WebsiteDesignProcess from "@/components/website-design/website-design-process";
import WebsiteDesignPortfolio from "@/components/website-design/website-design-portfolio";
import WebsiteTypeComparison from "@/components/website-design/website-type-comparison";
import {
  WebsiteDesignSeoBlock,
  WebsiteDesignTechnology,
  WebsiteDesignPricing,
} from "@/components/website-design/website-design-more-sections";
import WebsiteDesignFaq from "@/components/website-design/website-design-faq";
import WebsiteDesignLeadForm from "@/components/website-design/website-design-lead-form";
import WebsiteDesignFinalCta from "@/components/website-design/website-design-final-cta";
import { websiteDesignFaq } from "@/data/website-design";

export const metadata: Metadata = {
  title: "طراحی سایت حرفه‌ای و فروش‌محور | آرایه",
  description:
    "طراحی سایت حرفه‌ای، سریع و فروش‌محور برای کسب‌وکارها؛ همراه با طراحی اختصاصی، فرم جذب لید، سئو پایه، اتصال ابزارهای تحلیل و پشتیبانی آرایه.",
  alternates: {
    canonical: "/website-design",
  },
  openGraph: {
    title: "طراحی سایت حرفه‌ای و فروش‌محور | آرایه",
    description:
      "طراحی سایت حرفه‌ای، سریع و فروش‌محور برای کسب‌وکارها؛ همراه با طراحی اختصاصی، فرم جذب لید، سئو پایه، اتصال ابزارهای تحلیل و پشتیبانی آرایه.",
    url: "/website-design",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت حرفه‌ای و فروش‌محور | آرایه",
    description:
      "طراحی سایت حرفه‌ای، سریع و فروش‌محور برای کسب‌وکارها؛ همراه با طراحی اختصاصی، فرم جذب لید، سئو پایه و اتصال ابزارهای تحلیل.",
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
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/website-design",
      description:
        "طراحی و توسعه سایت‌های حرفه‌ای برای جذب لید، اعتبارسازی، تبلیغات و رشد کسب‌وکار.",
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
      <Navbar ctaHref="#website-design-lead-form" ctaLabel="ثبت درخواست طراحی سایت" />
      <main>
        <WebsiteDesignHero />
        <WebsiteDesignProblems />
        <WebsiteDesignDeliverables />
        <WebsiteDesignAudiences />
        <WebsiteDesignOutputs />
        <WebsiteDesignTypes />
        <WebsiteDesignProcess />
        <WebsiteDesignPortfolio />
        <WebsiteTypeComparison />
        <WebsiteDesignSeoBlock />
        <WebsiteDesignTechnology />
        <WebsiteDesignPricing />
        <WebsiteDesignFaq />
        <WebsiteDesignLeadForm />
        <WebsiteDesignFinalCta />
      </main>
      <Footer />
    </>
  );
}
