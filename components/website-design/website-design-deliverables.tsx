import SectionHeader from "@/components/home/SectionHeader";
import { solutionDeliverables } from "@/data/website-design";

export default function WebsiteDesignDeliverables() {
  return (
    <section className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="راهکار آرایه"
          title="طراحی سایت به‌عنوان یک سیستم جذب مشتری"
          subtitle="ما سایت را فقط مجموعه‌ای از صفحات طراحی نمی‌کنیم. چیدمان محتوا، مسیر تماس و سفارش، فرم‌های دریافت درخواست، سرعت، سئو و آمار بازدید از ابتدا بخشی از پروژه هستند."
        />

        <div className="mx-auto max-w-3xl rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          <ul className="space-y-0 divide-y divide-navy-50">
            {solutionDeliverables.map((item, index) => (
              <li
                key={item}
                className="flex items-start gap-4 py-4 first:pt-0 last:pb-0"
              >
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-extrabold text-brand-600"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span className="text-sm font-bold leading-relaxed text-navy-800 sm:text-[15px]">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
