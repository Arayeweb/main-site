import { doctorProblems } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

export default function DoctorsProblems() {
  return (
    <section id="problems" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="مشکلات رایج"
          badgeClassName="bg-sky-50 text-sky-700"
          title="مشکلاتی که مسیر جذب بیمار را می‌بندند"
          subtitle="گزارش رایگان مشخص می‌کند کدام‌یک برای مطب شما اولویت دارد."
        />

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
          {doctorProblems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-navy-100 bg-white p-6 shadow-soft"
            >
              <h3 className="text-sm font-extrabold text-navy-900">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
