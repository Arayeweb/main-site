import { doctorTrustBarItems } from "@/lib/doctorsData";

export default function DoctorsTrustBar() {
  return (
    <section className="border-b border-navy-100 bg-navy-900 text-white" aria-label="نتایج فروش">
      <div className="container-mx container-px py-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center text-[12px] font-bold text-white/90 sm:text-[13px]">
          {doctorTrustBarItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
