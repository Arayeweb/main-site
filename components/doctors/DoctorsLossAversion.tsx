import { doctorLossAversion } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsLossAversion() {
  const { title, problems, punchline } = doctorLossAversion;

  return (
    <section id="loss" className="section-py scroll-mt-24 bg-navy-900 text-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="زیان‌گریزی"
          badgeClassName="bg-white/10 text-cyan-200"
          title={title}
          subtitle="اگر مسیر جذب بیمار از گوگل تا نوبت ساخته نشود، درخواست‌ها به مطب بعدی می‌رود."
          dark
        />

        <div className="mx-auto grid max-w-4xl gap-4">
          {problems.map((item, index) => (
            <div
              key={item}
              className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-extrabold text-cyan-200">
                {index + 1}
              </span>
              <p className="text-sm leading-relaxed text-white/90 sm:text-[15px]">{item}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-3xl rounded-2xl bg-cyan-500/15 px-5 py-4 text-center text-base font-extrabold text-cyan-100 ring-1 ring-cyan-400/30 sm:text-lg">
          {punchline}
        </p>

        <div className="mt-8 text-center">
          <a
            href="#quote-form"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-extrabold text-navy-950 transition-all hover:bg-cyan-400 active:scale-[0.98]"
          >
            دریافت قیمت و زمان‌بندی
          </a>
        </div>
      </div>
    </section>
  );
}
