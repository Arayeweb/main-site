import Image from "next/image";
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
      <header className="relative z-20 border-b border-navy-100/70 bg-white/95 backdrop-blur-md">
        <div className="container-mx container-px flex items-center justify-between gap-4 py-4 sm:py-5">
          <div className="text-right">
            <p className="text-base font-extrabold tracking-tight text-navy-900 sm:text-lg">
              {content.practiceName}
            </p>
            <p className="mt-0.5 text-xs font-medium text-navy-500">
              {content.doctorTitle} · {content.city}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-xs font-bold text-white sm:text-sm ${accent.bg}`}
          >
            {content.heroCta}
          </span>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#f6f7f9]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(16,42,67,0.05),transparent_50%)]" />

          <div className="relative grid lg:min-h-[78vh] lg:grid-cols-2">
            <div className="flex flex-col justify-center px-5 py-14 sm:px-10 sm:py-20 lg:px-14 xl:px-20">
              <p
                className={`animate-fade-up text-[11px] font-bold tracking-[0.18em] ${accent.text} [animation-fill-mode:both]`}
              >
                {content.heroBadge}
              </p>

              <h1 className="animate-fade-up mt-6 text-balance text-[2.15rem] font-extrabold leading-[1.2] tracking-tight text-navy-900 sm:text-5xl [animation-delay:90ms] [animation-fill-mode:both]">
                {content.practiceName}
              </h1>

              <p className="animate-fade-up mt-5 max-w-md text-lg font-semibold leading-relaxed text-navy-700 sm:text-xl [animation-delay:160ms] [animation-fill-mode:both]">
                {content.heroTitle}{" "}
                <span className={accent.text}>{content.heroTitleAccent}</span>
              </p>

              <p className="animate-fade-up mt-4 max-w-md text-[15px] leading-relaxed text-navy-500 sm:text-base [animation-delay:220ms] [animation-fill-mode:both]">
                {content.heroSubtitle}
              </p>

              <div className="animate-fade-up mt-9 [animation-delay:300ms] [animation-fill-mode:both]">
                <span
                  className={`inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-bold text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5 ${accent.bg} ${accent.hoverBg}`}
                >
                  {content.heroCta}
                </span>
                <p className="mt-4 text-sm font-medium text-navy-500">{content.doctorName}</p>
              </div>
            </div>

            <div className="relative min-h-[52vh] lg:min-h-full">
              <Image
                src={content.heroImage}
                alt={content.heroImageAlt}
                fill
                priority
                className="animate-fade-in object-cover object-center [animation-duration:900ms]"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        <section className="border-y border-navy-100 bg-white py-12 sm:py-14">
          <div className="container-mx container-px">
            <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3 sm:gap-8">
              {content.trustBullets.map((item) => (
                <div key={item} className="flex items-start gap-3 text-right">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${accent.softBg} ${accent.text}`}
                  >
                    <IconCheck size={13} strokeWidth={2.5} />
                  </span>
                  <p className="text-sm leading-relaxed text-navy-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DoctorDemoBottomBanner content={content} />
      </main>
    </>
  );
}
