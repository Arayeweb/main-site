import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PromptCard from "@/components/prompts/PromptCard";
import {
  getIndexablePromptsByCategory,
  isPromptComplete,
} from "@/lib/prompts/indexable";
import {
  PROMPT_CATEGORIES,
  getCategoryMeta,
  isPromptCategoryId,
} from "@/lib/prompts/promptTypes";
import { ALL_PROMPTS } from "@/lib/prompts/promptData";
import { canonicalUrl, SITE_URL } from "@/lib/siteUrl";
import { SITE_NAME, websitePartOfRef } from "@/lib/seo/siteIdentity";

export const dynamic = "force-static";

export function generateStaticParams() {
  return PROMPT_CATEGORIES.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  if (!isPromptCategoryId(params.category)) {
    return { title: "دسته پیدا نشد" };
  }
  const meta = getCategoryMeta(params.category)!;
  const pageUrl = canonicalUrl(`/prompts/category/${meta.id}`);

  return {
    title: { absolute: meta.metaTitle },
    description: meta.metaDescription,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: pageUrl,
      type: "website",
      locale: "fa_IR",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.metaTitle,
      description: meta.metaDescription,
    },
  };
}

export default function PromptCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  if (!isPromptCategoryId(params.category)) notFound();

  const meta = getCategoryMeta(params.category)!;
  const prompts = getIndexablePromptsByCategory(meta.id).filter(isPromptComplete);
  const pageUrl = canonicalUrl(`/prompts/category/${meta.id}`);
  const otherCategories = PROMPT_CATEGORIES.filter((c) => c.id !== meta.id).slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: meta.metaTitle,
        description: meta.metaDescription,
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
            name: meta.label,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: `پرامپت‌های ${meta.label}`,
        numberOfItems: prompts.length,
        itemListElement: prompts.map((prompt, index) => ({
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
      <main className="pb-16">
        <section className="relative overflow-hidden border-b border-navy-100">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-cyan-50" />
          <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
          <div className="container-mx container-px relative py-12 sm:py-16">
            <nav className="mb-6 text-sm text-navy-400" aria-label="breadcrumb">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-navy-700">
                    خانه
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li>
                  <Link href="/prompts" className="hover:text-navy-700">
                    پرامپت‌ها
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li className="text-navy-700">{meta.label}</li>
              </ol>
            </nav>
            <p className="text-sm font-bold text-brand-600">دسته پرامپت</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl">
              پرامپت‌های {meta.label}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-navy-500">{meta.intro}</p>
            <p className="mt-3 text-sm text-navy-400">
              {prompts.length.toLocaleString("fa-IR")} پرامپت آماده · از{" "}
              {ALL_PROMPTS.length.toLocaleString("fa-IR")} پرامپت کل کتابخانه
            </p>
          </div>
        </section>

        <section className="container-mx container-px pt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.slug} prompt={prompt} />
            ))}
          </div>
        </section>

        <section className="container-mx container-px mt-14">
          <h2 className="text-lg font-extrabold text-navy-900">دسته‌های دیگر</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/prompts/category/${cat.id}`}
                className="rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs font-bold text-navy-600 hover:border-brand-200 hover:bg-brand-50/40"
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/prompts"
              className="rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white"
            >
              همه پرامپت‌ها
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
