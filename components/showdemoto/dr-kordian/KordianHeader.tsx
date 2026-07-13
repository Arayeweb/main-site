"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getKordianMessages } from "@/lib/showdemoto/dr-kordian/i18n";
import { kordianAdminPath, kordianPath, swapKordianLocale } from "@/lib/showdemoto/dr-kordian/routes";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home" as const, segment: null },
  { key: "about" as const, segment: "about" as const },
  { key: "treatments" as const, segment: "treatments" as const },
  { key: "articles" as const, segment: "articles" as const },
  { key: "contact" as const, segment: "contact" as const },
];

export default function KordianHeader({ locale }: { locale: KordianLocale }) {
  const pathname = usePathname();
  const t = getKordianMessages(locale);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={kordianPath(locale)}
          className="group flex flex-col leading-tight"
        >
          <span className="text-sm font-semibold tracking-wide text-teal-700">Dr. Kordian</span>
          <span className="text-xs text-navy-500">{t.nav.treatments.includes("Services") ? "Ophthalmologist" : "Офтальмолог"}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_ITEMS.map(({ key, segment }) => {
            const href = segment ? kordianPath(locale, segment) : kordianPath(locale);
            const active = segment ? pathname.includes(`/${segment}`) : pathname.endsWith(`/${locale}`) || pathname.endsWith(`/${locale}/`);
            return (
              <Link
                key={key}
                href={href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-teal-50 text-teal-800" : "text-navy-700 hover:bg-slate-50 hover:text-navy-900"
                )}
              >
                {t.nav[key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
            {(["en", "ru"] as const).map((lang) => (
              <Link
                key={lang}
                href={swapKordianLocale(pathname, lang)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 uppercase transition-colors",
                  locale === lang ? "bg-navy-800 text-white" : "text-navy-600 hover:bg-slate-50"
                )}
                aria-current={locale === lang ? "true" : undefined}
              >
                {lang}
              </Link>
            ))}
          </div>
          <Link
            href={kordianPath(locale, "contact")}
            className="hidden rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-teal-700 sm:inline-flex"
          >
            {t.nav.requestConsultation}
          </Link>
          <Link
            href={kordianAdminPath()}
            className="hidden rounded-lg px-2 py-1.5 text-xs font-medium text-navy-500 hover:text-teal-700 lg:inline-flex"
          >
            {t.nav.cmsPreview}
          </Link>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden" aria-label="Mobile">
        {NAV_ITEMS.map(({ key, segment }) => (
          <Link
            key={key}
            href={segment ? kordianPath(locale, segment) : kordianPath(locale)}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-navy-700 hover:bg-slate-50"
          >
            {t.nav[key]}
          </Link>
        ))}
        <Link
          href={kordianAdminPath()}
          className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-teal-700"
        >
          {t.nav.cmsPreview}
        </Link>
      </nav>
    </header>
  );
}
