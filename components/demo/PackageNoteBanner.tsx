import { IconSparkle } from "@/components/icons";
import type { DemoPackage } from "@/lib/demoData";
import type { AccentClasses } from "./accentConfig";

interface PackageNoteBannerProps {
  pkg: DemoPackage;
  accent: AccentClasses;
}

// Shown only when the prospect arrived with a non-premium package selected.
// The demo always renders the richest version of the site (so prospects see
// the ceiling of quality); without this note, a "پایه" buyer could wrongly
// assume every feature shown (chatbot, advanced SEO, etc.) ships in their
// cheaper package. This makes the real scope explicit before they buy.
export default function PackageNoteBanner({ pkg, accent }: PackageNoteBannerProps) {
  return (
    <section className={`border-y ${accent.border}/30 ${accent.softBg}`}>
      <div className="container-mx container-px py-4">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-2.5 text-right sm:flex-row sm:items-center sm:gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${accent.bg} text-white`}>
            <IconSparkle size={17} />
          </span>
          <p className="text-[13px] leading-relaxed text-navy-700">
            این نمونه، کامل‌ترین حالت طراحی را نشان می‌دهد تا سقف کیفیت کار ما را ببینید. سایت نهایی شما دقیقاً مطابق{" "}
            <b className={accent.text}>پکیج {pkg.name}</b> با این امکانات ساخته می‌شود: {pkg.features.join("، ")}.
          </p>
        </div>
      </div>
    </section>
  );
}
