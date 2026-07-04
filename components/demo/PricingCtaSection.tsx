import { demoPackages, formatToman, type DemoPackageKey, type SpecialtyKey } from "@/lib/demoData";
import { IconCheck } from "@/components/icons";
import SectionHeader from "@/components/home/SectionHeader";
import DemoLeadForm from "./DemoLeadForm";

interface AccentClasses {
  bg: string;
  hoverBg: string;
  ring: string;
  text: string;
  border: string;
  badgeBg: string;
  badgeText: string;
}

interface PricingCtaSectionProps {
  specialty: SpecialtyKey;
  specialtyLabel: string;
  title: string;
  subtitle: string;
  selectedPackage: DemoPackageKey | null;
  accent: AccentClasses;
}

export default function PricingCtaSection({
  specialty,
  specialtyLabel,
  title,
  subtitle,
  selectedPackage,
  accent,
}: PricingCtaSectionProps) {
  const selected = demoPackages.find((p) => p.key === selectedPackage) || null;

  return (
    <section className="section-py bg-gradient-to-b from-white to-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="شروع همکاری"
          badgeClassName={`${accent.badgeBg} ${accent.badgeText}`}
          title={title}
          subtitle={subtitle}
        />

        <div className="grid gap-5 lg:grid-cols-3">
          {demoPackages.map((p) => {
            const isSelected = p.key === selectedPackage;
            return (
              <div
                key={p.key}
                className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 transition-all duration-300 ${
                  isSelected
                    ? `${accent.border} shadow-card -translate-y-1`
                    : "border-navy-100 shadow-soft hover:-translate-y-1"
                }`}
              >
                {isSelected ? (
                  <span
                    className={`absolute -top-3 right-6 rounded-full px-3.5 py-1 text-[11px] font-bold text-white shadow-soft ${accent.bg}`}
                  >
                    این پکیج شماست ✓
                  </span>
                ) : p.popular ? (
                  <span className="absolute -top-3 right-6 rounded-full bg-navy-800 px-3.5 py-1 text-[11px] font-bold text-white shadow-soft">
                    محبوب‌ترین
                  </span>
                ) : null}

                <h3 className="text-base font-extrabold text-navy-900">{p.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{p.description}</p>

                <div className="mt-4">
                  <span className="block text-xs text-navy-300 line-through">
                    {formatToman(p.oldPrice)} تومان
                  </span>
                  <span className={`text-2xl font-extrabold ${accent.text}`}>
                    {formatToman(p.price)}
                    <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                  </span>
                </div>

                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-600">
                      <IconCheck size={14} className={`mt-1 shrink-0 ${accent.text}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#lead-form"
                  className={`mt-5 w-full rounded-xl px-5 py-3 text-center text-sm font-bold transition-all active:scale-[0.98] ${
                    isSelected
                      ? `${accent.bg} text-white ${accent.hoverBg}`
                      : "border border-navy-200 bg-white text-navy-700 hover:border-navy-300"
                  }`}
                >
                  {isSelected ? "ادامه با این پکیج" : "انتخاب این پکیج"}
                </a>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-12 max-w-xl">
          <DemoLeadForm
            specialty={specialty}
            specialtyLabel={specialtyLabel}
            packageKey={selected?.key ?? null}
            packageName={selected?.name ?? null}
            accentClasses={accent}
          />
        </div>
      </div>
    </section>
  );
}
