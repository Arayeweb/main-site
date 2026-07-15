import { MODARES_OUTCOMES } from "@/lib/modaresData";

export default function ModaresOutcomes() {
  return (
    <section className="border-t border-navy-100 bg-white py-10 sm:py-12">
      <div className="container-mx container-px">
        <h2 className="text-center text-lg font-extrabold text-navy-900 sm:text-xl">
          سایت مدرس چه چیزی برایتان می‌سازد؟
        </h2>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          {MODARES_OUTCOMES.map((outcome) => (
            <article
              key={outcome.title}
              className="rounded-xl border border-navy-100 bg-navy-50/30 px-4 py-3.5 sm:px-5 sm:py-4"
            >
              <h3 className="text-sm font-extrabold text-navy-900">{outcome.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-navy-500 sm:text-[13px]">
                {outcome.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
