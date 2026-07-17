import type { Metadata } from "next";
import Footer from "@/components/Footer";
import DoctorsHeader from "@/components/doctors/DoctorsHeader";
import DoctorsHero from "@/components/doctors/DoctorsHero";
import DoctorsSalesSections from "@/components/doctors/DoctorsSalesSections";
import DoctorsExitIntent from "@/components/doctors/DoctorsExitIntent";
import DoctorsStickyCta from "@/components/doctors/DoctorsStickyCta";
import DoctorsChatWidget from "@/components/doctors/DoctorsChatWidget";
import DoctorsPageAnalytics from "@/components/doctors/DoctorsPageAnalytics";
import { doctorFaq } from "@/lib/doctorsData";

export const metadata: Metadata = {
  title: "طراحی سایت دندان‌پزشکی | ۲۰ میلیون — تحویل ۲ روز — آرایه",
  description:
    "سایت اختصاصی کلینیک دندان‌پزشکی با دمو تخصصی، تحویل ۲ روز کاری و قیمت ۲۰ میلیون تومان.",
  alternates: {
    canonical: "/doctors/dentist",
  },
  robots: {
    index: false,
    follow: true,
  },
  openGraph: {
    title: "طراحی سایت دندان‌پزشکی — آرایه",
    description: "دمو دندان‌پزشکی، قیمت شفاف ۲۰ میلیون، دریافت نمونه و پیش‌فاکتور.",
    url: "/doctors/dentist",
    type: "website",
    locale: "fa_IR",
  },
};

const dentistFilterKeys = ["dentist"];

export default function DoctorsDentistPage() {
  return (
    <>
      <DoctorsPageAnalytics />
      <DoctorsHeader backHref="/doctors" backLabel="همه تخصص‌ها" />
      <main className="pb-20 sm:pb-0">
        <DoctorsHero
          eyebrow="طراحی سایت دندانپزشکی"
          title="بیمار خدمت دندان را در گوگل می‌جوید؛ سایت باید او را به درخواست مشاوره برساند"
          subtitle="سایت اختصاصی با صفحات درمان، نمونه کار و مسیر نوبت یا واتساپ. نسخه اولیه در ۲ روز کاری؛ قیمت ثابت ۲۰ میلیون و شروع با ۶ میلیون."
        />
        <DoctorsSalesSections
          specialtyFilterKeys={dentistFilterKeys}
          faqTitle="سؤالات رایج دندان‌پزشکان"
          faqItems={doctorFaq}
        />
      </main>
      <Footer />
      <DoctorsExitIntent />
      <DoctorsStickyCta />
      <DoctorsChatWidget />
    </>
  );
}
