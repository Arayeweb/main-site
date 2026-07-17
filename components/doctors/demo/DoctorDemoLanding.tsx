import { IconCheck } from "@/components/icons";
import type { DoctorDemoLandingContent } from "@/lib/doctorsDemoData";
import { getDoctorDemoAccent } from "@/lib/doctorsDemoData";
import DoctorDemoBottomBanner from "./DoctorDemoBottomBanner";

export default function DoctorDemoLanding({
  content,
}: {
  content: DoctorDemoLandingContent;
}) {
  const accent = getDoctorDemoAccent(content.accent);

  return (
    <>
      <header className="border-b border-navy-100 bg-white">
        <div className="container-mx container-px flex items-center justify-between gap-4 py-4">
          <div className="text-right">
            <p className="text-sm font-extrabold text-navy-900 sm:text-base">{content.practiceName}</p>
            <p className="text-xs text-navy-400">{content.city}</p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:text-sm ${accent.bg}`}
          >
            {content.heroCta}
          </span>
        </div>
      </header>

      <main>
        <section
          className={`relative overflow-hidden bg-gradient-to-b ${accent.gradientFrom} ${accent.gradientVia} to-white pb-12 pt-10 sm:pb-16 sm:pt-14`}
        >
          <div className={`pointer-events-none absolute -top-20 right-1/4 h-64 w-64 rounded-full ${accent.softBg} blur-3xl opacity-60`} />

          <div className="container-mx container-px relative">
            <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div className="text-right">
                <span
                  className={`badge mb-4 ${accent.badgeBg} ${accent.badgeText} ring-1 ring-inset ring-black/5`}
                >
                  {content.heroBadge}
                </span>

                <h1 className="text-balance text-3xl font-extrabold leading-[1.35] text-navy-900 sm:text-4xl">
                  {content.heroTitle}{" "}
                  <span className={accent.text}>{content.heroTitleAccent}</span>
                </h1>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-500 sm:text-lg">
                  {content.heroSubtitle}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-navy-500">
                  <span className="font-bold text-navy-700">{content.doctorName}</span>
                  <span className="text-navy-200">•</span>
                  <span>{content.doctorTitle}</span>
                </div>

                <div className="mt-8">
                  <span
                    className={`inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-bold text-white ${accent.bg}`}
                  >
                    {content.heroCta}
                  </span>
                </div>

                <ul className="mt-8 space-y-2.5">
                  {content.trustBullets.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${accent.softBg} ${accent.text}`}
                      >
                        <IconCheck size={13} strokeWidth={2.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div
                  className={`overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-br ${accent.heroPanel} p-8 shadow-soft sm:p-10`}
                >
                  <div className="flex flex-col items-center text-center">
                    <span
                      className={`flex h-20 w-20 items-center justify-center rounded-2xl text-4xl shadow-sm ${accent.iconBg}`}
                      aria-hidden="true"
                    >
                      {content.specialtyIcon}
                    </span>
                    <p className="mt-5 text-lg font-extrabold text-navy-900">{content.practiceName}</p>
                    <p className="mt-2 text-sm text-navy-500">{content.doctorTitle}</p>
                    <p className="mt-6 rounded-2xl bg-white/80 px-4 py-3 text-xs leading-relaxed text-navy-500">
                      نمونه لندینگ مطب — فقط صفحه اول سایت
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DoctorDemoBottomBanner content={content} />
      </main>
    </>
  );
}
