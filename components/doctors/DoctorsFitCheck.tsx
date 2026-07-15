import { doctorNotSuitableFor, doctorSuitableFor } from "@/lib/doctorsData";
import { IconCheck } from "@/components/icons";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsFitCheck() {
  return (
    <section id="fit-check" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مناسب بودن"
          badgeClassName="bg-sky-50 text-sky-700"
          title="این بررسی برای چه مطب‌هایی مناسب است؟"
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-sky-100 bg-white p-6 shadow-soft">
            <h3 className="text-sm font-extrabold text-sky-700">مناسب است برای</h3>
            <ul className="mt-4 space-y-2.5">
              {doctorSuitableFor.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-600">
                  <IconCheck size={14} className="mt-1 shrink-0 text-sky-600" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft">
            <h3 className="text-sm font-extrabold text-navy-700">مناسب نیست برای</h3>
            <ul className="mt-4 space-y-2.5">
              {doctorNotSuitableFor.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-500 before:mt-1.5 before:shrink-0 before:content-['–']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
