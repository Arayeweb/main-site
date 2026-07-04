import Link from "next/link";
import { IconArrowLeft, IconSparkle } from "@/components/icons";

interface DemoNavbarProps {
  practiceName: string;
  accentClass: string; // e.g. "text-cyan-600" for the practice name accent
}

// Simplified header for demo pages — replaces the real site Navbar so the
// prospect isn't confused about whose site this is, but keeps a persistent
// "this is a sample" notice plus a link back to the package picker.
export default function DemoNavbar({ practiceName, accentClass }: DemoNavbarProps) {
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-navy-900 py-2 text-center text-white">
        <p className="container-mx container-px flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-medium sm:text-xs">
          <IconSparkle size={13} className="shrink-0 text-amber-300" />
          این یک نمونه‌سایت دموی آرایه است — نه سایت واقعی
          <Link
            href="/demo"
            className="mr-1 inline-flex items-center gap-1 font-bold text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            بازگشت به انتخاب پکیج
            <IconArrowLeft size={11} />
          </Link>
        </p>
      </div>

      <div className="glass border-b border-navy-100 shadow-soft">
        <nav className="container-mx container-px flex h-14 items-center justify-between gap-3">
          <span className={`truncate text-sm font-extrabold sm:text-base ${accentClass}`}>
            {practiceName}
          </span>
          <a
            href="#lead-form"
            className="shrink-0 rounded-lg bg-navy-900 px-3.5 py-2 text-[12px] font-bold text-white transition-all duration-200 hover:bg-navy-800 active:scale-[0.98] sm:px-4 sm:text-[13px]"
          >
            سفارش این سایت
          </a>
        </nav>
      </div>
    </header>
  );
}
