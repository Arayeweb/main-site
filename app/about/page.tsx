import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutPageContent from "@/components/about/AboutPageContent";
import { COMPANY_LEGAL_NAME } from "@/lib/companyIdentity";
import { SITE_NAME, buildWebPageJsonLd } from "@/lib/seo/siteIdentity";
import { canonicalUrl } from "@/lib/siteUrl";

const ABOUT_TITLE = `درباره شرکت آرایه | ${COMPANY_LEGAL_NAME}`;
const ABOUT_DESCRIPTION =
  "درباره شرکت آرایه (شرکت هوش آرایه پارس): طراحی سایت، سئو، توسعه نرم‌افزار اختصاصی و راهکارهای هوش مصنوعی برای رشد کسب‌وکارها.";

export const metadata: Metadata = {
  title: { absolute: ABOUT_TITLE },
  description: ABOUT_DESCRIPTION,
  alternates: {
    canonical: canonicalUrl("/about"),
  },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: canonicalUrl("/about"),
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
  },
};

const aboutJsonLd = buildWebPageJsonLd({
  name: ABOUT_TITLE,
  url: canonicalUrl("/about"),
  description: ABOUT_DESCRIPTION,
});

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <Navbar solid />
      <main className="overflow-x-clip">
        <AboutPageContent />
      </main>
      <Footer />
    </>
  );
}
