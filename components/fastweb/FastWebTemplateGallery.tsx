"use client";

import { useState } from "react";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import { getFastWebCategoryIcon } from "@/components/fastweb/fastwebCategoryIcons";
import { getAllFastWebCategories } from "@/lib/fastwebCategories";
import { TEMPLATE_META } from "@/lib/fastwebTemplates";
import { FASTWEB_TEMPLATE_SHOWCASE } from "@/lib/fastwebTemplateShowcase";
import type { FastWebCategoryKey } from "@/lib/fastweb";

export default function FastWebTemplateGallery() {
  const categories = getAllFastWebCategories();
  const [active, setActive] = useState<FastWebCategoryKey>(categories[0].key);

  const showcase = FASTWEB_TEMPLATE_SHOWCASE[active];
  const activeCategory = categories.find((c) => c.key === active)!;
  const core = TEMPLATE_META[activeCategory.core];

  return (
    <div className="min-h-screen bg-[#F4F7F8]" dir="rtl">
      <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
        <h1 className="text-lg font-bold text-slate-900">
          گالری داخلی ۱۰ دسته FastWeb
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          این صفحه فقط برای بازبینی تیم است (index نمی‌شود). هر کارت یک دسته
          فروش را با محتوای نمونه نشان می‌دهد؛ همان کامپوننتی که در سایت واقعی
          مشتری رندر می‌شود.
        </p>
      </header>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-0 lg:flex-row">
        {/* Sidebar: category list */}
        <nav className="shrink-0 border-b border-slate-200 bg-white lg:w-72 lg:border-b-0 lg:border-l">
          <ul className="flex gap-2 overflow-x-auto p-3 lg:flex-col lg:overflow-visible lg:p-4">
            {categories.map((category) => {
              const Icon = getFastWebCategoryIcon(category.icon);
              const isActive = active === category.key;
              return (
                <li key={category.key} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(category.key)}
                    className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-right text-sm transition lg:whitespace-normal ${
                      isActive
                        ? "bg-[#0F4C5C] text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                        isActive ? "bg-white/20" : "bg-slate-100"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium">{category.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main: preview */}
        <main className="flex-1 p-4 sm:p-8">
          <div className="mb-5">
            <p className="text-xs font-medium text-[#0F4C5C]">
              {core.label} · {activeCategory.pitch}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {activeCategory.label}
            </h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeCategory.targetMarket.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {showcase.content.sections.map((s) => (
              <span
                key={s}
                className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600"
              >
                {s}
              </span>
            ))}
          </div>

          <div className="mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <FastWebSiteView
              content={showcase.content}
              brief={showcase.brief}
              mode="preview"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
