/** بخش‌های ثابت RSC برای /ai — JSON-LD و chrome سبک */
export default function ArenaRscChrome() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "آرایه AI",
    applicationCategory: "ChatApplication",
    operatingSystem: "Web",
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
