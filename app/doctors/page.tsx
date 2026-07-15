import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsSampleReport from "@/components/doctors/DoctorsSampleReport";
import DoctorsCaseStudy from "@/components/doctors/DoctorsCaseStudy";
import DoctorsAfterReport from "@/components/doctors/DoctorsAfterReport";
import DoctorsFitCheck from "@/components/doctors/DoctorsFitCheck";
import DoctorsFaq from "@/components/doctors/DoctorsFaq";
import DoctorsFinalCta from "@/components/doctors/DoctorsFinalCta";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsPageAnalytics from "@/components/doctors/DoctorsPageAnalytics";
import { doctorFaq } from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "بررسی رایگان مسیر جذب بیمار مطب | ویژه پزشکان — آرایه",
  description:
    "وضعیت دیده‌شدن، اطلاعات مطب، معرفی خدمات و مسیر تماس یا نوبت را رایگان بررسی می‌کنیم. مشکل اصلی و سه اقدام اولویت‌دار را در واتساپ دریافت کنید.",
  alternates: {
    canonical: "/doctors",
  },
  openGraph: {
    title: "بررسی رایگان مسیر جذب بیمار مطب — آرایه",
    description:
      "برای پزشکان و مطب‌ها: گزارش رایگان مسیر آنلاین جذب بیمار — بدون فشار فروش و بدون نیاز به داشتن سایت.",
    url: "/doctors",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "بررسی رایگان مسیر جذب بیمار مطب — آرایه",
    description:
      "مشکل اصلی مسیر آنلاین مطب و سه اقدام اولویت‌دار — حداکثر تا پایان روز کاری بعد در واتساپ.",
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
        "بررسی دیده‌شدن در جستجو، اطلاعات مطب، معرفی خدمات و مسیر تماس یا درخواست نوبت؛ ارائه گزارش رایگان با پیشنهادهای عملی.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IRR",
        description: "گزارش رایگان بررسی مسیر جذب بیمار",
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
      <Navbar ctaHref="/doctors#audit" ctaLabel="دریافت گزارش رایگان" />
      <main className="pb-20 sm:pb-0">
        <DoctorsHero />
        <DoctorsSampleReport />
        <DoctorsCaseStudy />
        <DoctorsAfterReport />
        <DoctorsFitCheck />
        <DoctorsFaq />
        <DoctorsFinalCta />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
    </>
  );
}
