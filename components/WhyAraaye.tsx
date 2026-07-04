import { whyAraaye, companyMetrics, testimonial } from "@/lib/homeData";
import { IconCheck } from "./icons";
import SectionHeader from "./home/SectionHeader";

export default function WhyAraaye() {
  return (
    <section id="about" className="section-py bg-navy-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />
      </div>

      <div className="container-mx container-px relative z-10">
        <SectionHeader
          badge="چرا آرایه؟"
          badgeClassName="bg-white/10 text-white"
          title="چرا آرایه؟"
          subtitle="فرق ما در خروجی است؛ سیستم‌هایی که به فروش، مدیریت و رشد کمک می‌کنند."
          dark
        />

        <div className="mb-10 grid gap-4 sm:grid-cols-3">
          {companyMetrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-6 text-center backdrop-blur-sm"
            >
              <p className="text-3xl font-extrabold text-white">{metric.value}</p>
              <p className="mt-1 text-sm text-navy-200">{metric.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <blockquote className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-base leading-relaxed text-navy-100 sm:text-lg">
              «{testimonial.quote}»
            </p>
            <footer className="mt-4 text-sm text-navy-300">
              <span className="font-bold text-white">{testimonial.author}</span>
              <span className="mx-2">—</span>
              {testimonial.role}
            </footer>
          </blockquote>

          <ul className="grid gap-3 sm:grid-cols-2">
            {whyAraaye.slice(0, 4).map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                  <IconCheck size={16} strokeWidth={2.5} />
                </span>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-navy-200">{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
