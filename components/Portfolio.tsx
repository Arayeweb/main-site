import { portfolio } from "@/lib/homeData";
import { DynamicIcon } from "./icons";

export default function Portfolio() {
  return (
    <section id="portfolio" className="section-py">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="badge bg-brand-50 text-brand-600 mb-4">نمونه‌کارها</span>
          <h2 className="section-title">نمونه مسیرهایی که می‌توانیم بسازیم</h2>
          <p className="section-subtitle">
            نمونه راهکارهایی که برای کسب‌وکارهای مختلف طراحی و اجرا می‌کنیم.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.map((item) => (
            <div key={item.title} className="card group flex flex-col">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-navy-100 text-navy-700 transition-colors group-hover:bg-brand-50 group-hover:border-brand-200">
                <DynamicIcon name={item.icon} size={22} />
              </div>
              <h3 className="text-base font-bold text-navy-900 mb-4">{item.title}</h3>

              <div className="space-y-3 text-sm flex-1">
                <div>
                  <p className="mb-1 text-xs font-bold text-red-400">مشکل</p>
                  <p className="text-navy-500 leading-relaxed">{item.problem}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold text-brand-600">راهکار</p>
                  <p className="text-navy-500 leading-relaxed">{item.solution}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-bold text-green-600">نتیجه کسب‌وکار</p>
                  <p className="text-navy-500 leading-relaxed">{item.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
