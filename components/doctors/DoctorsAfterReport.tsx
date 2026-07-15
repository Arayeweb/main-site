import {
  doctorAfterReportTrust,
  doctorCooperationNote,
  doctorDiagnosticPaths,
} from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsAfterReport() {
  return (
    <section id="after-report" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="بعد از گزارش"
          badgeClassName="bg-sky-50 text-sky-700"
          title="بعد از گزارش، فقط مسیر متناسب با مطب شما پیشنهاد می‌شود"
          subtitle="گزارش رایگان مشخص می‌کند مشکل اصلی در زیرساخت، دیده‌شدن یا مسیر نوبت است. ممکن است فعلاً نیازی به طراحی سایت جدید نداشته باشید."
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {doctorDiagnosticPaths.map((path) => (
            <article
              key={path.key}
              className="rounded-2xl border border-navy-100 bg-white p-5 shadow-soft"
            >
              <h3 className="text-sm font-extrabold text-navy-900">{path.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{path.description}</p>
            </article>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-[13px] leading-relaxed text-navy-600">
          {doctorAfterReportTrust}
        </p>

        <p className="mx-auto mt-4 max-w-2xl text-center text-[12px] leading-relaxed text-navy-400">
          {doctorCooperationNote}
        </p>
      </div>
    </section>
  );
}
