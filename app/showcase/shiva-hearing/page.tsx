import type { Metadata } from "next";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import { shivaJsonLd } from "@/lib/showcaseSites/shiva/config";
import ShivaSite from "@/components/showcase-sites/shiva/ShivaSite";

export const metadata: Metadata = {
  title: "کلینیک شنوایی شیوا | ارزیابی شنوایی و سمعک",
  description:
    "کلینیک تخصصی شنوایی و سمعک — ارزیابی شنوایی، مشاوره و تنظیم سمعک. نمونه مفهومی طراحی شده توسط آرایه.",
  alternates: { canonical: canonicalUrl("/showcase/shiva-hearing") },
  robots: { index: false, follow: false },
  openGraph: {
    title: "کلینیک شنوایی شیوا",
    description: "ارزیابی شنوایی، مشاوره تخصصی و انتخاب سمعک متناسب.",
    url: `${SITE_URL}/showcase/shiva-hearing`,
    locale: "fa_IR",
    type: "website",
  },
};

export default function ShivaHearingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shivaJsonLd) }}
      />
      <ShivaSite />
    </>
  );
}
