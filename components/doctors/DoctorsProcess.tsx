import { doctorProductProcessSteps } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsProcess() {
  return (
    <section id="process" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مراحل اجرا"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="مراحل اجرا"
          subtitle="از ارسال اطلاعات تا انتشار روی دامنه پزشک."
        />

        <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctorProductProcessSteps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-50 text-sm font-extrabold text-cyan-800">
                {item.step}
              </div>
              <h3 className="text-sm font-extrabold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
