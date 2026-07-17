import SectionHeader from "@/components/home/SectionHeader";
import { doctorComparisonFooter, doctorComparisonRows } from "@/lib/doctorsData";

export default function DoctorsComparison() {
  return (
    <section id="comparison" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مقایسه"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="چرا سایت ۵ میلیونی معمولاً دوباره برایتان هزینه می‌سازد؟"
          subtitle="ارزان اول، هزینه دوم — یا دارایی رسمی مطب."
        />

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="mx-auto min-w-[680px] w-full max-w-4xl border-collapse overflow-hidden rounded-2xl border border-navy-100 bg-white text-right text-sm shadow-soft">
            <thead>
              <tr className="bg-navy-900 text-white">
                <th scope="col" className="px-4 py-3 font-bold">
                  معیار
                </th>
                <th scope="col" className="px-4 py-3 font-bold text-cyan-300">
                  آرایه
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  قالب ارزان
                </th>
                <th scope="col" className="px-4 py-3 font-bold">
                  سامانه نوبت‌دهی عمومی
                </th>
              </tr>
            </thead>
            <tbody>
              {doctorComparisonRows.map((row, index) => (
                <tr key={row.criterion} className={index % 2 === 0 ? "bg-white" : "bg-navy-50/40"}>
                  <th scope="row" className="px-4 py-3 font-bold text-navy-800">
                    {row.criterion}
                  </th>
                  <td className="px-4 py-3 font-semibold text-cyan-800">{row.araaye}</td>
                  <td className="px-4 py-3 text-navy-600">{row.template}</td>
                  <td className="px-4 py-3 text-navy-600">{row.booking}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mx-auto mt-6 max-w-3xl text-center text-sm font-semibold leading-relaxed text-navy-700">
          {doctorComparisonFooter}
        </p>

        <div className="mt-8 text-center">
          <a
            href="#quote-form"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
          >
            این مدل را برای مطبم می‌خواهم
          </a>
        </div>
      </div>
    </section>
  );
}
