import type { Metadata } from "next";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import { medisaJsonLd } from "@/lib/showcaseSites/medisa/config";
import MedisaSite from "@/components/showcase-sites/medisa/MedisaSite";

export const metadata: Metadata = {
  title: "استودیو معماری مدیسا | معماری و طراحی داخلی",
  description:
    "استودیو معماری مدیسا — معماری، طراحی داخلی و بازسازی. نمونه مفهومی طراحی شده توسط آرایه.",
  alternates: { canonical: canonicalUrl("/showcase/medisa-studio") },
  robots: { index: false, follow: false },
  openGraph: {
    title: "استودیو معماری مدیسا",
    description: "معماری، طراحی داخلی و بازسازی — فضاهای مسکونی و اداری.",
    url: `${SITE_URL}/showcase/medisa-studio`,
    locale: "fa_IR",
    type: "website",
  },
};

export default function MedisaStudioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medisaJsonLd) }}
      />
      <MedisaSite />
    </>
  );
}
