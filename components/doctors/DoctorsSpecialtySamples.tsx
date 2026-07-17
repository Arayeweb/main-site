"use client";

import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import DoctorsWhatsAppCta from "@/components/doctors/DoctorsWhatsAppCta";
import DoctorDemoPreviewFrames from "@/components/doctors/demo/DoctorDemoPreviewFrames";
import {
  buildDoctorsWaSpecialtyMessage,
  doctorSpecialtySamples,
  type DoctorSpecialtySample,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import { IconArrowLeft } from "@/components/icons";

function SpecialtyCard({ sample }: { sample: DoctorSpecialtySample }) {
  const kindLabel = sample.kind === "executed" ? "پروژه اجراشده" : "دموی پیشنهادی";
  const demoHref = sample.demoUrl;

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft">
      <div className="border-b border-navy-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-navy-900">{sample.label}</h3>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              sample.kind === "executed"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-sky-50 text-sky-700"
            }`}
          >
            {kindLabel}
          </span>
        </div>
      </div>

      <div className="p-4">
        <DoctorDemoPreviewFrames sample={sample} />
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-navy-50 p-4 sm:flex-row">
        <Link
          href={demoHref}
          target={sample.demoExternal ? "_blank" : undefined}
          rel={sample.demoExternal ? "noopener noreferrer" : undefined}
          onClick={() =>
            trackDoctorsEvent("doctors_sample_demo_click", {
              source: "specialty_samples",
              specialty: sample.key,
              demo_key: sample.key,
            })
          }
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-navy-200 px-4 py-2.5 text-[13px] font-bold text-navy-700 transition-colors hover:bg-navy-50"
        >
          مشاهده دمو
          <IconArrowLeft size={13} />
        </Link>
        <DoctorsWhatsAppCta
          source="specialty_sample"
          specialty={sample.key}
          message={buildDoctorsWaSpecialtyMessage(sample.label)}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-sky-600 px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
        >
          این مدل را برای مطب من می‌خواهم
        </DoctorsWhatsAppCta>
      </div>
    </article>
  );
}

type DoctorsSpecialtySamplesProps = {
  filterKeys?: string[];
};

export default function DoctorsSpecialtySamples({ filterKeys }: DoctorsSpecialtySamplesProps) {
  const samples = filterKeys
    ? doctorSpecialtySamples.filter((s) => filterKeys.includes(s.key))
    : doctorSpecialtySamples;

  return (
    <section id="samples" className="section-py scroll-mt-24">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نمونه‌ها"
          badgeClassName="bg-sky-50 text-sky-700"
          title="قبل از خرید، خروجی نزدیک به تخصصتان را ببینید"
          subtitle="هر نمونه با برچسب «دموی پیشنهادی» یا «پروژه اجراشده» مشخص شده است."
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {samples.map((sample) => (
            <SpecialtyCard key={sample.key} sample={sample} />
          ))}
        </div>
      </div>
    </section>
  );
}
