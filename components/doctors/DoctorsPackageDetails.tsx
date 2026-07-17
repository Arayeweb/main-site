import SectionHeader from "@/components/home/SectionHeader";
import { IconCheck, IconClose } from "@/components/icons";
import {
  doctorProductPackageExcluded,
  doctorProductPackageFeatures,
  doctorSeoDisclaimer,
} from "@/lib/doctorsData";

export default function DoctorsPackageDetails() {
  return (
    <section id="package" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="محتوای پکیج"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="جزئیات پکیج طراحی سایت پزشکی"
          subtitle="موارد داخل پکیج و خارج از پکیج را شفاف ببینید."
        />

        <div className="mx-auto grid max-w-4xl gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-soft sm:p-8">
            <h3 className="text-base font-extrabold text-cyan-800">داخل پکیج</h3>
            <ul className="mt-5 space-y-3">
              {doctorProductPackageFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-navy-700">
                  <IconCheck size={16} className="mt-0.5 shrink-0 text-cyan-700" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-navy-100 bg-navy-50/50 p-6 shadow-soft sm:p-8">
            <h3 className="text-base font-extrabold text-navy-800">خارج از پکیج</h3>
            <ul className="mt-5 space-y-3">
              {doctorProductPackageExcluded.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                  <IconClose size={16} className="mt-0.5 shrink-0 text-navy-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] leading-relaxed text-amber-900">
              {doctorSeoDisclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
