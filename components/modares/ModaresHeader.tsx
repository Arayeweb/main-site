"use client";

import Logo from "@/components/Logo";
import { scrollToModaresForm } from "@/lib/modaresScroll";

export default function ModaresHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-navy-100/80 bg-white/95 backdrop-blur-sm">
      <div className="container-mx container-px flex min-h-[56px] items-center justify-between gap-3 py-2.5 sm:min-h-[64px] sm:py-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Logo size="sm" />
          <span className="truncate text-[10px] font-medium text-navy-400 sm:text-[11px]">
            شرکت هوش آرایه پارس
          </span>
        </div>

        <button
          type="button"
          onClick={scrollToModaresForm}
          className="shrink-0 rounded-xl bg-cyan-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 motion-reduce:transform-none active:scale-[0.98] sm:px-5 sm:text-sm"
        >
          دریافت نمونه و قیمت
        </button>
      </div>
    </header>
  );
}
