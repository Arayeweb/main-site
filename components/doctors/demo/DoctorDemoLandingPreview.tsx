import Image from "next/image";
import { DynamicIcon } from "@/components/icons";
import type { DoctorDemoLandingContent } from "@/lib/doctorsDemoData";
import { getDoctorDemoAccent, getDoctorDemoLayout } from "@/lib/doctorsDemoData";

type DoctorDemoLandingPreviewProps = {
  content: DoctorDemoLandingContent;
};

export default function DoctorDemoLandingPreview({ content }: DoctorDemoLandingPreviewProps) {
  const accent = getDoctorDemoAccent(content.accent);
  const layout = getDoctorDemoLayout(content.layout);
  const isWarm = content.layout === "warm";

  return (
    <div className={`flex h-full min-h-0 flex-col text-right ${layout.pageBg}`}>
      <div className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${layout.headerBg}`}>
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold tracking-tight text-navy-900 sm:text-sm">
            {content.practiceName}
          </p>
          <p className={`truncate text-[9px] font-medium sm:text-[10px] ${layout.textMuted}`}>
            {content.doctorTitle} · {content.city}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold text-white sm:text-[9px] ${accent.bg}`}
        >
          {content.heroCta}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className={`grid grid-cols-2 gap-0 ${layout.heroWrap}`}>
          <div className="flex flex-col justify-center gap-2 p-3 sm:p-4">
            <p
              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[7px] font-bold sm:text-[8px] ${accent.badgeBg} ${accent.badgeText}`}
            >
              {content.heroBadge}
            </p>
            <h2 className="text-[11px] font-extrabold leading-snug text-navy-900 sm:text-sm">
              {content.heroTitle}{" "}
              <span className={accent.text}>{content.heroTitleAccent}</span>
            </h2>
            <p className={`line-clamp-2 text-[8px] leading-relaxed sm:text-[10px] ${layout.textMuted}`}>
              {content.heroSubtitle}
            </p>
            <div>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold text-white sm:text-[9px] ${accent.bg}`}
              >
                {content.heroCta}
              </span>
            </div>
            {content.stats[0] ? (
              <p className={`text-[8px] font-semibold sm:text-[9px] ${layout.textMuted}`}>
                <span className={`font-extrabold ${accent.text}`}>{content.stats[0].value}</span>{" "}
                {content.stats[0].label}
              </p>
            ) : null}
          </div>

          <div className="relative min-h-[160px] sm:min-h-[200px]">
            <Image
              src={content.heroImage}
              alt={content.heroImageAlt}
              fill
              className={`object-cover object-center ${isWarm ? "rounded-bl-[1.25rem]" : ""}`}
              sizes="(max-width: 768px) 50vw, 280px"
            />
            {content.heroSecondaryImage ? (
              <div className="absolute -bottom-2 -left-2 z-10 h-10 w-8 overflow-hidden rounded-lg ring-2 ring-white sm:h-12 sm:w-10">
                <Image
                  src={content.heroSecondaryImage}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : null}
          </div>
        </div>

        {content.stats.length > 0 ? (
          <div className={`grid grid-cols-3 gap-1 border-y px-3 py-2 ${layout.cardBorder} ${layout.sectionBg}`}>
            {content.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-[9px] font-extrabold sm:text-[10px] ${accent.text}`}>{stat.value}</p>
                <p className={`text-[7px] sm:text-[8px] ${layout.textMuted}`}>{stat.label}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className={`grid grid-cols-4 gap-1.5 p-2.5 ${layout.sectionAltBg}`}>
          {content.services.slice(0, 4).map((service) => (
            <div
              key={service.title}
              className={`rounded-xl border p-1.5 text-center ${layout.cardBg} ${layout.cardBorder}`}
            >
              <div
                className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center rounded-md ${accent.iconBg}`}
              >
                <DynamicIcon name={service.icon} size={10} />
              </div>
              <p className="line-clamp-2 text-[7px] font-bold leading-tight text-navy-900 sm:text-[8px]">
                {service.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
