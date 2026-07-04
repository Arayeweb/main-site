import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GooglesabtHero from "@/components/googlesabt/GooglesabtHero";
import GooglesabtPackagesForm from "@/components/googlesabt/GooglesabtPackagesForm";
import GooglesabtFaq from "@/components/googlesabt/GooglesabtFaq";
import GooglesabtStickyCta from "@/components/googlesabt/GooglesabtStickyCta";
import { googlesabtFaq, googlesabtPackages } from "@/lib/googlesabtData";

export const metadata: Metadata = {
  title: "ثبت گوگل مپ | از ۵۹۰ هزار تومان — کسب‌وکارت را روی نقشه دیده کن — آرایه",
  description:
    "ثبت کسب‌وکار در گوگل مپ، نشان، بلد، اسنپ و OpenStreetMap. ۳ پکیج شفاف، پیش‌پرداخت آنلاین و لینک BizCard با همه مسیریاب‌ها از پکیج محبوب.",
  alternates: {
    canonical: "/googlesabt",
  },
  openGraph: {
    title: "ثبت کسب‌وکار در گوگل مپ از ۵۹۰ هزار تومان — آرایه",
    description:
      "ثبت در گوگل مپ، نشان، بلد و اسنپ + لینک همه‌کاره BizCard. تحویل کمتر از یک روز. پرداخت آنلاین امن.",
    url: "/googlesabt",
    type: "website",
    locale: "fa_IR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "ثبت کسب‌وکار در گوگل مپ و نقشه‌ها",
      serviceType: "ثبت و درستی‌سنجی لوکیشن کسب‌وکار در گوگل مپ، نشان، بلد و اسنپ",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/googlesabt",
      description:
        "ثبت لوکیشن، نام، عکس و ساعت کاری کسب‌وکار در گوگل مپ، نشان، بلد و اسنپ، با لینک BizCard و همه مسیریاب‌ها.",
      offers: googlesabtPackages.map((p) => ({
        "@type": "Offer",
        name: `پکیج ${p.name}`,
        price: p.price,
        priceCurrency: "IRR",
        description: p.description,
      })),
    },
    {
      "@type": "FAQPage",
      mainEntity: googlesabtFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function GooglesabtPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <GooglesabtHero />
        <GooglesabtPackagesForm />
        <GooglesabtFaq />
      </main>
      <Footer />
      <GooglesabtStickyCta />
    </>
  );
}
