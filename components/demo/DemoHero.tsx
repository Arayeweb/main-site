import { IconCheck, IconMapPin } from "@/components/icons";
import type { DemoSiteContent } from "@/lib/demoData";
import type { AccentClasses } from "./accentConfig";
import RevealSection from "./RevealSection";
import AppointmentForm from "./AppointmentForm";

export default function DemoHero({
  content,
  accent,
}: {
  content: DemoSiteContent;
  accent: AccentClasses;
}) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-b ${accent.gradientFrom} ${accent.gradientVia} to-white pt-10 pb-16 sm:pt-16 sm:pb-24`}>
      <div className={`pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full ${accent.softBg} blur-3xl`} />
      <div className="pointer-events-none absolute top-40 -left-20 h-64 w-64 rounded-full bg-navy-100/40 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-pattern opacity-40" />

      <div className="container-mx container-px relative">
        <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <RevealSection>
            <span className={`badge mb-5 ${accent.badgeBg} ${accent.badgeText}`}>{content.heroBadge}</span>

            <h1 className="max-w-xl text-balance text-3xl font-extrabold leading-[1.3] text-navy-900 sm:text-4xl lg:text-[2.7rem]">
              {content.heroTitle}{" "}
              <em className={`not-italic ${accent.text}`}>{content.heroTitleAccent}</em>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-navy-500 sm:text-lg">
              {content.heroSubtitle}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-navy-500">
              <span className="inline-flex items-center gap-1.5">
                <IconMapPin size={15} className={accent.text} />
                {content.city}
              </span>
              <span className="text-navy-200">•</span>
              <span className="font-bold text-navy-700">{content.doctorName}</span>
              <span className="text-navy-400">— {content.doctorTitle}</span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#appointment"
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] ${accent.bg} ${accent.hoverBg}`}
              >
                {content.heroCtaPrimary}
              </a>
              <a
                href="#services"
                className="btn-secondary"
              >
                {content.heroCtaSecondary}
              </a>
            </div>

            <ul className="mt-8 hidden flex-col gap-2.5 sm:flex">
              {content.credentials.slice(0, 2).map((c) => (
                <li key={c} className="flex items-center gap-2.5 text-sm text-navy-600">
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${accent.softBg} ${accent.text}`}>
                    <IconCheck size={13} strokeWidth={2.5} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {content.stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-navy-100 bg-white/80 px-3 py-4 text-center shadow-soft backdrop-blur">
                  <div className={`text-lg font-extrabold sm:text-xl ${accent.text}`}>{s.value}</div>
                  <div className="mt-1 text-[10px] leading-tight text-navy-500 sm:text-[11px]">{s.label}</div>
                </div>
              ))}
            </div>
          </RevealSection>

          <RevealSection delayMs={120}>
            <div id="appointment" className="scroll-mt-24">
              <AppointmentForm
                accentClasses={accent}
                services={content.services.map((s) => s.title)}
              />
            </div>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
