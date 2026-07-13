"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  kordianAbout,
  kordianBrand,
  kordianImages,
  kordianJourney,
  kordianServices,
  kordianWhyChoose,
} from "@/lib/showdemoto/dr-kordian/config";
import { getKordianMessages, t as tl } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";
import { useKordianPublishedArticles } from "./KordianArticlesProvider";
import KordianServiceIcon from "./KordianServiceIcon";

function HeroImage() {
  const [src, setSrc] = useState(kordianImages.hero);

  return (
    <Image
      src={src}
      alt="Dr. Kordian conducting an eye examination"
      width={700}
      height={875}
      className="h-full w-full object-cover"
      priority
      sizes="(max-width: 960px) 100vw, 45vw"
      onError={() => setSrc(kordianImages.heroFallback)}
    />
  );
}

export default function KordianHomePage({ locale }: { locale: KordianLocale }) {
  const t = getKordianMessages(locale);
  const articles = useKordianPublishedArticles();
  const latest = articles.slice(0, 2);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.08),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-24">
          <div className="animate-fade-up">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">{t.hero.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-navy-900 sm:text-5xl">
              {t.hero.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-600">{t.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={kordianPath(locale, "contact")}
                className="inline-flex rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-700"
              >
                {t.hero.ctaPrimary}
              </Link>
              <Link
                href={kordianPath(locale, "about")}
                className="inline-flex rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-navy-800 transition hover:border-teal-200 hover:bg-teal-50/50"
              >
                {t.hero.ctaSecondary}
              </Link>
            </div>
            <p className="mt-6 text-sm text-navy-500">{t.hero.trustNote}</p>
          </div>
          <div className="relative animate-fade-in">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-card">
              <div className="aspect-[4/5]">
                <HeroImage />
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:-bottom-6 sm:-left-6">
              <p className="text-sm font-semibold text-navy-900">{tl(kordianBrand.name, locale)}</p>
              <p className="text-xs text-teal-700">{tl(kordianBrand.title, locale)}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-bold text-navy-900">{t.sections.introTitle}</h2>
            <p className="mt-4 leading-relaxed text-navy-600">{tl(kordianAbout.intro, locale)}</p>
            <Link
              href={kordianPath(locale, "about")}
              className="mt-6 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              {t.sections.introCta} →
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-soft">
            <Image
              src={kordianImages.about}
              alt=""
              width={600}
              height={400}
              className="h-64 w-full object-cover sm:h-80"
            />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-navy-900">{t.sections.servicesTitle}</h2>
            <p className="mt-3 text-navy-600">{t.sections.servicesSubtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {kordianServices.map((service) => (
              <article
                key={service.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-teal-200"
              >
                <KordianServiceIcon icon={service.icon} />
                <h3 className="mt-4 text-lg font-semibold text-navy-900">{tl(service.title, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{tl(service.description, locale)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-navy-900">{t.sections.journeyTitle}</h2>
            <p className="mt-3 text-navy-600">{t.sections.journeySubtitle}</p>
          </div>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {kordianJourney.map((step) => (
              <li key={step.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">
                  {step.step}
                </span>
                <h3 className="mt-4 font-semibold text-navy-900">{tl(step.title, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{tl(step.description, locale)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold text-navy-900">{t.sections.whyTitle}</h2>
            <p className="mt-3 text-navy-600">{t.sections.whySubtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {kordianWhyChoose.map((item) => (
              <div key={item.title.en} className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-navy-900">{tl(item.title, locale)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{tl(item.description, locale)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-navy-900">{t.sections.articlesTitle}</h2>
              <p className="mt-3 text-navy-600">{t.sections.articlesSubtitle}</p>
            </div>
            <Link href={kordianPath(locale, "articles")} className="text-sm font-semibold text-teal-700 hover:text-teal-800">
              {t.sections.viewAllArticles} →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {(mounted ? latest : articles.slice(0, 2)).map((article) => (
              <article key={article.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft">
                <div className="relative h-44">
                  <Image src={article.coverImageUrl} alt="" fill className="object-cover" sizes="50vw" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-teal-700">{article.category}</p>
                  <h3 className="mt-2 text-lg font-semibold text-navy-900">
                    {article.title[locale] || article.title.en}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-navy-600">
                    {article.excerpt[locale] || article.excerpt.en}
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
        </div>
      </section>

      <section className="bg-navy-900 py-16 text-white sm:py-20">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">{t.sections.contactTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">{t.sections.contactSubtitle}</p>
          <Link
            href={kordianPath(locale, "contact")}
            className="mt-8 inline-flex rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-400"
          >
            {t.sections.contactCta}
          </Link>
        </div>
      </section>
    </>
  );
}
