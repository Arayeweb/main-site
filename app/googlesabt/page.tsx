import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GooglesabtHero from "@/components/googlesabt/GooglesabtHero";
import GooglesabtPackagesForm from "@/components/googlesabt/GooglesabtPackagesForm";
import GooglesabtFaq from "@/components/googlesabt/GooglesabtFaq";
import GooglesabtStickyCta from "@/components/googlesabt/GooglesabtStickyCta";
import ToolHubLinks from "@/components/tools/ToolHubLinks";
import ToolHubIndex from "@/components/tools/ToolHubIndex";
import {
  googlesabtFaq,
  googlesabtHowToSteps,
  googlesabtPackages,
} from "@/lib/googlesabtData";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";
import { canonicalUrl } from "@/lib/siteUrl";
import { ORGANIZATION_ID, organizationProviderRef, SITE_NAME } from "@/lib/seo/siteIdentity";

export const metadata: Metadata = {
  title: { absolute: "ثبت گوگل مپ | ثبت کسب‌وکار در نقشه از ۵۹۰ هزار تومان — آرایه" },
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

const children = getPublishedToolPages("googlesabt");

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organizationProviderRef(),
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: SITE_NAME, item: canonicalUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "ثبت گوگل مپ",
          item: canonicalUrl("/googlesabt"),
        },
      ],
    },
    {
      "@type": "Service",
      name: "ثبت کسب‌وکار در گوگل مپ و نقشه‌ها",
      serviceType: "ثبت و درستی‌سنجی لوکیشن کسب‌وکار در گوگل مپ، نشان، بلد و اسنپ",
      provider: { "@id": ORGANIZATION_ID },
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl("/googlesabt"),
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
      "@type": "HowTo",
      name: "مراحل ثبت کسب‌وکار در گوگل مپ با آرایه",
      step: googlesabtHowToSteps.map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        text,
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
    {
      "@type": "ItemList",
      name: "ثبت گوگل مپ برای صنوف مختلف",
      numberOfItems: children.length,
      itemListElement: children.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.primaryKeyword,
        url: canonicalUrl(`/googlesabt/${c.slug}`),
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
        <ToolHubIndex
          hub="googlesabt"
          title="ثبت گوگل مپ برای چه کسب‌وکارهایی؟"
          subtitle="راهنمای ثبت رستوران، مطب، کلینیک، آرایشگاه، فروشگاه و بیشتر"
        />
        <GooglesabtFaq />
        <ToolHubLinks
          title="ابزارهای رایگان مرتبط"
          subtitle="کارت ویزیت، لینک کوتاه و QR برای تکمیل حضور آنلاین"
        />
      </main>
      <Footer />
      <GooglesabtStickyCta />
    </>
  );
}
