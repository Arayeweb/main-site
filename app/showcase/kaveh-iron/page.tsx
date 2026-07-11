import type { Metadata } from "next";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import { kavehJsonLd } from "@/lib/showcaseSites/kaveh/config";
import KavehSite from "@/components/showcase-sites/kaveh/KavehSite";

export const metadata: Metadata = {
  title: "آهن کاوه | فروش و تأمین آهن‌آلات ساختمانی",
  description:
    "فروش میلگرد، تیرآهن، ورق و سایر آهن‌آلات — استعلام قیمت آنلاین. نمونه مفهومی طراحی شده توسط آرایه.",
  alternates: { canonical: canonicalUrl("/showcase/kaveh-iron") },
  robots: { index: false, follow: false },
  openGraph: {
    title: "آهن کاوه",
    description: "فروش و تأمین آهن‌آلات ساختمانی — استعلام قیمت آنلاین.",
    url: `${SITE_URL}/showcase/kaveh-iron`,
    locale: "fa_IR",
    type: "website",
  },
};

export default function KavehIronPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(kavehJsonLd) }}
      />
      <KavehSite />
    </>
  );
}
