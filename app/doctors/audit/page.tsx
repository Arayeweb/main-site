import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DoctorsHeader from "@/components/doctors/DoctorsHeader";
import DoctorsAuditHero from "@/components/doctors/DoctorsAuditHero";
import DoctorsSampleReport from "@/components/doctors/DoctorsSampleReport";
import DoctorsFitCheck from "@/components/doctors/DoctorsFitCheck";
import DoctorsFaq from "@/components/doctors/DoctorsFaq";
import DoctorsPageAnalytics from "@/components/doctors/DoctorsPageAnalytics";
import { doctorAfterReportTrust, doctorAuditCooperationNote, doctorAuditFaq } from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "بررسی رایگان مسیر جذب بیمار مطب | ویژه پزشکان — آرایه",
  description:
    "وضعیت دیده‌شدن، اطلاعات مطب، معرفی خدمات و مسیر تماس یا نوبت را رایگان بررسی می‌کنیم. مشکل اصلی و سه اقدام اولویت‌دار را در واتساپ دریافت کنید.",
  alternates: {
    canonical: "/doctors/audit",
  },
  openGraph: {
    title: "بررسی رایگان مسیر جذب بیمار مطب — آرایه",
    description:
      "برای پزشکان و مطب‌ها: گزارش رایگان مسیر آنلاین جذب بیمار — بدون نیاز به داشتن سایت.",
    url: "/doctors/audit",
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
      url: "https://araaye.com/doctors/audit",
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
        { "@type": "ListItem", position: 2, name: "پزشکان", item: "https://araaye.com/doctors" },
        { "@type": "ListItem", position: 3, name: "بررسی رایگان", item: "https://araaye.com/doctors/audit" },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: doctorAuditFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function DoctorsAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DoctorsPageAnalytics />
      <DoctorsHeader backHref="/doctors" variant="minimal" />
      <main className="pb-20 sm:pb-0">
        <DoctorsAuditHero />
        <DoctorsSampleReport />
        <DoctorsFitCheck />
        <DoctorsFaq
          items={doctorAuditFaq}
          note={`${doctorAuditCooperationNote} ${doctorAfterReportTrust}`}
          title="سؤالات بررسی رایگان"
        />
      </main>
      <Footer />
    </>
  );
}
