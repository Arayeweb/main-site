import Image from "next/image";
import { DynamicIcon, IconCheck } from "@/components/icons";
import type { DoctorDemoLandingContent } from "@/lib/doctorsDemoData";
import { getDoctorDemoAccent, getDoctorDemoLayout } from "@/lib/doctorsDemoData";
import DoctorDemoBottomBanner from "./DoctorDemoBottomBanner";

const NAV_LINKS = ["خانه", "خدمات", "درباره ما", "نمونه کارها", "تماس"];

export default function DoctorDemoLanding({
  content,
}: {
  content: DoctorDemoLandingContent;
}) {
  const accent = getDoctorDemoAccent(content.accent);
  const layout = getDoctorDemoLayout(content.layout);
  const isWarm = content.layout === "warm";

  return (
    <>
      <header className={`relative z-20 ${layout.headerBg}`}>
        <div className="container-mx container-px flex items-center justify-between gap-4 py-4 sm:py-5">
          <nav className="hidden items-center gap-5 lg:flex" aria-label="منوی اصلی">
            {NAV_LINKS.map((link) => (
              <span
                key={link}
                className={`text-xs font-semibold transition-colors ${layout.textMuted} hover:text-navy-900`}
              >
                {link}
              </span>
            ))}
          </nav>

          <div className="text-center lg:absolute lg:left-1/2 lg:-translate-x-1/2">
            <p className="text-base font-extrabold tracking-tight text-navy-900 sm:text-lg">
              {content.practiceName}
            </p>
            <p className={`mt-0.5 text-[11px] font-medium sm:text-xs ${layout.textMuted}`}>
              {content.doctorTitle} · {content.city}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-soft sm:text-sm ${accent.bg}`}
          >
            {content.heroCta}
          </span>
        </div>
      </header>

      <main className={layout.pageBg}>
        <section className={`relative overflow-hidden ${layout.heroWrap}`}>
          <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
          <div
            className={`pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full ${accent.softBg} opacity-60 blur-3xl`}
          />

          <div className="container-mx container-px py-10 sm:py-14 lg:py-16">
            <div
              className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-14 ${layout.heroPanel} p-6 sm:p-8 lg:p-12`}
            >
              <div className="order-2 text-right lg:order-1">
                <p
                  className={`inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-wide ${accent.badgeBg} ${accent.badgeText}`}
                >
                  {content.heroBadge}
                </p>

                <h1 className="mt-5 text-balance text-[2rem] font-extrabold leading-[1.18] tracking-tight text-navy-900 sm:text-[2.6rem] lg:text-5xl">
                  {content.heroTitle}{" "}
                  <span className={accent.text}>{content.heroTitleAccent}</span>
                </h1>

                <p className={`mt-5 max-w-lg text-[15px] leading-relaxed sm:text-base ${layout.textMuted}`}>
                  {content.heroSubtitle}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-soft transition-transform duration-200 hover:-translate-y-0.5 ${accent.bg} ${accent.hoverBg}`}
                  >
                    {content.heroCta}
                  </span>
                  <span className={`text-sm font-semibold ${layout.textMuted}`}>
                    {content.doctorName}
                  </span>
                </div>

                {content.stats.length > 0 ? (
                  <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-navy-100/70 pt-6">
                    <div className="flex -space-x-2 space-x-reverse">
                      {[content.heroImage, content.aboutImage, content.heroSecondaryImage]
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((src, i) => (
                          <div
                            key={src}
                            className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-white"
                            style={{ zIndex: 3 - i }}
                          >
                            <Image src={src!} alt="" fill className="object-cover" sizes="36px" />
                          </div>
                        ))}
                    </div>
                    <p className={`text-sm font-semibold ${layout.textMuted}`}>
                      <span className={`text-base font-extrabold ${accent.text}`}>
                        {content.stats[0]?.value}
                      </span>{" "}
                      {content.stats[0]?.label}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="relative order-1 min-h-[320px] sm:min-h-[380px] lg:order-2 lg:min-h-[460px]">
                <div
                  className={`absolute inset-0 overflow-hidden ${isWarm ? "rounded-[2rem]" : "rounded-[1.75rem]"} shadow-[0_20px_60px_-24px_rgba(16,42,67,0.28)]`}
                >
                  <Image
                    src={content.heroImage}
                    alt={content.heroImageAlt}
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>

                {content.heroSecondaryImage ? (
                  <div
                    className={`absolute -bottom-6 -left-4 z-10 hidden h-40 w-32 overflow-hidden shadow-card ring-4 ring-white sm:block lg:-left-8 lg:h-52 lg:w-40 ${isWarm ? "rounded-[1.5rem]" : "rounded-2xl"}`}
                  >
                    <Image
                      src={content.heroSecondaryImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  </div>
                ) : null}

                {content.heroSecondaryImage ? (
                  <div
                    className={`absolute -right-3 top-8 z-10 hidden h-28 w-24 overflow-hidden shadow-card ring-4 ring-white sm:block lg:-right-6 lg:h-36 lg:w-28 ${isWarm ? "rounded-[1.25rem]" : "rounded-xl"}`}
                  >
                    <Image
                      src={content.aboutImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {content.stats.length > 0 ? (
          <section className={`border-y ${layout.cardBorder} ${layout.sectionBg} py-10 sm:py-12`}>
            <div className="container-mx container-px">
              <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3 sm:gap-8">
                {content.stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className={`text-2xl font-extrabold tracking-tight sm:text-3xl ${accent.text}`}>
                      {stat.value}
                    </p>
                    <p className={`mt-1.5 text-sm font-medium ${layout.textMuted}`}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className={`section-py ${layout.sectionAltBg}`}>
          <div className="container-mx container-px">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="relative min-h-[300px] sm:min-h-[380px]">
                <div
                  className={`absolute inset-0 overflow-hidden ${isWarm ? "rounded-[2rem]" : "rounded-3xl"} shadow-card`}
                >
                  <Image
                    src={content.aboutImage}
                    alt={content.aboutImageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div
                  className={`absolute -bottom-5 -left-5 hidden h-28 w-28 overflow-hidden shadow-soft ring-4 ring-white sm:block lg:h-36 lg:w-36 ${isWarm ? "rounded-[1.5rem]" : "rounded-2xl"}`}
                >
                  <Image
                    src={content.heroImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                </div>
              </div>

              <div className="text-right">
                <p className={`text-[11px] font-bold tracking-[0.16em] ${accent.text}`}>درباره ما</p>
                <h2 className="mt-3 text-2xl font-extrabold leading-snug text-navy-900 sm:text-3xl">
                  {content.aboutTitle}
                </h2>
                <p className={`mt-5 text-[15px] leading-relaxed sm:text-base ${layout.textMuted}`}>
                  {content.aboutText}
                </p>

                <ul className="mt-7 space-y-3.5">
                  {content.trustBullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${accent.softBg} ${accent.text}`}
                      >
                        <IconCheck size={13} strokeWidth={2.5} />
                      </span>
                      <span className={`text-sm leading-relaxed ${layout.textMuted}`}>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-bold text-white ${accent.bg}`}
                  >
                    بیشتر بدانید
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {content.services.length > 0 ? (
          <section className={`section-py ${layout.sectionBg}`}>
            <div className="container-mx container-px">
              <div className="mx-auto max-w-2xl text-center">
                <p className={`text-[11px] font-bold tracking-[0.16em] ${accent.text}`}>خدمات ما</p>
                <h2 className="mt-3 text-2xl font-extrabold text-navy-900 sm:text-3xl">
                  تخصص‌هایی که برای بیماران شما مهم است
                </h2>
                <p className={`mt-3 text-sm leading-relaxed sm:text-base ${layout.textMuted}`}>
                  هر خدمت با صفحه اختصاصی، توضیح شفاف و مسیر درخواست نوبت معرفی می‌شود.
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {content.services.map((service) => (
                  <article
                    key={service.title}
                    className={`group flex h-full flex-col rounded-3xl border p-6 text-right shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${layout.cardBg} ${layout.cardBorder}`}
                  >
                    <div
                      className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${accent.iconBg}`}
                    >
                      <DynamicIcon name={service.icon} size={22} />
                    </div>
                    <h3 className="text-sm font-extrabold text-navy-900">{service.title}</h3>
                    <p className={`mt-2 flex-1 text-[13px] leading-relaxed ${layout.textMuted}`}>
                      {service.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {content.galleryImages && content.galleryImages.length > 0 ? (
          <section className={`section-py ${layout.sectionAltBg}`}>
            <div className="container-mx container-px">
              <div className="mb-8 text-right">
                <p className={`text-[11px] font-bold tracking-[0.16em] ${accent.text}`}>نمونه کارها</p>
                <h2 className="mt-3 text-2xl font-extrabold text-navy-900 sm:text-3xl">
                  نتایج و فضای مطب
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
                {content.galleryImages.map((img) => (
                  <div
                    key={img.src}
                    className={`group relative aspect-[3/4] overflow-hidden shadow-soft transition-transform duration-300 hover:-translate-y-1 ${isWarm ? "rounded-[1.5rem]" : "rounded-2xl"}`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <DoctorDemoBottomBanner content={content} />
      </main>
    </>
  );
}
