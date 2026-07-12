import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebsiteProjectBriefForm from "@/components/website-design/website-project-brief/WebsiteProjectBriefForm";

export const metadata: Metadata = {
  title: "فرم کوتاه شروع پروژه طراحی سایت | آرایه",
  description:
    "با پاسخ به چند سؤال کوتاه، اطلاعات اولیه پروژه طراحی سایت خود را ثبت کنید و پیشنهاد متناسب آرایه را دریافت کنید.",
  alternates: {
    canonical: "/website-design/brief",
  },
  robots: { index: false, follow: false },
};

export default function WebsiteDesignBriefPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-navy-50/40 to-white pt-20 pb-12">
        <WebsiteProjectBriefForm />
      </main>
      <Footer />
    </>
  );
}
