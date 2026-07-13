"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getKordianMessages } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";
import { useKordianArticles } from "./KordianArticlesProvider";

export default function KordianArticlePage({
  locale,
  slug,
  preview = false,
}: {
  locale: KordianLocale;
  slug: string;
  preview?: boolean;
}) {
  const t = getKordianMessages(locale);
  const { getBySlug, ready } = useKordianArticles();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const article = mounted && ready ? getBySlug(slug) : undefined;
  const isDraft = article?.status === "draft";

  if (!mounted || !ready) {
    return <div className="min-h-[40vh] bg-white" aria-busy="true" />;
  }

  if (!article || (isDraft && !preview)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-navy-900">Article not found</h1>
        <Link href={kordianPath(locale, "articles")} className="mt-4 inline-flex text-teal-700">
          {t.articles.backToArticles}
        </Link>
      </div>
    );
  }

  const title = article.title[locale] || article.title.en;
  const content = article.content[locale] || article.content.en;

  return (
    <article className="bg-white pb-16">
      {(preview || isDraft) && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          {t.articles.draftNotice}
        </div>
      )}
      <div className="relative h-56 sm:h-72 lg:h-96">
        <Image src={article.coverImageUrl} alt="" fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 to-transparent" />
      </div>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link href={kordianPath(locale, "articles")} className="mt-6 inline-flex text-sm font-medium text-teal-700">
          ← {t.articles.backToArticles}
        </Link>
        <p className="mt-6 text-sm font-medium uppercase tracking-wide text-teal-700">{article.category}</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-navy-900 sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm text-navy-500">
          {t.articles.by} {article.author} · <time dateTime={article.publishDate}>{article.publishDate}</time>
        </p>
        <div className="mt-10 max-w-none space-y-4 text-base leading-relaxed text-navy-700 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-navy-900 [&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-navy-900">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
