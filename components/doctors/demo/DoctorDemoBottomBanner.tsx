import Link from "next/link";
import { IconSparkle } from "@/components/icons";
import DoctorsWhatsAppCta from "@/components/doctors/DoctorsWhatsAppCta";
import { buildDoctorsWaSpecialtyMessage } from "@/lib/doctorsData";
import type { DoctorDemoLandingContent } from "@/lib/doctorsDemoData";
import { getDoctorDemoAccent } from "@/lib/doctorsDemoData";

export default function DoctorDemoBottomBanner({
  content,
}: {
  content: DoctorDemoLandingContent;
}) {
  const accent = getDoctorDemoAccent(content.accent);
  const specialtyLabel = content.practiceName;

  return (
    <section className="border-t border-navy-100 bg-navy-900 py-10 sm:py-12">
      <div className="container-mx container-px flex flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-amber-300">
          <IconSparkle size={14} />
          این یک نمونه است
        </span>
        <p className="max-w-xl text-sm leading-relaxed text-navy-200 sm:text-base">
          «{content.practiceName}» یک کسب‌وکار واقعی نیست — این صفحه فقط نمونه‌ای از لندینگ مطب است
          که تیم آرایه می‌تواند برای شما بسازد.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <DoctorsWhatsAppCta
            source="doctor_demo_landing"
            specialty={content.key}
            message={buildDoctorsWaSpecialtyMessage(specialtyLabel)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-all active:scale-[0.98] ${accent.bg} ${accent.hoverBg}`}
          >
            این مدل را برای مطب من می‌خواهم
          </DoctorsWhatsAppCta>
          <Link
            href="/doctors"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-white/15 active:scale-[0.98]"
          >
            بازگشت به صفحه سفارش
          </Link>
        </div>
      </div>
    </section>
  );
}
