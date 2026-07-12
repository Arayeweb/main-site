import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactPageContent from "@/components/contact/ContactPageContent";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "تماس با آرایه | از کجا شروع کنیم؟",
  description:
    "مسئله کسب‌وکارتان را بگویید تا مسیر مناسب مشخص شود. تماس تلفنی، واتساپ، ایمیل یا فرم کوتاه برای شروع گفت‌وگو با آرایه.",
  alternates: {
    canonical: canonicalUrl("/contact"),
  },
  openGraph: {
    title: "تماس با آرایه | از کجا شروع کنیم؟",
    description:
      "مسئله کسب‌وکارتان را بگویید تا مسیر مناسب مشخص شود. تماس تلفنی، واتساپ، ایمیل یا فرم کوتاه برای شروع گفت‌وگو با آرایه.",
    url: "/contact",
    type: "website",
    locale: "fa_IR",
  },
};

export default function ContactPage() {
  return (
    <>
      <Navbar solid />
      <main>
        <ContactPageContent />
      </main>
      <Footer />
    </>
  );
}
