import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptsIndexClient from "@/components/prompts/PromptsIndexClient";
import { canonicalUrl, SITE_URL } from "@/lib/siteUrl";
import { SITE_NAME, websitePartOfRef } from "@/lib/seo/siteIdentity";
import { ALL_PROMPTS } from "@/lib/prompts/promptData";

const title = "پرامپت‌های آماده هوش مصنوعی | آرایه";
const description =
  "کتابخانه رایگان پرامپت برای ChatGPT، Claude، Gemini و Araaye AI. کپی کن یا مستقیم داخل Araaye AI اجرا کن.";
const promptsUrl = canonicalUrl("/prompts");

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: promptsUrl },
  openGraph: {
    title,
    description,
    url: promptsUrl,
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
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
        url: promptsUrl,
        name: title,
        description,
        isPartOf: websitePartOfRef(),
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
            item: promptsUrl,
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
