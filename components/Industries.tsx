"use client";

import { useState } from "react";
import { industries } from "@/lib/homeData";
import { DynamicIcon, IconCheck } from "./icons";
import SectionHeader from "./home/SectionHeader";

export default function Industries() {
  const [active, setActive] = useState(0);
  const current = industries[active];

  return (
    <section id="industries" className="section-py">
      <div className="container-mx container-px">
        <SectionHeader
          badge="صنایع"
          title="برای چه کسب‌وکارهایی مناسب است؟"
          subtitle="هر صنعتی چالش‌های خاص خودش را دارد؛ ما راهکار متناسب با آن می‌سازیم."
        />

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {industries.map((ind, index) => (
            <button
              key={ind.title}
              type="button"
              onClick={() => setActive(index)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                active === index
                  ? "border-navy-900 bg-navy-900 text-white shadow-soft"
                  : "border-navy-200 bg-white text-navy-600 hover:border-navy-300 hover:bg-navy-50"
              }`}
            >
              {ind.title}
            </button>
          ))}
        </div>

        <div className="grid gap-8 rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8 lg:grid-cols-[auto_1fr] lg:items-start">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-900 text-white">
            <DynamicIcon name={current.icon} size={30} />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-navy-900">{current.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-500 sm:text-base">
              {current.description}
            </p>
            <ul className="mt-5 space-y-2.5">
              {current.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-navy-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <IconCheck size={12} strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            {current.relatedProject ? (
              <p className="mt-5 text-xs font-medium text-brand-600">
                نمونه مرتبط: {current.relatedProject}
              </p>
            ) : null}

            {current.title === "پزشکان و کلینیک‌ها" ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/seo/doctor"
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  سئو سایت پزشکان
                </a>
                <a
                  href="/website/doctor"
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  طراحی سایت پزشک
                </a>
                <a
                  href="/seo/clinic"
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  سئو کلینیک
                </a>
                <a
                  href="/website/clinic"
                  className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-4 py-2 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
                >
                  طراحی سایت کلینیک
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
