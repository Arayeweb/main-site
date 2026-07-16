"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import DoctorsWhatsAppCta from "@/components/doctors/DoctorsWhatsAppCta";

type DoctorsHeaderProps = {
  backHref?: string;
  backLabel?: string;
  variant?: "sales" | "minimal";
};

export default function DoctorsHeader({
  backHref,
  backLabel = "بازگشت به صفحه سفارش",
  variant = "sales",
}: DoctorsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/80 bg-white/95 backdrop-blur-sm">
      <div className="container-mx container-px flex min-h-[56px] items-center justify-between gap-2 py-2.5 sm:min-h-[64px] sm:gap-3 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link href="/doctors" className="shrink-0">
            <Logo size="sm" />
          </Link>
          <span className="hidden truncate text-[11px] font-medium text-navy-400 sm:inline">
            شرکت هوش آرایه پارس
          </span>
          {backHref ? (
            <Link
              href={backHref}
              className="hidden truncate text-[11px] font-medium text-sky-600 hover:text-sky-700 lg:inline"
            >
              {backLabel}
            </Link>
          ) : null}
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {variant === "sales" ? (
            <>
              <a
                href="#samples"
                className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900"
              >
                نمونه‌ها
              </a>
              <a
                href="#package"
                className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900"
              >
                جزئیات پکیج
              </a>
            </>
          ) : null}
        </nav>

        {variant === "sales" ? (
          <DoctorsWhatsAppCta
            source="header"
            className="shrink-0 rounded-xl bg-sky-600 px-3 py-2 text-[11px] font-bold text-white transition-colors hover:bg-sky-700 active:scale-[0.98] sm:px-4 sm:py-2.5 sm:text-xs"
          >
            شروع سفارش در واتساپ
          </DoctorsWhatsAppCta>
        ) : (
          <Link
            href="/doctors"
            className="shrink-0 rounded-xl border border-navy-200 bg-white px-3 py-2 text-[11px] font-bold text-navy-700 transition-colors hover:bg-navy-50 sm:px-4 sm:py-2.5 sm:text-xs"
          >
            صفحه سفارش سایت
          </Link>
        )}
      </div>
    </header>
  );
}
