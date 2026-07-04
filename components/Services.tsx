import { services } from "@/lib/homeData";
import { DynamicIcon } from "./icons";
import SectionHeader from "./home/SectionHeader";

export default function Services() {
  const featured = services.find((s) => s.featured) ?? services[0];
  const rest = services.filter((s) => s.title !== featured.title);

  return (
    <section id="services" className="pt-14 pb-20 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="خدمات"
          title="سیستم‌هایی که برای رشد کسب‌وکار شما می‌سازیم"
          subtitle="از طراحی محصول تا توسعه فنی، اجرا و پشتیبانی — همه در یک تیم."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3">
          <div className="card group relative overflow-hidden border-brand-500/30 bg-gradient-to-br from-white to-brand-50/40 ring-1 ring-brand-200 lg:col-span-2 lg:row-span-2">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600">
              <DynamicIcon name={featured.icon} size={22} />
            </div>
            <h3 className="text-xl font-extrabold text-navy-900">{featured.title}</h3>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-navy-500">
              {featured.description}
            </p>
            <div className="mt-6 rounded-xl border border-navy-100 bg-white p-3 shadow-soft">
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="font-bold text-navy-700">پنل مدیریت</span>
                <span className="badge bg-green-50 text-green-600">فعال</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["لیدها", "فروش", "پروژه"].map((label, i) => (
                  <div key={label} className="rounded-lg bg-navy-50/80 p-2 text-center">
                    <p className="text-[10px] text-navy-400">{label}</p>
                    <p className="text-sm font-bold text-navy-800">{[24, 18, 7][i]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {rest.map((s) => (
            <div
              key={s.title}
              className="card group flex flex-col transition-all duration-200 hover:border-brand-400/40 hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-navy-100 bg-white text-navy-700 transition-colors group-hover:border-brand-200 group-hover:bg-brand-50 group-hover:text-brand-600">
                <DynamicIcon name={s.icon} size={18} />
              </div>
              <h3 className="text-base font-bold text-navy-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-500 line-clamp-3">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
