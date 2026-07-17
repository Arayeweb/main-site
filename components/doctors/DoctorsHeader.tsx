"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

type DoctorsHeaderProps = {
  backHref?: string;
  backLabel?: string;
  variant?: "sales" | "minimal";
};

const navItems = [
  { href: "#samples", label: "نمونه‌ها" },
  { href: "#package", label: "پکیج" },
  { href: "#pricing", label: "قیمت" },
  { href: "#faq", label: "سؤالات" },
] as const;

export default function DoctorsHeader({
  backHref,
  backLabel = "بازگشت به صفحه سفارش",
  variant = "sales",
}: DoctorsHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/80 bg-white/95 backdrop-blur-sm">
      <div className="container-mx container-px flex min-h-[56px] items-center justify-between gap-2 py-2.5 sm:min-h-[64px] sm:gap-3 sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link href="/doctors" className="shrink-0" aria-label="آرایه — طراحی سایت پزشکی">
            <Logo size="sm" />
          </Link>
          <span className="hidden truncate text-[11px] font-medium text-navy-400 sm:inline">
            طراحی سایت پزشکی
          </span>
          {backHref ? (
            <Link
              href={backHref}
              className="hidden truncate text-[11px] font-medium text-cyan-700 hover:text-cyan-800 lg:inline"
            >
              {backLabel}
            </Link>
          ) : null}
        </div>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری صفحه فروش">
          {variant === "sales"
            ? navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900"
                >
                  {item.label}
                </a>
              ))
            : null}
        </nav>

        {variant === "sales" ? (
          <a
            href="#quote-form"
            onClick={() => trackDoctorsEvent("doctors_hero_cta_click", { source: "header" })}
            className="shrink-0 rounded-xl bg-cyan-700 px-3 py-2 text-[11px] font-extrabold text-white transition-colors hover:bg-cyan-800 sm:px-4 sm:py-2.5 sm:text-xs"
          >
            شروع با ۶ میلیون
          </a>
        ) : (
          <Link
            href="/doctors"
            className="shrink-0 rounded-xl border border-navy-200 bg-white px-3 py-2 text-[11px] font-bold text-navy-700 sm:px-4 sm:py-2.5 sm:text-xs"
          >
            صفحه سفارش سایت
          </Link>
        )}
      </div>
    </header>
  );
}
