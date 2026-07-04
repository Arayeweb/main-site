import SectionHeader from "@/components/home/SectionHeader";
import { bizcardTestimonials } from "@/lib/bizcardData";

export default function BizcardTestimonials() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نظرات"
          badgeClassName="bg-brand-50 text-brand-600"
          title="کسب‌وکارهایی که دیجیتال شدند"
          subtitle="بدون هزینه و بدون دانش فنی"
        />
        <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-3">
          {bizcardTestimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
            >
              <div className="mb-3 text-amber-500">★★★★★</div>
              <p className="flex-1 text-[13px] leading-relaxed text-navy-600">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3 border-t border-navy-100 pt-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${t.gradient} text-sm font-bold text-white`}
                >
                  {t.initial}
                </div>
                <div>
                  <div className="text-sm font-bold text-navy-900">{t.name}</div>
                  <div className="text-xs text-navy-400">{t.biz}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
