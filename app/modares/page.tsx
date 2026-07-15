import type { Metadata } from "next";
import ModaresHeader from "@/components/modares/ModaresHeader";
import ModaresHero from "@/components/modares/ModaresHero";
import ModaresOutcomes from "@/components/modares/ModaresOutcomes";
import ModaresInteractiveDemo from "@/components/modares/ModaresInteractiveDemo";
import ModaresOffer from "@/components/modares/ModaresOffer";
import ModaresTrust from "@/components/modares/ModaresTrust";
import ModaresFaq from "@/components/modares/ModaresFaq";
import ModaresFinalForm from "@/components/modares/ModaresFinalForm";
import ModaresFooter from "@/components/modares/ModaresFooter";
import ModaresStickyCta from "@/components/modares/ModaresStickyCta";
import ModaresPageTracker from "@/components/modares/ModaresPageTracker";
import { resolveModaresVariant } from "@/lib/modaresData";
import { MODARES_SEO, modaresJsonLd } from "@/lib/modaresSeo";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: { absolute: MODARES_SEO.title },
  description: MODARES_SEO.description,
  alternates: {
    canonical: MODARES_SEO.path,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: MODARES_SEO.title,
    description: MODARES_SEO.description,
    url: canonicalUrl(MODARES_SEO.path),
    type: "website",
    locale: "fa_IR",
    siteName: "آرایه",
  },
  twitter: {
    card: "summary_large_image",
    title: MODARES_SEO.title,
    description: MODARES_SEO.description,
  },
};

type ModaresPageProps = {
  searchParams?: { variant?: string };
};

export default function ModaresPage({ searchParams }: ModaresPageProps) {
  const variant = resolveModaresVariant(searchParams?.variant);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(modaresJsonLd) }}
      />
      <ModaresHeader />
      <ModaresPageTracker variant={variant} />
      <main className="pb-[calc(52px+env(safe-area-inset-bottom,0px))] sm:pb-0">
        <ModaresHero variant={variant} />
        <ModaresOutcomes />
        <ModaresInteractiveDemo variant={variant} />
        <ModaresOffer variant={variant} />
        <ModaresTrust variant={variant} />
        <ModaresFaq />
        <ModaresFinalForm variant={variant} />
      </main>
      <ModaresFooter />
      <ModaresStickyCta />
    </>
  );
}
