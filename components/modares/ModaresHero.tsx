"use client";

import ModaresLeadForm from "@/components/modares/ModaresLeadForm";
import ModaresTeacherPreview from "@/components/modares/ModaresTeacherPreview";
import {
  getModaresContent,
  MODARES_DELIVERY,
  MODARES_TRUST_CHIPS,
  type ModaresVariant,
} from "@/lib/modaresData";

type ModaresHeroProps = {
  variant: ModaresVariant;
};

export default function ModaresHero({ variant }: ModaresHeroProps) {
  const content = getModaresContent(variant);

  return (
    <section className="bg-navy-50/50 pb-8 pt-4 sm:pb-16 sm:pt-10">
      <div className="container-mx container-px">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-14">
          <div className="min-w-0">
            <span className="badge mb-2 bg-white text-navy-600 ring-1 ring-navy-100 sm:mb-4">
              {content.eyebrow}
            </span>

            <h1 className="text-balance text-[1.375rem] font-extrabold leading-[1.3] text-navy-900 sm:text-3xl sm:leading-[1.35] lg:text-[2rem]">
              {content.h1}
            </h1>

            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-navy-500 sm:mt-4 sm:text-base">
              {content.supportingCopy}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-4">
              <p className="text-[13px] font-bold text-navy-800 sm:text-base">{content.price}</p>
              {content.priceOriginal ? (
                <span className="text-xs font-semibold text-navy-400 line-through sm:text-sm">
                  {content.priceOriginal}
                </span>
              ) : null}
              {content.discountPercent ? (
                <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700 ring-1 ring-cyan-100">
                  {content.discountPercent}٪ تخفیف
                </span>
              ) : null}
            </div>

            <p className="mt-1.5 hidden text-xs text-navy-400 sm:block sm:text-sm">
              {MODARES_DELIVERY}
            </p>

            <ModaresLeadForm
              variant={variant}
              anchorId="modares-lead-form"
              fieldId="modares-field"
              phoneId="modares-phone"
              source="modares_hero"
              className="mt-3 sm:mt-6"
            />

            <div className="mt-4 hidden flex-wrap gap-2 sm:flex">
              {MODARES_TRUST_CHIPS.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-navy-100 bg-white px-3 py-1.5 text-[11px] font-semibold text-navy-600"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="hidden lg:sticky lg:top-24 lg:block">
            <ModaresTeacherPreview />
          </div>
        </div>

        <p className="mt-4 text-xs text-navy-400 sm:hidden">{MODARES_DELIVERY}</p>

        <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
          {MODARES_TRUST_CHIPS.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-navy-100 bg-white px-2.5 py-1 text-[10px] font-semibold text-navy-600"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
