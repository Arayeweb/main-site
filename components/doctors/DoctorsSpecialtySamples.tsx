"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import DoctorDemoPreviewFrames from "@/components/doctors/demo/DoctorDemoPreviewFrames";
import {
  DOCTORS_SPECIALTY_EVENT,
  doctorSpecialtyOptions,
  doctorSpecialtySamples,
  type DoctorSpecialtySample,
} from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";

function SampleCard({
  sample,
  buyReason,
  specialtyLabel,
}: {
  sample: DoctorSpecialtySample;
  buyReason: string;
  specialtyLabel: string;
}) {
  const kindLabel = sample.kind === "executed" ? "پروژه اجراشده" : "دموی پیشنهادی";

  return (
    <article className="flex flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-soft">
      <div className="border-b border-navy-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-navy-900">{specialtyLabel}</h3>
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              sample.kind === "executed"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-cyan-50 text-cyan-800"
            }`}
          >
            {kindLabel}
          </span>
        </div>
        <p className="mt-2 text-[13px] font-semibold leading-relaxed text-navy-600">{buyReason}</p>
      </div>

      <div className="p-4">
        <DoctorDemoPreviewFrames sample={sample} />
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-navy-50 p-4 sm:flex-row">
        <Link
          href={sample.demoUrl}
          target={sample.demoExternal ? "_blank" : undefined}
          rel={sample.demoExternal ? "noopener noreferrer" : undefined}
          onClick={() =>
            trackDoctorsEvent(
              sample.kind === "executed" ? "doctors_live_sample_click" : "doctors_demo_click",
              { source: "specialty_samples", specialty: sample.key }
            )
          }
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-navy-200 px-4 py-2.5 text-[13px] font-bold text-navy-700 hover:bg-navy-50"
        >
          {sample.kind === "executed" ? "مشاهده سایت زنده" : "مشاهده دمو"}
        </Link>
        <a
          href="#quote-form"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(DOCTORS_SPECIALTY_EVENT, {
                detail: {
                  key: sample.key,
                  label: specialtyLabel,
                  sampleKey: sample.key,
                },
              })
            );
            trackDoctorsEvent("doctors_hero_cta_click", {
              source: "specialty_want_this",
              specialty: sample.key,
            });
          }}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-cyan-700 px-4 py-2.5 text-[13px] font-extrabold text-white hover:bg-cyan-800"
        >
          این سایت را برای مطبم می‌خواهم
        </a>
      </div>
    </article>
  );
}

type DoctorsSpecialtySamplesProps = {
  filterKeys?: string[];
};

export default function DoctorsSpecialtySamples({ filterKeys }: DoctorsSpecialtySamplesProps) {
  const options = filterKeys
    ? doctorSpecialtyOptions.filter(
        (o) => filterKeys.includes(o.sampleKey) || filterKeys.includes(o.key)
      )
    : doctorSpecialtyOptions;

  const [selectedKey, setSelectedKey] = useState(options[0]?.key ?? "dentist");

  useEffect(() => {
    if (!options.some((o) => o.key === selectedKey) && options[0]) {
      setSelectedKey(options[0].key);
    }
  }, [options, selectedKey]);

  const selectedOption = options.find((o) => o.key === selectedKey) ?? options[0];
  const sample =
    doctorSpecialtySamples.find((s) => s.key === selectedOption?.sampleKey) ??
    doctorSpecialtySamples[0];

  const selectSpecialty = (key: string, label: string, sampleKey: string) => {
    setSelectedKey(key);
    trackDoctorsEvent("doctors_specialty_select", {
      specialty: key,
      specialty_label: label,
      demo_key: sampleKey,
    });
    window.dispatchEvent(
      new CustomEvent(DOCTORS_SPECIALTY_EVENT, { detail: { key, label, sampleKey } })
    );
  };

  return (
    <section id="samples" className="section-py scroll-mt-24 bg-navy-50/30">
      <div className="container-mx container-px">
        <SectionHeader
          badge="تخصص‌ها"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="سایتی متناسب با تخصص شما، نه یک قالب پزشکی تکراری"
          subtitle="تخصص را انتخاب کنید؛ دلیل خرید و دموی مرتبط را ببینید."
        />

        <div className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0">
          <div
            className="flex w-max min-w-full gap-2 pb-1 sm:flex-wrap sm:justify-center"
            role="tablist"
            aria-label="انتخاب تخصص"
          >
            {options.map((option) => {
              const active = option.key === selectedKey;
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => selectSpecialty(option.key, option.label, option.sampleKey)}
                  className={`shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${
                    active
                      ? "bg-cyan-700 text-white shadow-soft"
                      : "bg-white text-navy-600 ring-1 ring-navy-100 hover:bg-navy-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          {sample && selectedOption ? (
            <SampleCard
              sample={sample}
              buyReason={selectedOption.buyReason}
              specialtyLabel={selectedOption.label}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
