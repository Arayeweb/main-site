import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClinicHero from "@/components/clinic/ClinicHero";
import ClinicSections from "@/components/clinic/ClinicSections";
import ClinicFaq from "@/components/clinic/ClinicFaq";
import ClinicLeadForm from "@/components/clinic/ClinicLeadForm";
import ClinicStickyCta from "@/components/clinic/ClinicStickyCta";
import { clinicFaq } from "@/lib/clinicData";

export const metadata: Metadata = {
  title: "طراحی سایت لوکس و رزرو آنلاین برای کلینیک‌های زیبایی",
  description:
    "آرایه برای کلینیک زیبایی شما سایتی مشتری‌ساز می‌سازد: گالری نتایج، رزرو آنلاین با بیعانه، چت‌بات دایرکت، دامنه، سرور و درگاه پرداخت.",
  alternates: {
    canonical: "/clinic",
  },
  openGraph: {
    title: "طراحی سایت و رزرو آنلاین برای کلینیک‌های زیبایی | آرایه",
    description:
      "سایت مشتری‌ساز برای کلینیک زیبایی؛ گالری نتایج، رزرو آنلاین با بیعانه، چت‌بات پاسخگوی دایرکت، دامنه، سرور و درگاه پرداخت.",
    url: "/clinic",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت و رزرو آنلاین برای کلینیک‌های زیبایی | آرایه",
    description: "گالری نتایج، رزرو آنلاین و چت‌بات دایرکت برای کلینیک زیبایی — آرایه",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "طراحی سایت و رزرو آنلاین کلینیک زیبایی",
      serviceType: "طراحی وب‌سایت و چت‌بات برای کلینیک‌های زیبایی",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/clinic",
      description:
        "سایت مشتری‌ساز کلینیک زیبایی با گالری نتایج، رزرو آنلاین با بیعانه، چت‌بات پاسخگوی دایرکت و زیرساخت پایدار.",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: "https://araaye.com/" },
        {
          "@type": "ListItem",
          position: 2,
          name: "کلینیک زیبایی",
          item: "https://araaye.com/clinic",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: clinicFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function ClinicPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar ctaLabel="مشاوره رایگان" ctaHref="#leadform" />
      <main className="pb-20 sm:pb-0">
        <ClinicHero />
        <ClinicSections />
        <ClinicFaq />
        <ClinicLeadForm />
      </main>
      <Footer />
      <ClinicStickyCta />
    </>
  );
}
