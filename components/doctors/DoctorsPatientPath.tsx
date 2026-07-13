import { doctorPatientPath } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsPatientPath() {
  return (
    <section id="patient-path" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مسیر بیمار"
          badgeClassName="bg-sky-50 text-sky-700"
          title="جستجو ← اعتماد ← درخواست نوبت"
          subtitle="اگر هر حلقه ضعیف باشد، بیمار به مطب بعدی می‌رود."
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {doctorPatientPath.map((item, index) => (
            <div key={item.title} className="relative rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-soft">
              {index < doctorPatientPath.length - 1 ? (
                <span
                  className="pointer-events-none absolute -left-2 top-1/2 hidden -translate-y-1/2 text-sky-300 sm:block"
                  aria-hidden
                >
                  ←
                </span>
              ) : null}
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-extrabold text-white">
                {item.step}
              </div>
              <h3 className="text-sm font-extrabold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
