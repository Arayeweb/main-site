import Logo from "@/components/Logo";
import { IconSparkle } from "@/components/icons";

export default function DemoPickerNavbar() {
  return (
    <header className="sticky top-0 z-50">
      <div className="glass border-b border-navy-100 shadow-soft">
        <nav className="container-mx container-px flex h-14 items-center justify-between gap-3">
          <a href="/" className="shrink-0">
            <Logo size="sm" />
          </a>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-bold text-brand-700 sm:text-xs">
            <IconSparkle size={13} />
            ابزار دموی فروش — این یک دمو است
          </span>
        </nav>
      </div>
    </header>
  );
}
