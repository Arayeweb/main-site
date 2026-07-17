import { ORGANIZATION_ID } from "@/lib/seo/siteIdentity";

/** بخش‌های ثابت RSC برای /ai — JSON-LD و chrome سبک */
export default function ArenaRscChrome() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "هوش مصنوعی آرایه",
    alternateName: ["آرایه AI", "Araaye AI", "ارایه AI"],
    applicationCategory: "ChatApplication",
    operatingSystem: "Web",
    provider: { "@id": ORGANIZATION_ID },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
      description: "۱۰ پیام چت رایگان برای مهمان",
    },
    inLanguage: "fa",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
