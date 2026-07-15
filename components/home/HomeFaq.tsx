import { homeFaq } from "@/lib/homeFaq";

export default function HomeFaq() {
  return (
    <section id="faq" className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-[900px] px-5 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-[1.75rem]">
          سوالات متداول درباره شرکت آرایه
        </h2>

        <div className="mt-8 border-t border-navy-100">
          {homeFaq.map((item) => (
            <details key={item.q} className="group border-b border-navy-100">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-right text-[15px] font-bold leading-relaxed text-navy-900 sm:py-5 sm:text-base [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  className="shrink-0 text-xl font-light text-navy-300 transition-transform duration-200 group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="pb-4 pr-0 text-sm leading-relaxed text-navy-500 sm:pb-5 sm:text-[15px]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
