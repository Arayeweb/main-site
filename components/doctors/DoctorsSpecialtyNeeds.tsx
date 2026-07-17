import { doctorSpecialtyNeedCards } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsSpecialtyNeeds() {
  return (
    <section id="specialty-needs" className="section-py scroll-mt-24 bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="تفاوت تخصص‌ها"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="تفاوت نیاز تخصص‌ها"
          subtitle="هر تخصص مسیر اعتماد و اقدام متفاوتی برای بیمار دارد."
        />

        <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2">
          {doctorSpecialtyNeedCards.map((card) => (
            <article
              key={card.key}
              className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-7"
            >
              <h3 className="text-lg font-extrabold text-navy-900">{card.title}</h3>
              <p className="mt-2 text-[13px] font-bold text-cyan-800">{card.specialties}</p>
              <p className="mt-4 text-sm leading-relaxed text-navy-600">{card.focus}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
