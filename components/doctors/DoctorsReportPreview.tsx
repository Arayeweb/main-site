import { doctorSampleReport } from "@/lib/doctorsData";

const statusStyles = {
  ok: "bg-emerald-50 text-emerald-700",
  warn: "bg-amber-50 text-amber-700",
  missing: "bg-red-50 text-red-600",
} as const;

const statusLabel = {
  ok: "خوب",
  warn: "ناقص",
  missing: "نیست",
} as const;

export default function DoctorsReportPreview({ compact = false }: { compact?: boolean }) {
  const report = doctorSampleReport;

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-card ${
        compact ? "" : "mx-auto max-w-2xl"
      }`}
    >
      <div className="border-b border-sky-100 bg-gradient-to-l from-sky-600 to-sky-500 px-5 py-4 text-white">
        <p className="text-[11px] font-medium text-sky-100">نمونه گزارش بررسی مطب</p>
        <h3 className="mt-1 text-sm font-extrabold sm:text-base">{report.clinicName}</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-sky-100 sm:text-xs">{report.summary}</p>
      </div>

      <ul className="divide-y divide-navy-50 px-4 py-2 sm:px-5">
        {report.checks.map((item) => (
          <li key={item.label} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0 text-right">
              <p className="text-[13px] font-bold text-navy-800">{item.label}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-navy-500">{item.note}</p>
            </div>
            <span
              className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold ${statusStyles[item.status]}`}
            >
              {statusLabel[item.status]}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-navy-50 bg-navy-50/40 px-4 py-4 sm:px-5">
        <p className="text-[11px] font-bold text-navy-700">سه پیشنهاد بهبود</p>
        <ol className="mt-2 space-y-1.5">
          {report.suggestions.map((s, i) => (
            <li key={s} className="flex gap-2 text-[11px] leading-relaxed text-navy-600">
              <span className="font-bold text-sky-600">{i + 1}.</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
