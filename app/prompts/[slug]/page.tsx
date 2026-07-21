import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptPage from "@/components/prompts/PromptPage";
import { ALL_PROMPTS, getPromptBySlug } from "@/lib/prompts/promptData";
import { isPromptIndexable } from "@/lib/prompts/indexable";
import { getCategoryLabel } from "@/lib/prompts/promptTypes";
import { canonicalUrl, SITE_URL } from "@/lib/siteUrl";
import { SITE_NAME, websitePartOfRef } from "@/lib/seo/siteIdentity";

export const dynamic = "force-static";

export function generateStaticParams() {
  return ALL_PROMPTS.map((prompt) => ({ slug: prompt.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const prompt = getPromptBySlug(params.slug);
  if (!prompt) return { title: "پرامپت پیدا نشد" };

  const indexable = isPromptIndexable(prompt.slug);

  const pageUrl = canonicalUrl(prompt.canonicalPath);

  return {
    title: { absolute: prompt.metaTitle },
    description: prompt.metaDescription,
    alternates: { canonical: pageUrl },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
    openGraph: {
      title: prompt.metaTitle,
      description: prompt.metaDescription,
      url: pageUrl,
      type: "article",
      locale: "fa_IR",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.metaTitle,
      description: prompt.metaDescription,
    },
  };
}

export default function PromptSlugPage({ params }: { params: { slug: string } }) {
  const prompt = getPromptBySlug(params.slug);
  if (!prompt) notFound();

  const pageUrl = canonicalUrl(prompt.canonicalPath);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: prompt.metaTitle,
        description: prompt.metaDescription,
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
            name: "پرامپت‌ها",
            item: canonicalUrl("/prompts"),
          },
          {
            "@type": "ListItem",
            position: 3,
            name: getCategoryLabel(prompt.category),
            item: canonicalUrl(`/prompts/category/${prompt.category}`),
          },
          {
            "@type": "ListItem",
            position: 4,
            name: prompt.title,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: prompt.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
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
        <PromptPage prompt={prompt} />
      </main>
      <Footer />
    </>
  );
}
