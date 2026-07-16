import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DoctorsHeader from "@/components/doctors/DoctorsHeader";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsSalesSections from "@/components/doctors/DoctorsSalesSections";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsPageAnalytics from "@/components/doctors/DoctorsPageAnalytics";
import { doctorFaq } from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "طراحی سایت دندان‌پزشکی | ۲۰ میلیون — تحویل ۲ روز — آرایه",
  description:
    "سایت اختصاصی کلینیک دندان‌پزشکی با دمو تخصصی، تحویل ۲ روز کاری و قیمت ۲۰ میلیون تومان. سفارش در واتساپ.",
  alternates: {
    canonical: "/doctors/dentist",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "طراحی سایت دندان‌پزشکی — آرایه",
    description: "دمو دندان‌پزشکی، قیمت شفاف ۲۰ میلیون، سفارش در واتساپ.",
    url: "/doctors/dentist",
    type: "website",
    locale: "fa_IR",
  },
};

const dentistFilterKeys = ["dentist", "dentist-kordian"];

export default function DoctorsDentistPage() {
  return (
    <>
      <DoctorsPageAnalytics />
      <DoctorsHeader backHref="/doctors" backLabel="همه تخصص‌ها" />
      <main className="pb-20 sm:pb-0">
        <DoctorsHero
          badge="طراحی سایت ویژه دندان‌پزشکان و کلینیک‌های دندان"
          title="سایت اختصاصی کلینیک دندان شما؛ آماده معرفی خدمات و دریافت درخواست نوبت"
          subtitle="نسخه اول در ۲ روز کاری با صفحات درمان‌ها، قبل و بعد، پنل مقاله، واتساپ یا سامانه نوبت و سئوی فنی. مالکیت دامنه کاملاً برای شماست."
        />
        <DoctorsSalesSections
          specialtyFilterKeys={dentistFilterKeys}
          showCaseStudy={false}
          faqTitle="سؤالات رایج دندان‌پزشکان"
          faqItems={doctorFaq}
        />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
    </>
  );
}
