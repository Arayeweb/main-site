"use client";

import { Check } from "lucide-react";
import { getModaresOffer, MODARES_PAYMENT_TERMS, type ModaresVariant } from "@/lib/modaresData";
import { scrollToModaresForm } from "@/lib/modaresScroll";
import { modaresAnalyticsBase, trackModaresEvent } from "@/lib/modaresAnalytics";

type ModaresOfferProps = {
  variant: ModaresVariant;
};

export default function ModaresOffer({ variant }: ModaresOfferProps) {
  const offer = getModaresOffer(variant);

  return (
    <section className="border-t border-navy-100 bg-navy-50/40 py-10 sm:py-12">
      <div className="container-mx container-px">
        <h2 className="text-center text-lg font-extrabold text-navy-900 sm:text-xl">
          {offer.heading}
        </h2>

        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-navy-100 bg-white p-5 shadow-soft sm:mt-8 sm:p-6">
          <p className="text-sm font-bold text-navy-700">{offer.title}</p>
          <p className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-[1.75rem]">
            {offer.price}
          </p>
          <p className="mt-2 text-xs text-navy-500 sm:text-sm">{offer.delivery}</p>

          <ul className="mt-5 space-y-2 border-t border-navy-50 pt-5">
            {offer.deliverables.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs leading-relaxed text-navy-600 sm:text-[13px]"
              >
                <Check
                  size={14}
                  className="mt-0.5 shrink-0 text-cyan-600"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>

          {offer.clarification && (
            <p className="mt-4 rounded-lg bg-navy-50/60 px-3 py-2.5 text-[11px] leading-relaxed text-navy-500 sm:text-xs">
              {offer.clarification}
            </p>
          )}

          <p className="mt-4 text-center text-[11px] font-medium text-navy-500 sm:text-xs">
            {MODARES_PAYMENT_TERMS}
          </p>

          <button
            type="button"
            onClick={() => {
              trackModaresEvent("teachers_offer_cta_click", modaresAnalyticsBase(variant));
              scrollToModaresForm();
            }}
            className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-700 active:scale-[0.98]"
          >
            {offer.cta}
          </button>
        </div>

        {offer.alternatives && offer.alternatives.length > 0 && (
          <p className="mx-auto mt-4 max-w-lg text-center text-[11px] leading-relaxed text-navy-400 sm:text-xs">
            {offer.alternatives.join(" · ")}
          </p>
        )}
      </div>
    </section>
  );
}
