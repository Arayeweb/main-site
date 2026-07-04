import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorsClientLogos from "@/components/doctors/DoctorsClientLogos";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsCases from "@/components/doctors/DoctorsCases";
import DoctorsFeatures from "@/components/doctors/DoctorsFeatures";
import DoctorsPackagesForm from "@/components/doctors/DoctorsPackagesForm";
import DoctorsCompareTable from "@/components/doctors/DoctorsCompareTable";
import DoctorsFaq from "@/components/doctors/DoctorsFaq";
import DoctorsGuarantee from "@/components/doctors/DoctorsGuarantee";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsChatWidget from "@/components/doctors/DoctorsChatWidget";
import { doctorFaq, doctorPackages } from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "طراحی سایت و نوبت‌دهی آنلاین برای پزشکان | از ۱۴/۹ میلیون تومان — آرایه",
  description:
    "سایت بیمارآور برای مطب و کلینیک: نوبت‌دهی آنلاین، چت‌بات پاسخگوی بیماران، دامنه، سرور و درگاه پرداخت — کلید تحویل. قیمت شفاف، پرداخت آنلاین امن و تحویل نسخه اول در ۲ روز.",
  alternates: {
    canonical: "/doctors",
  },
  openGraph: {
    title: "طراحی سایت و نوبت‌دهی آنلاین برای پزشکان و مطب‌ها — آرایه",
    description:
      "سایت تخصصی مطب با نوبت‌دهی آنلاین و چت‌بات پاسخگوی بیماران؛ ۳ پکیج شفاف، پیش‌پرداخت آنلاین و شروع همان روز.",
    url: "/doctors",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت و نوبت‌دهی آنلاین برای پزشکان — آرایه",
    description: "سایت بیمارآور مطب با نوبت‌دهی آنلاین، چت‌بات و سئوی پزشکی؛ قیمت شفاف و تحویل ۲ روزه.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "طراحی سایت و نوبت‌دهی آنلاین برای پزشکان",
      serviceType: "طراحی وب‌سایت، نوبت‌دهی آنلاین و چت‌بات برای مطب و کلینیک",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/doctors",
      description:
        "سایت بیمارآور برای مطب با نوبت‌دهی آنلاین، چت‌بات پاسخگوی بیماران، دامنه، سرور و درگاه پرداخت — کلید تحویل.",
      offers: doctorPackages.map((p) => ({
        "@type": "Offer",
        name: `پکیج ${p.name}`,
        price: p.price,
        priceCurrency: "IRR",
        description: p.description,
      })),
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
      <Navbar />
      <DoctorsClientLogos />
      <main className="pb-20 sm:pb-0">
        <DoctorsHero />
        <DoctorsCases />
        <DoctorsFeatures />
        <DoctorsPackagesForm />
        <DoctorsCompareTable />
        <DoctorsFaq />
        <DoctorsGuarantee />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
      <DoctorsChatWidget />
    </>
  );
}
