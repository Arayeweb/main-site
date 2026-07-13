"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { kordianAbout, kordianBrand, kordianImages } from "@/lib/showdemoto/dr-kordian/config";
import { getKordianMessages, t as tl } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export default function KordianAboutPage({ locale }: { locale: KordianLocale }) {
  const t = getKordianMessages(locale);
  const [heroSrc, setHeroSrc] = useState(kordianImages.hero);

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">{tl(kordianBrand.name, locale)}</p>
          <h1 className="mt-3 text-4xl font-bold text-navy-900">{t.about.pageTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-navy-600">{t.about.pageDescription}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-card">
          <Image
            src={heroSrc}
            alt="Dr. Kordian"
            width={600}
            height={750}
            className="h-full w-full object-cover"
            onError={() => setHeroSrc(kordianImages.heroFallback)}
          />
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-navy-900">{t.about.credentialsTitle}</h2>
            <p className="mt-3 leading-relaxed text-navy-600">{tl(kordianAbout.credentials, locale)}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy-900">{t.about.membershipsTitle}</h2>
            <p className="mt-3 leading-relaxed text-navy-600">{tl(kordianAbout.memberships, locale)}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-navy-900">{t.about.approachTitle}</h2>
            <p className="mt-3 leading-relaxed text-navy-600">{tl(kordianAbout.approach, locale)}</p>
          </div>
          <p className="leading-relaxed text-navy-600">{tl(kordianAbout.intro, locale)}</p>
          <Link
            href={kordianPath(locale, "contact")}
            className="inline-flex rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {t.nav.requestConsultation}
          </Link>
        </div>
      </section>
    </div>
  );
}
