import type { DoctorDemoLandingContent } from "@/lib/doctorsDemoData";
import { getDoctorDemoAccent } from "@/lib/doctorsDemoData";

type DoctorDemoLandingPreviewProps = {
  content: DoctorDemoLandingContent;
  compact?: boolean;
};

export default function DoctorDemoLandingPreview({
  content,
  compact = false,
}: DoctorDemoLandingPreviewProps) {
  const accent = getDoctorDemoAccent(content.accent);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white text-right">
      <div className="flex items-center justify-between gap-2 border-b border-navy-50 bg-white px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <p
            className={`truncate font-extrabold text-navy-900 ${compact ? "text-[10px]" : "text-xs sm:text-sm"}`}
          >
            {content.practiceName}
          </p>
          {!compact ? (
            <p className="truncate text-[9px] font-medium text-navy-400 sm:text-[10px]">
              {content.doctorName}
            </p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-md px-2 py-1 text-[8px] font-bold sm:text-[9px] ${accent.badgeBg} ${accent.badgeText}`}
        >
          {compact ? "نوبت" : content.heroCta}
        </span>
      </div>

      <div
        className={`flex flex-1 flex-col bg-gradient-to-b ${accent.gradientFrom} ${accent.gradientVia} to-white p-3 sm:p-4`}
      >
        <span
          className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[8px] font-bold sm:text-[9px] ${accent.badgeBg} ${accent.badgeText}`}
        >
          {content.heroBadge}
        </span>

        <h2
          className={`mt-2 font-extrabold leading-snug text-navy-900 ${compact ? "text-[11px]" : "text-sm sm:text-base"}`}
        >
          {content.heroTitle}{" "}
          <span className={accent.text}>{content.heroTitleAccent}</span>
        </h2>

        {!compact ? (
          <p className="mt-2 line-clamp-3 text-[9px] leading-relaxed text-navy-500 sm:text-[10px]">
            {content.heroSubtitle}
          </p>
        ) : null}

        <div
          className={`mt-auto flex items-center justify-between gap-2 rounded-xl bg-gradient-to-br ${accent.heroPanel} p-2.5 sm:mt-3`}
        >
          <div className="min-w-0">
            <p className={`font-bold text-navy-800 ${compact ? "text-[9px]" : "text-[10px] sm:text-xs"}`}>
              {content.doctorName}
            </p>
            <p className="truncate text-[8px] text-navy-500 sm:text-[9px]">{content.city}</p>
          </div>
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm sm:h-8 sm:w-8 ${accent.iconBg}`}
            aria-hidden="true"
          >
            {content.specialtyIcon}
          </span>
        </div>
      </div>
    </div>
  );
}
