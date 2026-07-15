import { doctorSampleReport } from "@/lib/doctorsData";

export default function DoctorsReportPreview() {
  const report = doctorSampleReport;

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card">
      <div className="border-b border-sky-100 bg-gradient-to-l from-sky-600 to-sky-500 px-5 py-4 text-white">
        <p className="text-[11px] font-medium text-sky-100">نمونه گزارش بررسی مطب</p>
        <h3 className="mt-1 text-sm font-extrabold sm:text-base">{report.clinicName}</h3>
      </div>

      <ul className="divide-y divide-navy-50 px-4 py-2 sm:px-5">
        {report.axes.map((item) => (
          <li key={item.label} className="py-3 text-right">
            <p className="text-[13px] font-bold text-navy-800">{item.label}</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-navy-500">{item.note}</p>
          </li>
        ))}
      </ul>

      <div className="border-t border-navy-50 bg-sky-50/50 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold text-sky-700">تشخیص اصلی</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-navy-700">{report.diagnosis}</p>
      </div>

      <div className="border-t border-navy-50 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold text-navy-700">سه اقدام اولویت‌دار</p>
        <ol className="mt-2 space-y-3">
          {report.priorityActions.map((action, i) => (
            <li key={action.text} className="text-right">
              <div className="flex gap-2 text-[11px] leading-relaxed text-navy-600">
                <span className="font-bold text-sky-600">{i + 1}.</span>
                <span className="flex-1">{action.text}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap justify-end gap-1.5">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  اثر: {action.impact}
                </span>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  سختی اجرا: {action.effort}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="border-t border-navy-50 bg-navy-50/40 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold text-navy-700">مسیر پیشنهادی</p>
        <p className="mt-1.5 text-[12px] leading-relaxed text-navy-600">{report.suggestedPath}</p>
      </div>
    </div>
  );
}
