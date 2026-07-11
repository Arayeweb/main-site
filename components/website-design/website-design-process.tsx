import SectionHeader from "@/components/home/SectionHeader";
import { processSteps } from "@/data/website-design";

export default function WebsiteDesignProcess() {
  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader badge="فرایند همکاری" title="از شناخت کسب‌وکار تا انتشار سایت" />

        <ol className="mx-auto max-w-3xl space-y-0">
          {processSteps.map((step, index) => (
            <li
              key={step.title}
              className="relative flex gap-5 border-s-2 border-brand-100 pb-8 ps-6 last:border-s-transparent last:pb-0 sm:gap-6 sm:ps-8"
            >
              <span
                className="absolute -start-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-[11px] font-extrabold text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-navy-900">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-500">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
