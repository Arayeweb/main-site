import SectionHeader from "@/components/home/SectionHeader";
import { websiteDesignFaq } from "@/data/website-design";

export default function WebsiteDesignFaq() {
  return (
    <section id="faq" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader badge="سوالات متداول" title="پرسش‌های رایج درباره طراحی سایت" />

        <div className="mx-auto max-w-2xl border-t border-navy-100">
          {websiteDesignFaq.map((item) => (
            <details key={item.q} className="group border-b border-navy-100">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-right text-sm font-bold leading-relaxed text-navy-900 sm:py-5 sm:text-[15px] [&::-webkit-details-marker]:hidden">
                <span>{item.q}</span>
                <span
                  className="shrink-0 text-xl font-light text-navy-300 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-45"
                  aria-hidden="true"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-navy-500 sm:pb-5 sm:text-[15px]">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
