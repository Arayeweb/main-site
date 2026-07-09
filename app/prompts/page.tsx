import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptsIndexClient from "@/components/prompts/PromptsIndexClient";
import { canonicalUrl, SITE_URL } from "@/lib/siteUrl";
import { ALL_PROMPTS } from "@/lib/prompts/promptData";

const title = "پرامپت‌های آماده هوش مصنوعی | Araaye AI";
const description =
  "کتابخانه رایگان پرامپت برای ChatGPT، Claude، Gemini و Araaye AI. کپی کن یا مستقیم داخل Araaye AI اجرا کن.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/prompts" },
  openGraph: {
    title,
    description,
    url: "/prompts",
    type: "website",
    locale: "fa_IR",
    siteName: "آرایه",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function PromptsIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/prompts#webpage`,
        url: canonicalUrl("/prompts"),
        name: title,
        description,
        isPartOf: { "@type": "WebSite", name: "آرایه", url: SITE_URL },
        inLanguage: "fa-IR",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "خانه",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "پرامپت‌های آماده",
            item: canonicalUrl("/prompts"),
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "پرامپت‌های آماده Araaye AI",
        numberOfItems: ALL_PROMPTS.length,
        itemListElement: ALL_PROMPTS.map((prompt, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: prompt.title,
          url: canonicalUrl(prompt.canonicalPath),
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <PromptsIndexClient />
      </main>
      <Footer />
    </>
  );
}
