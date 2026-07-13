"use client";

import Link from "next/link";
import { kordianBrand, kordianContact } from "@/lib/showdemoto/dr-kordian/config";
import { getKordianMessages, t as tl } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianAdminPath, kordianPath } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export default function KordianFooter({ locale }: { locale: KordianLocale }) {
  const messages = getKordianMessages(locale);

  return (
    <footer className="border-t border-slate-200 bg-navy-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <p className="text-lg font-semibold text-white">{tl(kordianBrand.name, locale)}</p>
          <p className="mt-1 text-sm text-teal-300">{tl(kordianBrand.title, locale)}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">{messages.footer.tagline}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">{messages.footer.navigation}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href={kordianPath(locale)} className="hover:text-white">{messages.nav.home}</Link></li>
            <li><Link href={kordianPath(locale, "about")} className="hover:text-white">{messages.nav.about}</Link></li>
            <li><Link href={kordianPath(locale, "treatments")} className="hover:text-white">{messages.nav.treatments}</Link></li>
            <li><Link href={kordianPath(locale, "articles")} className="hover:text-white">{messages.nav.articles}</Link></li>
            <li><Link href={kordianPath(locale, "contact")} className="hover:text-white">{messages.nav.contact}</Link></li>
            <li><Link href={kordianAdminPath()} className="text-teal-400 hover:text-teal-300">{messages.nav.cmsPreview}</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white">{messages.footer.contact}</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{kordianContact.email}</li>
            <li>{kordianContact.phone}</li>
            <li>{tl(kordianContact.address, locale)}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
          <p>{messages.footer.disclaimer}</p>
          <p>{messages.footer.demoBy}</p>
        </div>
      </div>
    </footer>
  );
}
