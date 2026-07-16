import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DoctorsHeader from "@/components/doctors/DoctorsHeader";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsSalesSections from "@/components/doctors/DoctorsSalesSections";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsPageAnalytics from "@/components/doctors/DoctorsPageAnalytics";
import {
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorFaq,
  tomanToIrr,
} from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "طراحی سایت مطب پزشکان | ۲۰ میلیون — تحویل ۲ روز — آرایه",
  description:
    "سایت اختصاصی مطب با تحویل ۲ روز کاری، پنل مقاله، واتساپ و اتصال نوبت. پکیج ۲۰ میلیون تومان با پرداخت مرحله‌ای. سفارش در واتساپ.",
  alternates: {
    canonical: "/doctors",
  },
  openGraph: {
    title: "طراحی سایت مطب پزشکان — ۲۰ میلیون تومان — آرایه",
    description:
      "سایت اختصاصی مطب؛ نسخه اول در ۲ روز کاری. دمو تخصصی، قیمت شفاف، سفارش در واتساپ.",
    url: "/doctors",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت مطب پزشکان — آرایه",
    description: "پکیج ۲۰ میلیون — تحویل ۲ روز — سفارش در واتساپ",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name: "پکیج سایت مطب تک‌پزشک",
      description:
        "طراحی سایت اختصاصی مطب با صفحات خدمات، پنل مقاله، واتساپ، اتصال نوبت و سئوی فنی اولیه.",
      brand: { "@type": "Brand", name: "آرایه" },
      offers: {
        "@type": "Offer",
        price: String(tomanToIrr(DOCTORS_PRODUCT_PRICE_TOMAN)),
        priceCurrency: "IRR",
        availability: "https://schema.org/InStock",
        url: "https://araaye.com/doctors",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: "https://araaye.com/" },
        { "@type": "ListItem", position: 2, name: "پزشکان و مطب‌ها", item: "https://araaye.com/doctors" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: doctorFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function DoctorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DoctorsPageAnalytics />
      <DoctorsHeader />
      <main className="pb-20 sm:pb-0">
        <DoctorsHero />
        <DoctorsSalesSections />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
    </>
  );
}
