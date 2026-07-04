import { seoCompareRows } from "@/lib/seoData";
import SectionHeader from "@/components/home/SectionHeader";

export default function SeoCompareTable() {
  return (
    <section className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="چرا آرایه"
          badgeClassName="bg-teal-50 text-teal-700"
          title="تفاوت ما با آژانس‌های معمولی"
        />

        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50/60">
                <th className="px-5 py-3.5 text-right text-xs font-bold text-navy-500"> </th>
                <th className="px-5 py-3.5 text-right text-sm font-extrabold text-teal-600">آرایه</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold text-navy-400">
                  آژانس‌های معمولی
                </th>
              </tr>
            </thead>
            <tbody>
              {seoCompareRows.map((row) => (
                <tr key={row.label} className="border-b border-navy-100 last:border-0">
                  <td className="px-5 py-3.5 text-[13px] font-medium text-navy-700">{row.label}</td>
                  <td className="px-5 py-3.5 text-[13px] font-bold text-teal-700">{row.us}</td>
                  <td className="px-5 py-3.5 text-[13px] text-navy-400">{row.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
