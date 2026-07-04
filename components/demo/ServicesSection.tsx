import { DynamicIcon } from "@/components/icons";
import type { DemoSiteContent } from "@/lib/demoData";
import type { AccentClasses } from "./accentConfig";
import SectionHeader from "@/components/home/SectionHeader";
import RevealSection from "./RevealSection";

export default function ServicesSection({
  content,
  accent,
}: {
  content: DemoSiteContent;
  accent: AccentClasses;
}) {
  return (
    <section id="services" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="خدمات ما"
          badgeClassName={`${accent.badgeBg} ${accent.badgeText}`}
          title="خدماتی که ارائه می‌دهیم"
          subtitle="طیف کاملی از خدمات تخصصی، متناسب با نیاز شما."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.services.map((s, i) => (
            <RevealSection key={s.title} delayMs={i * 60}>
              <div className="h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${accent.softBg} ${accent.text}`}>
                  <DynamicIcon name={s.icon} size={22} />
                </div>
                <h3 className="text-sm font-bold text-navy-900">{s.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{s.description}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
