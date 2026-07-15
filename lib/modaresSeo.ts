import { canonicalUrl } from "@/lib/siteUrl";
import { MODARES_FAQ, MODARES_STUDENT_PRICE_TOMAN } from "@/lib/modaresData";

/** مبلغ ریالی برای Schema.org (۱ تومان = ۱۰ ریال) */
function tomanToIrr(toman: number): number {
  return toman * 10;
}

export const MODARES_SEO = {
  title: "طراحی سایت مدرس و معلم خصوصی | آرایه",
  description:
    "طراحی سایت اختصاصی برای مدرسان؛ معرفی کلاس‌ها، جذب شاگرد، انتشار مقاله، درخواست کلاس و فروش دوره با طراحی حرفه‌ای و زیرساخت اولیه سئو.",
  path: "/modares",
} as const;

export const modaresJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "طراحی سایت مدرس و معلم خصوصی",
      serviceType: "طراحی سایت اختصاصی برای معلم‌ها و مدرسان خصوصی",
      provider: {
        "@type": "Organization",
        name: "آرایه",
        url: "https://araaye.com/",
      },
      areaServed: { "@type": "Country", name: "Iran" },
      url: canonicalUrl("/modares"),
      description: MODARES_SEO.description,
      offers: [
        {
          "@type": "Offer",
          name: "سایت حرفه‌ای مدرس",
          price: tomanToIrr(MODARES_STUDENT_PRICE_TOMAN),
          priceCurrency: "IRR",
          description: "نسخه اولیه تا ۲ روز کاری پس از دریافت کامل محتوا",
        },
        {
          "@type": "Offer",
          name: "سایت فروش دوره",
          price: tomanToIrr(15_000_000),
          priceCurrency: "IRR",
          description: "نسخه اولیه تا ۵ روز کاری پس از دریافت کامل محتوا",
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: MODARES_FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};
