import SectionHeader from "@/components/home/SectionHeader";
import { IconCheck } from "@/components/icons";
import { doctorProductPackageFeatures, doctorSeoDisclaimer } from "@/lib/doctorsData";

export default function DoctorsPackageDetails() {
  return (
    <section id="package" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="محتوای پکیج"
          badgeClassName="bg-sky-50 text-sky-700"
          title="دقیقاً چه چیزی با ۲۰ میلیون تحویل می‌گیرد؟"
          subtitle="یک پکیج واحد برای مطب تک‌پزشک — بدون افزونه‌های مبهم."
        />

        <div className="mx-auto max-w-2xl rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          <ul className="space-y-3">
            {doctorProductPackageFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-navy-700">
                <IconCheck size={16} className="mt-0.5 shrink-0 text-sky-600" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
            {doctorSeoDisclaimer}
          </p>
        </div>
      </div>
    </section>
  );
}
