import type { Metadata } from "next";
import FastWebLanding from "@/components/fastweb/FastWebLanding";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "سایت فوری آرایه | نسخه قابل انتشار تا ۲۴ ساعت کاری",
  description:
    "اطلاعات کسب‌وکارت را بده؛ نسخه اول قابل انتشار سایت معرفی یک‌صفحه‌ای را تا ۲۴ ساعت کاری پس از تکمیل اطلاعات و پرداخت تحویل بگیر.",
  alternates: { canonical: canonicalUrl("/fastweb") },
  openGraph: {
    title: "سایت فوری آرایه",
    description:
      "سایت رسمی کسب‌وکار با قالب کنترل‌شده — پیش‌نمایش رایگان قبل از پرداخت.",
    url: canonicalUrl("/fastweb"),
    type: "website",
  },
};

export default function FastWebPage() {
  return (
    <>
      <FastWebLanding />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "سایت فوری آرایه",
            description:
              "سایت معرفی کسب‌وکار یک‌صفحه‌ای با تحویل نسخه اول تا ۲۴ ساعت کاری",
            brand: { "@type": "Brand", name: "آرایه" },
            offers: [
              {
                "@type": "Offer",
                name: "سایت فوری",
                price: "49000000",
                priceCurrency: "IRR",
                availability: "https://schema.org/InStock",
              },
              {
                "@type": "Offer",
                name: "سایت فوری پلاس",
                price: "79000000",
                priceCurrency: "IRR",
                availability: "https://schema.org/InStock",
              },
            ],
          }),
        }}
      />
    </>
  );
}
