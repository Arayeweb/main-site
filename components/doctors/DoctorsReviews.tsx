"use client";

import Image from "next/image";
import SectionHeader from "@/components/home/SectionHeader";
import { getVerifiedDoctorReviews } from "@/lib/doctorsData";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import { IconArrowLeft } from "@/components/icons";

export default function DoctorsReviews() {
  const reviews = getVerifiedDoctorReviews();
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="section-py scroll-mt-24 bg-gradient-to-b from-cyan-50/50 to-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="نظر پزشکان"
          badgeClassName="bg-emerald-50 text-emerald-700"
          title="نظر پزشکانی که سایت‌شان زنده است"
          subtitle="فقط از پزشکانی که سایت‌شان الان آنلاین است."
        />

        <div className="mx-auto grid max-w-4xl gap-6">
          {reviews.map((r) => (
            <figure
              key={r.id}
              className="rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-10"
            >
              <div className="flex flex-wrap items-center gap-4">
                {r.image ? (
                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-navy-50">
                    <Image
                      src={r.image}
                      alt={r.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-lg font-extrabold text-cyan-800">
                    {r.name.slice(0, 1)}
                  </div>
                )}
                <div>
                  <figcaption className="text-lg font-extrabold text-navy-900">{r.name}</figcaption>
                  <p className="mt-0.5 text-sm font-medium text-navy-500">
                    {r.specialty} · {r.city}
                  </p>
                  <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    verified
                  </span>
                </div>
              </div>

              <blockquote className="mt-6 text-base leading-loose text-navy-700 sm:text-lg sm:leading-loose">
                «{r.quote}»
              </blockquote>

              {r.siteUrl ? (
                <a
                  href={r.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackDoctorsEvent("doctors_live_sample_click", { source: "review", review: r.id })
                  }
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-extrabold text-cyan-800 underline-offset-2 hover:underline"
                >
                  مشاهده سایت اجراشده
                  <IconArrowLeft size={14} />
                </a>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
