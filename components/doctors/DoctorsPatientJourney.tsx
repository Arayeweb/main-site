import { doctorPatientPathBar } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";
import { IconArrowLeft } from "@/components/icons";

export default function DoctorsPatientJourney() {
  const { steps, note } = doctorPatientPathBar;

  return (
    <section id="patient-path" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مسیر بیمار"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="مسیر تصمیم بیمار"
          subtitle={note}
        />

        <div className="mx-auto flex max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2 sm:contents">
              <div className="flex-1 rounded-2xl border border-navy-100 bg-white px-4 py-4 text-center shadow-soft sm:min-w-[140px] sm:flex-none">
                <span className="mb-1 block text-[11px] font-bold text-cyan-700">
                  مرحله {index + 1}
                </span>
                <span className="text-sm font-extrabold text-navy-900">{step}</span>
              </div>
              {index < steps.length - 1 ? (
                <IconArrowLeft
                  size={18}
                  className="mx-auto rotate-90 text-navy-300 sm:mx-1 sm:rotate-0"
                  aria-hidden
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
