import { processSteps } from "@/lib/homeData";
import SectionHeader from "./home/SectionHeader";

export default function Process() {
  return (
    <section id="process" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="فرایند همکاری"
          title="فرایند همکاری با آرایه"
          subtitle="از شناخت مسئله تا طراحی، توسعه و رشد؛ مسیر همکاری شفاف، مرحله‌به‌مرحله و قابل پیگیری است."
        />

        <ol className="relative grid gap-8 lg:grid-cols-4 lg:gap-6">
          <div
            className="pointer-events-none absolute right-[12.5%] left-[12.5%] top-7 hidden h-px bg-navy-200 lg:block"
            aria-hidden="true"
          />
          {processSteps.map((step) => (
            <li key={step.number} className="relative">
              <div className="flex gap-4 lg:flex-col lg:items-center lg:text-center">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-lg font-extrabold text-white shadow-card ring-4 ring-white">
                  {step.number}
                </span>
                <div className="lg:mt-4">
                  <h3 className="text-base font-bold text-navy-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-500">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
