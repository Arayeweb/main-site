import Link from "next/link";
import { IconSparkle } from "@/components/icons";

interface AccentClasses {
  bg: string;
  hoverBg: string;
}

export default function DemoBottomBanner({
  practiceName,
  accent,
}: {
  practiceName: string;
  accent: AccentClasses;
}) {
  return (
    <section className="border-t border-navy-100 bg-navy-900 py-10 sm:py-12">
      <div className="container-mx container-px flex flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-amber-300">
          <IconSparkle size={14} />
          این یک نمونه است
        </span>
        <p className="max-w-xl text-sm leading-relaxed text-navy-200 sm:text-base">
          «{practiceName}» یک کسب‌وکار واقعی نیست — این صفحه فقط نمونه‌ای از سطح کیفیتی است که تیم آرایه
          می‌تواند برای مطب یا کلینیک شما بسازد. آماده‌اید سایت واقعی خودتان را بسازیم؟
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#lead-form"
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-all active:scale-[0.98] ${accent.bg} ${accent.hoverBg}`}
          >
            سفارش این سایت برای مطب من
          </a>
          <Link
            href="/doctors"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/15 active:scale-[0.98]"
          >
            سفارش سایت مطب
          </Link>
          <Link
            href="/doctors/audit"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/15 active:scale-[0.98]"
          >
            بررسی رایگان مطب من
          </Link>
        </div>
      </div>
    </section>
  );
}
