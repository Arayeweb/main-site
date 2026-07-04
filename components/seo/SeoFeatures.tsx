import { seoFeatures } from "@/lib/seoData";
import SectionHeader from "@/components/home/SectionHeader";
import {
  IconTarget,
  IconSearchCheck,
  IconBolt,
  IconLayers,
  IconTrending,
  IconChart,
} from "@/components/icons";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  target: IconTarget,
  searchCheck: IconSearchCheck,
  bolt: IconBolt,
  layers: IconLayers,
  trending: IconTrending,
  chart: IconChart,
};

export default function SeoFeatures() {
  return (
    <section id="features" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="چه کاری انجام می‌دهیم"
          badgeClassName="bg-teal-50 text-teal-700"
          title="سئوی محلی؛ از نقشه گوگل تا محتوای سایت"
          subtitle="همه کارهایی که لازم است تا مشتری محله و شهر شما، اول شما را پیدا کند."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seoFeatures.map((f) => {
            const Icon = iconMap[f.icon] ?? IconSearchCheck;
            return (
              <div
                key={f.title}
                className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-card"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-600">
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
