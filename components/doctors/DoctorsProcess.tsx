import { doctorProcessSteps } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsProcess() {
  return (
    <section id="process" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="روش همکاری"
          badgeClassName="bg-sky-50 text-sky-700"
          title="در سه مرحله، بدون فشار فروش"
          subtitle="اول مشکل را روشن می‌کنیم؛ بعد پیشنهاد اجرا."
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {doctorProcessSteps.map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-navy-100 bg-white p-6 text-center shadow-soft"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sm font-extrabold text-sky-700">
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
