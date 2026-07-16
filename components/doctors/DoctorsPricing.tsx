import SectionHeader from "@/components/home/SectionHeader";
import DoctorsWhatsAppCta from "@/components/doctors/DoctorsWhatsAppCta";
import {
  DOCTORS_LAUNCH_NOTE,
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorDeliveryTimeline,
  doctorPaymentMilestones,
  formatToman,
} from "@/lib/doctorsData";

export default function DoctorsPricing() {
  return (
    <section id="pricing" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="قیمت و شرایط"
          badgeClassName="bg-sky-50 text-sky-700"
          title="قیمت و شرایط شروع"
        />

        <div className="mx-auto max-w-xl rounded-3xl border border-navy-100 bg-white p-8 text-center shadow-soft">
          <p className="text-sm font-medium text-navy-500">پکیج سایت مطب مستقل</p>
          <p className="mt-2 text-4xl font-extrabold text-sky-600">
            {formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)}
            <span className="mr-1 text-base font-medium text-navy-400">تومان</span>
          </p>
          <p className="mt-2 text-[12px] text-navy-400">{DOCTORS_LAUNCH_NOTE}</p>

          <ul className="mt-8 space-y-3 text-right text-sm text-navy-600">
            {doctorPaymentMilestones.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-4 border-b border-navy-50 pb-3">
                <span>{item.label}</span>
                <span className="font-extrabold text-sky-700">{item.percent}</span>
              </li>
            ))}
          </ul>

          <ul className="mt-6 space-y-2 text-right text-[13px] text-navy-500">
            {doctorDeliveryTimeline.map((item) => (
              <li key={item.label}>
                <span className="font-bold text-navy-700">{item.label}:</span> {item.value}
              </li>
            ))}
          </ul>

          <DoctorsWhatsAppCta source="pricing" fullWidth className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]">
            شروع سفارش در واتساپ
          </DoctorsWhatsAppCta>
        </div>
      </div>
    </section>
  );
}
