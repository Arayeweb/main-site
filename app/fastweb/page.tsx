import type { Metadata } from "next";
import FastWebLanding, { fastwebFaq } from "@/components/fastweb/FastWebLanding";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "سایت فوری آرایه | نسخه اول قابل انتشار در ۲۴ ساعت کاری",
  description:
    "کسب‌وکارت را توضیح بده؛ آرایه نسخه اول قابل انتشار سایت را در ۲۴ ساعت کاری آماده می‌کند. قبل از انتشار، خروجی را می‌بینی و تأیید می‌کنی.",
  alternates: { canonical: canonicalUrl("/fastweb") },
  openGraph: {
    title: "سایت فوری آرایه | نسخه اول قابل انتشار در ۲۴ ساعت کاری",
    description:
      "کاربر فقط کسب‌وکارش را توضیح می‌دهد؛ آرایه نسخه اول قابل انتشار سایت را در ۲۴ ساعت کاری آماده می‌کند.",
    url: canonicalUrl("/fastweb"),
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "سایت فوری آرایه",
    description:
      "نسخه اول قابل انتشار سایت کسب‌وکار در ۲۴ ساعت کاری — پس از تکمیل اطلاعات اولیه.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "سایت فوری آرایه",
      serviceType: "First publishable business website delivery",
      provider: { "@type": "Organization", name: "آرایه", url: "https://araaye.com/" },
      areaServed: { "@type": "Country", name: "Iran" },
      url: "https://araaye.com/fastweb",
      description:
        "کاربر فقط کسب‌وکارش را توضیح می‌دهد؛ آرایه نسخه اول قابل انتشار سایت را در ۲۴ ساعت کاری آماده می‌کند.",
      offers: [
        {
          "@type": "Offer",
          name: "سایت فوری",
          price: "4900000",
          priceCurrency: "IRR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "سایت فوری پلاس",
          price: "7900000",
          priceCurrency: "IRR",
          availability: "https://schema.org/InStock",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: fastwebFaq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

export default function FastWebPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FastWebLanding />
    </>
  );
}
