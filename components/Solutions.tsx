import Link from "next/link";
import { solutions } from "@/lib/homeData";
import { IconArrowLeft } from "./icons";
import SectionHeader from "./home/SectionHeader";
import SolutionPreviewArt from "./home/SolutionPreviewArt";

const solutionAccent = "from-navy-800 via-brand-700 to-brand-500";

export default function Solutions() {
  return (
    <section id="products" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="راهکارها"
          title="محصولات و مسیرهای آماده آرایه"
          subtitle="راهکارهایی آماده برای شروع سریع‌تر؛ قابل توسعه، قابل سفارشی‌سازی و متناسب با نیاز هر کسب‌وکار."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((sol) => (
            <Link
              key={sol.title}
              href={sol.url}
              className="group flex flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div
                className={`relative bg-gradient-to-br ${solutionAccent} px-4 pb-5 pt-4`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-wide text-white">{sol.title}</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                    Araaye
                  </span>
                </div>
                <div className="h-[7.5rem] overflow-hidden rounded-xl border border-white/25 bg-black/20 p-1 shadow-inner">
                  <SolutionPreviewArt product={sol.key} />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-base font-bold text-navy-900">{sol.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">
                  {sol.description}
                </p>
                <span className="mt-4 flex items-center gap-1.5 text-xs font-bold text-brand-600 transition-colors group-hover:text-brand-700">
                  {sol.cta}
                  <IconArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
