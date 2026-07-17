import Image from "next/image";
import type { DoctorDemoLandingContent } from "@/lib/doctorsDemoData";
import { getDoctorDemoAccent } from "@/lib/doctorsDemoData";

type DoctorDemoLandingPreviewProps = {
  content: DoctorDemoLandingContent;
};

export default function DoctorDemoLandingPreview({ content }: DoctorDemoLandingPreviewProps) {
  const accent = getDoctorDemoAccent(content.accent);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f7f8fa] text-right">
      <div className="flex items-center justify-between gap-2 border-b border-navy-100/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold tracking-tight text-navy-900 sm:text-sm">
            {content.practiceName}
          </p>
          <p className="truncate text-[9px] font-medium text-navy-500 sm:text-[10px]">
            {content.doctorTitle} · {content.city}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md px-2.5 py-1 text-[8px] font-bold text-white sm:text-[9px] ${accent.bg}`}
        >
          {content.heroCta}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-2 overflow-hidden">
        <div className="flex flex-col justify-center gap-2 p-3 sm:p-4">
          <p className={`text-[8px] font-bold tracking-[0.14em] sm:text-[9px] ${accent.text}`}>
            {content.heroBadge}
          </p>
          <h2 className="text-[11px] font-extrabold leading-snug text-navy-900 sm:text-sm">
            {content.heroTitle}{" "}
            <span className={accent.text}>{content.heroTitleAccent}</span>
          </h2>
          <p className="line-clamp-3 text-[8px] leading-relaxed text-navy-500 sm:text-[10px]">
            {content.heroSubtitle}
          </p>
          <div className="mt-1">
            <span
              className={`inline-flex rounded-md px-2.5 py-1 text-[8px] font-bold text-white sm:text-[9px] ${accent.bg}`}
            >
              {content.heroCta}
            </span>
          </div>
        </div>

        <div className="relative min-h-[160px] sm:min-h-[200px]">
          <Image
            src={content.heroImage}
            alt={content.heroImageAlt}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 50vw, 280px"
          />
        </div>
      </div>
    </div>
  );
}
