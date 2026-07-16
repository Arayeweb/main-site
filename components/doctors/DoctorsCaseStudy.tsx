"use client";

import Image from "next/image";
import { doctorCaseStudy } from "@/lib/doctorsData";
import SectionHeader from "@/components/home/SectionHeader";
import { BrowserChrome, PhoneFrame } from "@/components/showcase/ShowcaseFrames";
import { IconArrowLeft, IconCheck } from "@/components/icons";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

export default function DoctorsCaseStudy() {
  const c = doctorCaseStudy;
  const problem = c.problem || c.initialState || "";

  return (
    <section id="case-study" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="پرونده واقعی"
          badgeClassName="bg-sky-50 text-sky-700"
          title="یک نمونه اجراشده، با لینک قابل‌مشاهده"
          subtitle="بدون ادعای عددی تأییدنشده."
        />

        <article className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft">
          <div className="border-b border-navy-50 bg-gradient-to-l from-sky-50 to-white px-6 py-5 sm:px-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold text-sky-700">
                {c.specialty}
              </span>
              <span className="inline-flex rounded-full bg-navy-50 px-3 py-1 text-[11px] font-bold text-navy-600">
                {c.city}
              </span>
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-navy-900 sm:text-xl">{c.title}</h3>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
            <div className="space-y-4">
              <PhoneFrame>
                <div className="relative aspect-[9/14] overflow-hidden">
                  {c.mobileImage ? (
                    <Image
                      src={c.mobileImage}
                      alt={`نمای موبایل ${c.title}`}
                      fill
                      className="object-cover"
                      sizes="280px"
                    />
                  ) : null}
                </div>
              </PhoneFrame>
              <BrowserChrome url={c.siteUrl?.replace(/^https?:\/\//, "") ?? "site.ir"}>
                <div className="relative aspect-[16/10] overflow-hidden">
                  {c.desktopImage ? (
                    <Image
                      src={c.desktopImage}
                      alt={`نمای دسکتاپ ${c.title}`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                  ) : null}
                </div>
              </BrowserChrome>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-navy-400">مشکل قبلی</h4>
                <p className="mt-2 text-sm leading-relaxed text-navy-600">{problem}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy-400">محدوده کار آرایه</h4>
                <ul className="mt-2 space-y-2">
                  {c.work.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                      <IconCheck size={15} className="mt-0.5 shrink-0 text-sky-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-navy-400">مدت اجرا</h4>
                <p className="mt-2 text-sm text-navy-600">{c.duration}</p>
              </div>

              <div className="rounded-2xl bg-sky-50/80 px-4 py-4">
                <h4 className="text-xs font-bold text-sky-700">خروجی قابل‌مشاهده</h4>
                <p className="mt-2 text-sm leading-relaxed text-navy-700">{c.outcome}</p>
              </div>

              {c.siteUrl ? (
                <a
                  href={c.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackDoctorsEvent("doctors_case_study_click", { source: "case_study" })}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
                >
                  مشاهده سایت زنده
                  <IconArrowLeft size={14} />
                </a>
              ) : null}

              {c.quote ? (
                <figure className="border-r-4 border-sky-500 pr-4">
                  <blockquote className="text-sm leading-loose text-navy-600">«{c.quote}»</blockquote>
                  {c.quoteRole ? (
                    <figcaption className="mt-2 text-xs text-navy-400">{c.quoteRole}</figcaption>
                  ) : null}
                </figure>
              ) : null}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
