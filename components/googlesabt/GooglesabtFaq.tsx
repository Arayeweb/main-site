"use client";

import { useState } from "react";
import { googlesabtFaq } from "@/lib/googlesabtData";
import SectionHeader from "@/components/home/SectionHeader";

export default function GooglesabtFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section-py bg-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="سوالات متداول"
          badgeClassName="bg-blue-50 text-[#4285F4]"
          title="پرسش‌های رایج درباره ثبت گوگل و BizCard"
        />
        <div className="mx-auto mt-8 max-w-2xl divide-y divide-navy-100 rounded-2xl border border-navy-100 bg-white">
          {googlesabtFaq.map((item, i) => (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right text-sm font-bold text-navy-800 transition hover:bg-navy-50/50"
                aria-expanded={open === i}
              >
                {item.q}
                <span className="shrink-0 text-[#4285F4]">{open === i ? "−" : "+"}</span>
              </button>
              {open === i ? (
                <p className="px-5 pb-4 text-[13px] leading-relaxed text-navy-500">{item.a}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
