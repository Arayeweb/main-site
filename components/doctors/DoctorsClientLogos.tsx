import { doctorClients } from "@/lib/doctorsData";

export default function DoctorsClientLogos() {
  return (
    <section aria-label="پزشکان و مطب‌های همکار با آرایه" className="border-b border-sky-100/80 bg-white/90 pb-3 pt-16">
      <div className="container-mx container-px">
        <p className="mb-3 text-center text-[11px] font-medium text-navy-400 sm:text-xs">
          مورد اعتماد پزشکان، مطب‌ها و کلینیک‌های سراسر ایران
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-x-10">
          {doctorClients.map((client) => (
            <li key={client.name} className="flex flex-col items-center text-center">
              <span className="text-xs font-bold text-navy-600 sm:text-sm">{client.name}</span>
              <span className="mt-0.5 text-[10px] text-navy-400">{client.specialty}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
