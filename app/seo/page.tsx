import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeoHero from "@/components/seo/SeoHero";
import SeoLocalCases from "@/components/seo/SeoLocalCases";
import SeoFeatures from "@/components/seo/SeoFeatures";
import SeoPackagesForm from "@/components/seo/SeoPackagesForm";
import SeoCompareTable from "@/components/seo/SeoCompareTable";
import SeoGuarantee from "@/components/seo/SeoGuarantee";
import SeoFaq from "@/components/seo/SeoFaq";
import SeoExitIntent from "@/components/seo/SeoExitIntent";
import SeoStickyCta from "@/components/seo/SeoStickyCta";
import SeoChatWidget from "@/components/seo/SeoChatWidget";
import { seoFaq } from "@/lib/seoData";

export const metadata: Metadata = {
  title: "سئوی محلی سایت | از ۸۹۰ هزار تومان — در جستجوی محلی گوگل دیده شو",
  description:
    "خدمات سئوی محلی برای کلینیک‌ها، رستوران‌ها و کسب‌وکارهای خدماتی: بهینه‌سازی نقشه گوگل، محتوای محلی و رفع مشکلات فنی. بررسی رایگان ۲۴ ساعته و پرداخت آنلاین امن.",
  alternates: {
    canonical: "/seo",
  },
  openGraph: {
    title: "سئوی محلی سایت از ۸۹۰ هزار تومان — آرایه",
    description:
      "بررسی رایگان سئوی محلی، بهینه‌سازی نقشه گوگل و محتوای محلی برای کسب‌وکارهای ایرانی. پرداخت آنلاین امن، شروع در ۲ ساعت.",
    url: "/seo",
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "سئوی محلی سایت از ۸۹۰ هزار تومان — آرایه",
    description: "بررسی رایگان سئوی محلی، بهینه‌سازی نقشه گوگل و محتوای محلی برای کسب‌وکارهای ایرانی.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "خدمات سئوی محلی و بهینه‌سازی موتورهای جستجو",
      serviceType: "Local SEO, Google Business Profile optimization, technical SEO, content SEO",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/seo",
      description:
        "بررسی رایگان سئوی محلی، بهینه‌سازی نقشه گوگل، بهینه‌سازی تکنیکال سایت و تولید محتوای محلی برای کسب‌وکارهای ایرانی.",
    },
    {
      "@type": "FAQPage",
      mainEntity: seoFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function SeoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="pb-20 sm:pb-0">
        <SeoHero />
        <SeoLocalCases />
        <SeoFeatures />
        <SeoPackagesForm />
        <SeoCompareTable />
        <SeoFaq />
        <SeoGuarantee />
      </main>
      <Footer />
      <SeoChatWidget />
      <SeoExitIntent />
      <SeoStickyCta />
    </>
  );
}
