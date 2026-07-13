"use client";

import Link from "next/link";
import { kordianServices } from "@/lib/showdemoto/dr-kordian/config";
import { getKordianMessages, t as tl } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";
import KordianServiceIcon from "./KordianServiceIcon";

export default function KordianTreatmentsPage({ locale }: { locale: KordianLocale }) {
  const t = getKordianMessages(locale);

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-900">{t.treatments.pageTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-navy-600">{t.treatments.pageDescription}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-4 py-14 sm:px-6 lg:px-8">
        {kordianServices.map((service, index) => (
          <article
            key={service.id}
            id={service.id}
            className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <KordianServiceIcon icon={service.icon} />
            <div>
              <p className="text-xs font-medium text-navy-400">0{index + 1}</p>
              <h2 className="mt-1 text-xl font-semibold text-navy-900">{tl(service.title, locale)}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-600">{tl(service.description, locale)}</p>
            </div>
            <Link
              href={kordianPath(locale, "contact")}
              className="inline-flex justify-center rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-100"
            >
              {t.treatments.learnMore}
            </Link>
          </article>
        ))}

        <div className="rounded-2xl bg-navy-900 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">{t.treatments.bookConsultation}</h2>
          <Link
            href={kordianPath(locale, "contact")}
            className="mt-5 inline-flex rounded-xl bg-teal-500 px-6 py-3 text-sm font-semibold hover:bg-teal-400"
          >
            {t.nav.requestConsultation}
          </Link>
        </div>
      </section>
    </div>
  );
}
