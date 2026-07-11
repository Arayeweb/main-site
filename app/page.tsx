import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CustomerPath from "@/components/home/CustomerPath";
import OutputSamples from "@/components/home/OutputSamples";
import CollaborationProcess from "@/components/home/CollaborationProcess";
import DoctorsSpecialtySection from "@/components/home/DoctorsSpecialtySection";
import AraayeAiTeaser from "@/components/home/AraayeAiTeaser";
import HomeFaq from "@/components/home/HomeFaq";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl("/"),
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "آرایه",
      url: SITE_URL,
      description:
        "آرایه شرکت توسعه نرم‌افزار است؛ سایت، وب‌اپلیکیشن، CRM، داشبورد، چت‌بات هوشمند و ابزارهای اختصاصی برای کسب‌وکارها می‌سازد.",
      inLanguage: "fa-IR",
      publisher: { "@type": "Organization", name: "آرایه", url: SITE_URL },
    },
    {
      "@type": "Organization",
      name: "آرایه",
      url: SITE_URL,
      description:
        "توسعه نرم‌افزار اختصاصی، طراحی سایت، وب‌اپلیکیشن، CRM و هوش مصنوعی برای کسب‌وکارهای ایرانی.",
      logo: `${SITE_URL}/assets/logo-icon-192.png`,
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />
      <Navbar ctaLabel="درخواست مشاوره" />
      <main className="pb-20 sm:pb-0">
        <Hero />
        <CustomerPath />
        <OutputSamples />
        <CollaborationProcess />
        <DoctorsSpecialtySection />
        <AraayeAiTeaser />
        <HomeFaq />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
