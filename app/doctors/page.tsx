import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DoctorsHeader from "@/components/doctors/DoctorsHeader";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsTrustBar from "@/components/doctors/DoctorsTrustBar";
import DoctorsUrgencyBar from "@/components/doctors/DoctorsUrgencyBar";
import DoctorsSalesSections from "@/components/doctors/DoctorsSalesSections";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsChatWidget from "@/components/doctors/DoctorsChatWidget";
import DoctorsPageAnalytics from "@/components/doctors/DoctorsPageAnalytics";
import {
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorFaq,
  tomanToIrr,
} from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: {
    absolute: "طراحی سایت پزشکی | نمونه‌کار + قیمت ۲۰ میلیون | آرایه",
  },
  description:
    "طراحی سایت اختصاصی پزشکان و مطب با صفحات خدمات، اتصال نوبت‌دهی، پنل مقاله و سئوی فنی. قیمت ۲۰ میلیون، شروع با ۶ میلیون و نسخه اولیه در ۲ روز کاری.",
  alternates: {
    canonical: "https://araaye.com/doctors",
  },
  openGraph: {
    title: "طراحی سایت پزشکی | نمونه‌کار + قیمت ۲۰ میلیون | آرایه",
    description:
      "جذب بیمار از گوگل تا درخواست نوبت. قیمت ۲۰ میلیون، شروع با ۶ میلیون، نسخه اولیه در ۲ روز.",
    url: "https://araaye.com/doctors",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت پزشکی | نمونه‌کار + قیمت ۲۰ میلیون | آرایه",
    description: "شروع با ۶ میلیون — نسخه اولیه در ۲ روز — مالکیت کامل پزشک.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "طراحی سایت پزشکی",
      description:
        "طراحی سایت اختصاصی مطب تک‌پزشک برای جذب بیمار از گوگل و تبدیل بازدید به درخواست نوبت.",
      provider: {
        "@type": "Organization",
        name: "آرایه",
        url: "https://araaye.com",
      },
      areaServed: "IR",
      url: "https://araaye.com/doctors",
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
        {
          "@type": "ListItem",
          position: 2,
          name: "طراحی سایت پزشکی",
          item: "https://araaye.com/doctors",
        },
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
      <main className="pb-24 sm:pb-0">
        <DoctorsHero />
        <DoctorsUrgencyBar />
        <DoctorsTrustBar />
        <DoctorsSalesSections />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
      <DoctorsChatWidget />
    </>
  );
}
