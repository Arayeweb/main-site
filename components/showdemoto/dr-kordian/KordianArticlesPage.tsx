"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getKordianMessages } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";
import { useKordianPublishedArticles } from "./KordianArticlesProvider";

export default function KordianArticlesPage({ locale }: { locale: KordianLocale }) {
  const t = getKordianMessages(locale);
  const articles = useKordianPublishedArticles();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const list = mounted ? articles : articles;

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-900">{t.articles.pageTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-navy-600">{t.articles.pageDescription}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        {list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-navy-600">
            {t.articles.empty}
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                <div className="relative h-44">
                  <Image src={article.coverImageUrl} alt="" fill className="object-cover" sizes="33vw" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 text-xs text-navy-500">
                    <span className="font-medium uppercase tracking-wide text-teal-700">{article.category}</span>
                    <time dateTime={article.publishDate}>{article.publishDate}</time>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-navy-900">
                    {article.title[locale] || article.title.en}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-navy-600">
                    {article.excerpt[locale] || article.excerpt.en}
                  </p>
                  <p className="mt-3 text-xs text-navy-500">
                    {t.articles.by} {article.author}
                  </p>
                  <Link
                    href={kordianPath(locale, "articles", article.slug)}
                    className="mt-4 inline-flex text-sm font-semibold text-teal-700"
                  >
                    {t.sections.readArticle} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
