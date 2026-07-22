import type { FastWebIndustry } from "@/lib/fastweb/industries";

/**
 * Structural preview of an industry site language.
 * Not a real customer site — communicates blueprint differences.
 */
export default function IndustryPreviewFrame({
  industry,
  variant = "desktop",
}: {
  industry: FastWebIndustry;
  variant?: "desktop" | "mobile";
}) {
  const tone = industry.pageTone;
  const example = industry.examples[0];
  const isMobile = variant === "mobile";

  const shell =
    tone === "warm"
      ? { bg: "#f7efe8", ink: "#2a221c", accent: "#9a4a32", panel: "#fff" }
      : tone === "energetic"
        ? { bg: "#111827", ink: "#f8fafc", accent: "#34d399", panel: "#1f2937" }
        : { bg: "#e8eef5", ink: "#152033", accent: "#1e3a5f", panel: "#fff" };

  return (
    <div
      className={`overflow-hidden border border-navy-200 bg-white shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)] ${
        isMobile ? "mx-auto aspect-[10/19] w-full max-w-[200px] rounded-[1.25rem]" : "aspect-[16/10] w-full rounded-xl"
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-navy-100 bg-navy-50/80 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-navy-200" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-navy-200" aria-hidden="true" />
        <span className="h-2 w-2 rounded-full bg-navy-200" aria-hidden="true" />
        <span className="mr-auto truncate rounded bg-white px-2 py-0.5 text-[10px] text-navy-400 ring-1 ring-navy-100">
          sample.araaye.com
        </span>
      </div>
      <div
        className="flex h-[calc(100%-2.1rem)] flex-col p-3 text-right"
        style={{ background: shell.bg, color: shell.ink }}
        dir="rtl"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-extrabold sm:text-xs">{example?.conceptName ?? industry.name}</span>
          <span
            className="rounded px-2 py-1 text-[9px] font-bold text-white sm:text-[10px]"
            style={{ background: shell.accent }}
          >
            {industry.primaryGoal.slice(0, 18)}
          </span>
        </div>
        <p className="mt-3 text-[12px] font-extrabold leading-snug sm:text-sm">
          {industry.hero.title}
        </p>
        <div className="mt-3 grid flex-1 grid-cols-2 gap-1.5">
          {industry.blueprint.slice(0, isMobile ? 4 : 6).map((key) => {
            const block = industry.requiredBlocks.find((b) => b.key === key);
            const labels: Record<string, string> = {
              services: "خدمات",
              gallery: "گالری",
              beforeAfter: "قبل/بعد",
              pricing: "قیمت",
              booking: "رزرو",
              team: "تیم",
              schedule: "برنامه",
              transformations: "نتایج",
              practiceAreas: "حوزه‌ها",
              credentials: "مدارک",
              process: "فرایند",
              faq: "FAQ",
              contact: "تماس",
              hours: "ساعات",
              about: "درباره",
            };
            return (
              <div
                key={key}
                className="rounded px-2 py-1.5 text-[9px] font-semibold sm:text-[10px]"
                style={{ background: shell.panel, color: shell.ink }}
              >
                {block?.title ?? labels[key] ?? key}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-[9px] opacity-70 sm:text-[10px]">{industry.imageDirection.photographyStyle}</p>
      </div>
    </div>
  );
}
