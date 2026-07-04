import { seoCases } from "@/lib/seoData";
import SectionHeader from "@/components/home/SectionHeader";

export default function SeoLocalCases() {
  return (
    <section id="cases" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نتایج واقعی"
          badgeClassName="bg-teal-50 text-teal-700"
          title="کسب‌وکارهای محلی که با سئو رشد کردند"
          subtitle="سه نمونه از مشتریانی که در جستجوی محلی گوگل دیده شدند و مشتری واقعی گرفتند."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {seoCases.map((c) => (
            <article
              key={c.title}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <span className="mb-3 inline-flex w-fit rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-teal-700">
                {c.tag}
              </span>
              <h3 className="text-sm font-bold text-navy-900">{c.title}</h3>

              <div className="my-5 flex items-center gap-3">
                <div className="flex-1 rounded-xl bg-red-50/70 px-3 py-3 text-center">
                  <div className="text-[11px] text-navy-400">{c.beforeLabel}</div>
                  <div className="mt-1 text-xl font-extrabold text-red-500">{c.before}</div>
                </div>
                <span className="text-lg text-navy-300" aria-hidden>
                  ←
                </span>
                <div className="flex-1 rounded-xl bg-teal-50/80 px-3 py-3 text-center">
                  <div className="text-[11px] text-navy-400">{c.afterLabel}</div>
                  <div className="mt-1 text-xl font-extrabold text-teal-600">{c.after}</div>
                </div>
              </div>

              <p className="flex-1 text-[13px] leading-relaxed text-navy-500">{c.result}</p>
              <div className="mt-4 border-t border-navy-100 pt-3 text-xs font-bold text-teal-600">
                {c.time}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
