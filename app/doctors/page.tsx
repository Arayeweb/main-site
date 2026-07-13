import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsSampleReport from "@/components/doctors/DoctorsSampleReport";
import DoctorsCaseStudy from "@/components/doctors/DoctorsCaseStudy";
import DoctorsPatientPath from "@/components/doctors/DoctorsPatientPath";
import DoctorsProblems from "@/components/doctors/DoctorsProblems";
import DoctorsOutputs from "@/components/doctors/DoctorsOutputs";
import DoctorsProcess from "@/components/doctors/DoctorsProcess";
import DoctorsPricingTeaser from "@/components/doctors/DoctorsPricingTeaser";
import DoctorsFaq from "@/components/doctors/DoctorsFaq";
import DoctorsFinalCta from "@/components/doctors/DoctorsFinalCta";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsChatWidget from "@/components/doctors/DoctorsChatWidget";
import { doctorFaq, doctorPackages, tomanToIrr } from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "بررسی رایگان مسیر جذب بیمار مطب | ویژه پزشکان — آرایه",
  description:
    "حضور مطب در گوگل، صفحه خدمات و مسیر درخواست نوبت را رایگان بررسی می‌کنیم. سه ایراد مهم و پیشنهاد عملی را در واتساپ دریافت کنید.",
  alternates: {
    canonical: "/doctors",
  },
  openGraph: {
    title: "بررسی رایگان مسیر جذب بیمار مطب — آرایه",
    description:
      "برای پزشکان و مطب‌ها: گزارش رایگان وضعیت حضور در گوگل، صفحه خدمات و مسیر نوبت — بدون فشار فروش پکیج.",
    url: "/doctors",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "بررسی رایگان مسیر جذب بیمار مطب — آرایه",
    description: "سه ایراد مهم جذب بیمار مطب را تا پایان روز کاری در واتساپ دریافت کنید.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "بررسی رایگان مسیر جذب بیمار مطب",
      serviceType: "مشاوره و بررسی حضور دیجیتال مطب و کلینیک",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/doctors",
      description:
        "بررسی حضور مطب در گوگل، صفحه خدمات و مسیر درخواست نوبت؛ ارائه گزارش رایگان با پیشنهادهای عملی.",
      offers: doctorPackages.map((p) => ({
        "@type": "Offer",
        name: `پکیج ${p.name}`,
        price: tomanToIrr(p.price),
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
      <main className="pb-20 sm:pb-0">
        <DoctorsHero />
        <DoctorsSampleReport />
        <DoctorsCaseStudy />
        <DoctorsPatientPath />
        <DoctorsProblems />
        <DoctorsOutputs />
        <DoctorsProcess />
        <DoctorsPricingTeaser />
        <DoctorsFaq />
        <DoctorsFinalCta />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
      <DoctorsChatWidget />
    </>
  );
}
