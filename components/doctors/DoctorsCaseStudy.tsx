"use client";

import Image from "next/image";
import SectionHeader from "@/components/home/SectionHeader";
import { BrowserChrome } from "@/components/showcase/ShowcaseFrames";
import { IconArrowLeft, IconCheck } from "@/components/icons";
import { getVerifiedDoctorProjects } from "@/lib/doctorsData";
import { trackDoctorExampleClick } from "@/lib/doctorsAnalytics";

function ProjectPreview({
  name,
  siteUrl,
  desktopImage,
}: {
  name: string;
  siteUrl: string;
  desktopImage?: string;
}) {
  const host = siteUrl.replace(/^https?:\/\//, "");

  if (desktopImage) {
    return (
      <BrowserChrome url={host}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={desktopImage}
            alt={`نمای دسکتاپ سایت ${name}`}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 480px"
          />
        </div>
      </BrowserChrome>
    );
  }

  return null;
}

export default function DoctorsCaseStudy() {
  const projects = getVerifiedDoctorProjects();
  if (projects.length === 0) return null;

  return (
    <section id="case-study" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="اثبات واقعی"
          badgeClassName="bg-emerald-50 text-emerald-700"
          title="پروژه اجراشده — قابل مشاهده، بدون آمار ساختگی"
          subtitle="نمونه واقعی را زود ببینید؛ هر پروژه تأییدشده جدید از همین فهرست اضافه می‌شود."
        />

        <div className="mx-auto grid max-w-5xl gap-8">
          {projects.map((c) => (
            <article
              key={c.id}
              className="overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft"
            >
              <div className="border-b border-navy-50 bg-gradient-to-l from-cyan-50 to-white px-6 py-5 sm:px-8">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    پروژه واقعی و قابل مشاهده
                  </span>
                  <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-bold text-cyan-800">
                    {c.specialty}
                  </span>
                  <span className="inline-flex rounded-full bg-navy-50 px-3 py-1 text-[11px] font-bold text-navy-600">
                    {c.city}
                  </span>
                </div>
                <h3 className="mt-3 text-xl font-extrabold text-navy-900 sm:text-2xl">{c.name}</h3>
              </div>

              <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-2">
                <ProjectPreview
                  name={c.name}
                  siteUrl={c.siteUrl}
                  desktopImage={c.desktopImage}
                />

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-navy-400">مشکل قبلی</h4>
                    <p className="mt-2 text-sm leading-relaxed text-navy-600">{c.problem}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-400">کار انجام‌شده</h4>
                    <ul className="mt-2 space-y-2">
                      {c.work.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-navy-600">
                          <IconCheck size={15} className="mt-0.5 shrink-0 text-cyan-700" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-navy-400">مدت اجرا</h4>
                    <p className="mt-2 text-sm text-navy-600">{c.duration}</p>
                  </div>
                  <a
                    href={c.siteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackDoctorExampleClick("executed", {
                        source: "case_study",
                        project: c.id,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-cyan-800"
                  >
                    مشاهده سایت زنده
                    <IconArrowLeft size={14} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
