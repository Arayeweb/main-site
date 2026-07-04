import { doctorFeatures } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";
import {
  IconCalendar,
  IconBot,
  IconSearchCheck,
  IconGlobe,
  IconCard,
  IconShield,
} from "@/components/icons";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  calendar: IconCalendar,
  bot: IconBot,
  searchCheck: IconSearchCheck,
  globe: IconGlobe,
  card: IconCard,
  shield: IconShield,
};

export default function DoctorsFeatures() {
  return (
    <section id="features" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="همه‌چیز با ماست"
          badgeClassName="bg-sky-50 text-sky-700"
          title="از طراحی تا انتشار؛ شما هیچ کار فنی انجام نمی‌دهید"
          subtitle="سایتی که بیمار را از جستجوی گوگل تا ثبت نوبت جلو می‌برد — و شما فقط طبابت می‌کنید."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {doctorFeatures.map((f) => {
            const Icon = iconMap[f.icon] ?? IconSearchCheck;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-50 to-cyan-50 text-sky-600">
                  <Icon size={22} />
                </div>
                <h3 className="text-sm font-bold text-navy-900">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
