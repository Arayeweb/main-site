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
import HomeServiceLinks from "@/components/home/HomeServiceLinks";
import { canonicalUrl } from "@/lib/siteUrl";
import { buildHomeSiteGraphJsonLd } from "@/lib/seo/siteIdentity";

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl("/"),
  },
};

const homeJsonLd = buildHomeSiteGraphJsonLd();

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
        <HomeServiceLinks />
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
