import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CustomerPath from "@/components/home/CustomerPath";
import OutputSamples from "@/components/home/OutputSamples";
import CollaborationProcess from "@/components/home/CollaborationProcess";
import DoctorsSpecialtySection from "@/components/home/DoctorsSpecialtySection";
import AraayeAiTeaser from "@/components/home/AraayeAiTeaser";
import HomeToolsSection from "@/components/home/HomeToolsSection";
import HomeBrandServices from "@/components/home/HomeBrandServices";
import HomeCompanyIdentity from "@/components/home/HomeCompanyIdentity";
import HomeFaq from "@/components/home/HomeFaq";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { canonicalUrl } from "@/lib/siteUrl";
import { SITE_NAME } from "@/lib/seo/siteIdentity";
import { homeFaq } from "@/lib/homeFaq";

const HOME_TITLE = "آرایه | پلتفرم هوش مصنوعی و ساخت سایت";
const HOME_DESCRIPTION =
  "شرکت آرایه ارائه‌دهنده خدمات طراحی سایت، سئو، توسعه نرم‌افزار اختصاصی و ابزارهای هوش مصنوعی برای رشد کسب‌وکارهاست. برای دریافت مشاوره با آرایه تماس بگیرید.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  keywords: [
    "شرکت آرایه",
    "آرایه",
    "شرکت هوش آرایه پارس",
    "شرکت آرایه طراحی سایت",
    "شرکت آرایه سئو",
    "شرکت نرم‌افزاری آرایه",
    "شرکت طراحی سایت آرایه",
    "Araaye",
  ],
  alternates: {
    canonical: canonicalUrl("/"),
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: canonicalUrl("/"),
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

const homeFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeFaq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />
      <Navbar ctaLabel="درخواست مشاوره" />
      <main className="pb-20 sm:pb-0">
        <Hero />
        <HomeBrandServices />
        <CustomerPath />
        <OutputSamples />
        <CollaborationProcess />
        <DoctorsSpecialtySection />
        <AraayeAiTeaser />
        <HomeToolsSection />
        <HomeFaq />
        <HomeCompanyIdentity />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
