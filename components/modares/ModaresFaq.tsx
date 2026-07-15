import { MODARES_FAQ } from "@/lib/modaresData";

export default function ModaresFaq() {
  return (
    <section className="border-t border-navy-100 bg-white py-10 sm:py-12">
      <div className="container-mx container-px">
        <h2 className="text-center text-lg font-extrabold text-navy-900 sm:text-xl">
          سؤال‌های متداول
        </h2>

        <div className="mx-auto mt-6 flex max-w-xl flex-col gap-2.5 sm:mt-8">
          {MODARES_FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-navy-100 bg-navy-50/20 transition-colors open:border-cyan-200 open:bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold text-navy-800 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  className="shrink-0 text-lg text-navy-300 transition-transform group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="px-4 pb-4 text-xs leading-relaxed text-navy-500 sm:text-[13px]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
