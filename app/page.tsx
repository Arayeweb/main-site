import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ClientLogos from "@/components/ClientLogos";
import Services from "@/components/Services";
import Industries from "@/components/Industries";
import Solutions from "@/components/Solutions";
import Process from "@/components/Process";
import WhyAraaye from "@/components/WhyAraaye";
import RealPortfolio from "@/components/RealPortfolio";
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
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <Hero />
        <ClientLogos />
        <Services />
        <Industries />
        <Solutions />
        <Process />
        <WhyAraaye />
        <RealPortfolio />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
