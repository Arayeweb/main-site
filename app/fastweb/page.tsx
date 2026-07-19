import type { Metadata } from "next";
import FastWebLanding, { fastwebFaq } from "@/components/fastweb/FastWebLanding";
import FastWebPageAnalytics from "@/components/fastweb/FastWebPageAnalytics";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  // absolute: جلوگیری از دوباره‌شدن «| آرایه» به‌خاطر title.template در root layout
  title: { absolute: "طراحی سایت ارزان و فوری | تحویل ۲۴ ساعته | آرایه" },
  description:
    "طراحی سایت ارزان و فوری برای کسب‌وکارهای کوچک؛ نسخه اول قابل انتشار در ۲۴ ساعت کاری، پیش‌نمایش قبل از پرداخت و شروع قیمت از ۴.۹ میلیون تومان.",
  alternates: { canonical: "/fastweb" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "طراحی سایت ارزان و فوری | تحویل ۲۴ ساعته | آرایه",
    description:
      "طراحی سایت ارزان و فوری برای کسب‌وکارهای کوچک؛ نسخه اول قابل انتشار در ۲۴ ساعت کاری و شروع از ۴.۹ میلیون تومان.",
    url: canonicalUrl("/fastweb"),
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: "طراحی سایت ارزان و فوری | تحویل ۲۴ ساعته | آرایه",
    description:
      "نسخه اول قابل انتشار سایت کسب‌وکار در ۲۴ ساعت کاری — شروع از ۴.۹ میلیون تومان.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "سایت فوری آرایه",
      serviceType: "First publishable business website delivery",
      provider: { "@type": "Organization", name: "آرایه", url: canonicalUrl("/") },
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl("/fastweb"),
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
      <FastWebPageAnalytics />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FastWebLanding />
    </>
  );
}
