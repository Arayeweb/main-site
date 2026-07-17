import type { DoctorFaqItem } from "@/lib/doctorsData";
import { doctorCooperationNote, doctorFaq } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";

type DoctorsFaqProps = {
  items?: DoctorFaqItem[];
  note?: string;
  title?: string;
};

export default function DoctorsFaq({
  items = doctorFaq,
  note = doctorCooperationNote,
  title = "پاسخ سؤال‌های رایج پزشکان",
}: DoctorsFaqProps) {
  return (
    <section id="faq" className="section-py bg-navy-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="سؤالات پرتکرار"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title={title}
        />

        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-navy-100 bg-white shadow-soft transition-colors open:border-sky-200"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-bold text-navy-800 [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="text-lg text-navy-300 transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 text-[13px] leading-relaxed text-navy-500">{item.a}</p>
            </details>
          ))}
        </div>

        {note ? (
          <p className="mx-auto mt-8 max-w-2xl text-center text-[12px] leading-relaxed text-navy-400">
            {note}
          </p>
        ) : null}
      </div>
    </section>
  );
}
