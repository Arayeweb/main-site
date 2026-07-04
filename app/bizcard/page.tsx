import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BizcardHero from "@/components/bizcard/BizcardHero";
import BizcardBuilder from "@/components/bizcard/BizcardBuilder";
import BizcardSteps from "@/components/bizcard/BizcardSteps";
import BizcardFeatures from "@/components/bizcard/BizcardFeatures";
import BizcardTestimonials from "@/components/bizcard/BizcardTestimonials";
import BizcardFaq from "@/components/bizcard/BizcardFaq";
import BizcardFinalCta from "@/components/bizcard/BizcardFinalCta";
import BizcardFomoToast from "@/components/bizcard/BizcardFomoToast";
import BizcardStickyCta from "@/components/bizcard/BizcardStickyCta";
import { bizcardFaq } from "@/lib/bizcardData";

export const metadata: Metadata = {
  title: "کارت ویزیت دیجیتال رایگان | لینک اختصاصی + QR کد — آرایه",
  description:
    "کارت ویزیت دیجیتال رایگان بساز — لینک اختصاصی، QR کد، نقشه، تماس و شبکه‌های اجتماعی. برای هر کسب‌وکاری. بدون نصب اپ.",
  alternates: { canonical: "/bizcard" },
  openGraph: {
    title: "کارت ویزیت دیجیتال رایگان — آرایه",
    description: "لینک اختصاصی، QR کد، نقشه و شبکه‌های اجتماعی در یک صفحه. رایگان، همیشه.",
    url: "/bizcard",
    type: "website",
    locale: "fa_IR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "کارت ویزیت دیجیتال رایگان",
      description: "ساخت کارت ویزیت دیجیتال رایگان با لینک اختصاصی و QR کد",
      url: "https://araaye.com/bizcard",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com" },
    },
    {
      "@type": "FAQPage",
      mainEntity: bizcardFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function BizcardPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <BizcardHero countLabel="۵۰۰+" />
        <BizcardBuilder />
        <BizcardSteps />
        <BizcardFeatures />
        <BizcardTestimonials />
        <BizcardFaq />
        <BizcardFinalCta />
      </main>
      <Footer />
      <BizcardStickyCta />
      <BizcardFomoToast />
    </>
  );
}
