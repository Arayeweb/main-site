import SectionHeader from "@/components/home/SectionHeader";
import { bizcardSteps } from "@/lib/bizcardData";

export default function BizcardSteps() {
  return (
    <section id="how" className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="۳ مرحله"
          badgeClassName="bg-brand-50 text-brand-600"
          title="چطور کار می‌کند؟"
          subtitle="در کمتر از ۲ دقیقه لینک همه‌کاره کسب‌وکارتان آماده می‌شود."
        />
        <div className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
          {bizcardSteps.map((s) => (
            <div
              key={s.num}
              className="rounded-2xl border border-navy-100 bg-navy-50/40 p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-lg font-extrabold text-brand-600">
                {s.num}
              </div>
              <h3 className="text-sm font-extrabold text-navy-900">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
