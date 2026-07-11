import SectionHeader from "@/components/home/SectionHeader";
import { problems } from "@/data/website-design";

export default function WebsiteDesignProblems() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مشکل فقط ظاهر سایت نیست"
          title="چرا خیلی از سایت‌ها هیچ مشتری‌ای نمی‌سازند؟"
          className="text-start sm:text-center"
        />

        <div className="mx-auto max-w-4xl divide-y divide-navy-100 border-y border-navy-100">
          {problems.map((item, index) => (
            <article
              key={item.title}
              className="grid gap-3 py-6 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:py-8"
            >
              <div className="text-2xl font-extrabold tabular-nums text-brand-200 sm:text-3xl">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500 sm:text-[15px]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
