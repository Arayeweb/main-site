import { IconCheck } from "@/components/icons";
import type { DemoSiteContent } from "@/lib/demoData";
import type { AccentClasses } from "./accentConfig";
import RevealSection from "./RevealSection";

export default function AboutDoctorSection({
  content,
  accent,
}: {
  content: DemoSiteContent;
  accent: AccentClasses;
}) {
  return (
    <section id="about" className="section-py">
      <div className="container-mx container-px">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <RevealSection>
            <div className={`relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center rounded-[2.5rem] bg-gradient-to-br ${accent.gradientFrom} to-navy-50 shadow-soft`}>
              <div className={`flex h-28 w-28 items-center justify-center rounded-full ${accent.bg} text-4xl font-extrabold text-white shadow-glow sm:h-36 sm:w-36 sm:text-5xl`}>
                {content.doctorName.replace("دکتر ", "").slice(0, 1)}
              </div>
              <span className="absolute -bottom-3 right-6 rounded-2xl border border-navy-100 bg-white px-4 py-2.5 text-center shadow-card">
                <span className="block text-[11px] text-navy-400">{content.doctorTitle}</span>
                <span className="block text-sm font-extrabold text-navy-900">{content.doctorName}</span>
              </span>
            </div>
          </RevealSection>

          <RevealSection delayMs={100}>
            <span className={`badge mb-4 ${accent.badgeBg} ${accent.badgeText}`}>درباره ما</span>
            <h2 className="section-title">{content.aboutTitle}</h2>
            <div className="mt-4 flex flex-col gap-3">
              {content.aboutParagraphs.map((p) => (
                <p key={p} className="text-sm leading-relaxed text-navy-500 sm:text-base">
                  {p}
                </p>
              ))}
            </div>
            <ul className="mt-6 flex flex-col gap-2.5">
              {content.credentials.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-sm text-navy-600">
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${accent.softBg} ${accent.text}`}>
                    <IconCheck size={13} strokeWidth={2.5} />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </RevealSection>
        </div>
      </div>
    </section>
  );
}
