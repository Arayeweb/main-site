"use client";

import { ExternalLink } from "lucide-react";
import { MODARES_PROJECT_PROOF, MODARES_TRUST_POINTS } from "@/lib/modaresData";
import { modaresAnalyticsBase, trackModaresEvent } from "@/lib/modaresAnalytics";
import type { ModaresVariant } from "@/lib/modaresData";

type ModaresTrustProps = {
  variant: ModaresVariant;
};

export default function ModaresTrust({ variant }: ModaresTrustProps) {
  const handleProjectClick = () => {
    trackModaresEvent("teachers_real_project_click", {
      ...modaresAnalyticsBase(variant),
      project: MODARES_PROJECT_PROOF.name,
      href: MODARES_PROJECT_PROOF.href,
    });
  };

  return (
    <section className="border-t border-navy-100 bg-white py-10 sm:py-12">
      <div className="container-mx container-px">
        <h2 className="text-center text-lg font-extrabold text-navy-900 sm:text-xl">
          پروژه‌تان را به یک تیم واقعی می‌سپارید
        </h2>

        <ul className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2 sm:mt-6">
          {MODARES_TRUST_POINTS.map((point) => (
            <li
              key={point}
              className="rounded-full border border-navy-100 bg-navy-50/40 px-3 py-1.5 text-[11px] font-semibold text-navy-600 sm:text-xs"
            >
              {point}
            </li>
          ))}
        </ul>

        <article className="mx-auto mt-6 max-w-md rounded-xl border border-navy-100 bg-navy-50/30 p-4 sm:p-5">
          <p className="text-[10px] font-bold text-navy-400 sm:text-xs">
            {MODARES_PROJECT_PROOF.label}
          </p>
          <h3 className="mt-1 text-sm font-extrabold text-navy-900 sm:text-base">
            {MODARES_PROJECT_PROOF.name}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-navy-500 sm:text-[13px]">
            {MODARES_PROJECT_PROOF.description}
          </p>
          <a
            href={MODARES_PROJECT_PROOF.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleProjectClick}
            className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-800 sm:text-sm"
          >
            مشاهده نمونه پروژه
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </article>
      </div>
    </section>
  );
}
