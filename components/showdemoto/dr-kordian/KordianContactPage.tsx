"use client";

import { getKordianMessages } from "@/lib/showdemoto/dr-kordian/i18n";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";
import KordianContactForm from "./KordianContactForm";

export default function KordianContactPage({ locale }: { locale: KordianLocale }) {
  const t = getKordianMessages(locale);

  return (
    <div className="bg-white">
      <section className="border-b border-slate-200 bg-slate-50 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-navy-900">{t.contact.pageTitle}</h1>
          <p className="mt-4 max-w-3xl text-lg text-navy-600">{t.contact.pageDescription}</p>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <KordianContactForm locale={locale} />
      </section>
    </div>
  );
}
