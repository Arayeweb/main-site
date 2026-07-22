"use client";

import { Check } from "lucide-react";
import {
  defaultSectionsForCategory,
  getAllFastWebCategories,
  pickCategoryKey,
} from "@/lib/fastwebCategories";
import { getFastWebCategoryIcon } from "@/components/fastweb/fastwebCategoryIcons";
import type { FastWebBrief, FastWebCategoryKey } from "@/lib/fastweb";

interface StepCategoryProps {
  brief: FastWebBrief;
  onPatch: (patch: Partial<FastWebBrief>) => void;
}

export default function StepCategory({ brief, onPatch }: StepCategoryProps) {
  const categories = getAllFastWebCategories();
  const suggested = pickCategoryKey({ ...brief, categoryKey: undefined });
  const selected = brief.categoryKey || suggested;

  function select(key: FastWebCategoryKey) {
    onPatch({ categoryKey: key, sections: defaultSectionsForCategory(key) });
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">نوع کسب‌وکار شما کدام است؟</h1>
        <p className="mt-2 text-sm text-slate-600 leading-7">
          بر اساس توضیحی که دادید، یک گزینه پیشنهاد شده؛ می‌توانید همان را تأیید
          کنید یا گزینه دقیق‌تری انتخاب کنید. این انتخاب ساختار و بخش‌های سایت
          شما را مشخص می‌کند.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => {
          const Icon = getFastWebCategoryIcon(category.icon);
          const isSelected = selected === category.key;
          const isSuggested = !brief.categoryKey && suggested === category.key;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => select(category.key)}
              className={`relative rounded-xl border p-4 text-right transition ${
                isSelected
                  ? "border-[#0F4C5C] bg-teal-50 ring-1 ring-[#0F4C5C]/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {isSelected ? (
                <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#0F4C5C] text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isSelected ? "bg-[#0F4C5C] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <div>
                  <p className="font-semibold">{category.label}</p>
                  {isSuggested ? (
                    <p className="mt-0.5 text-[11px] font-medium text-[#0F4C5C]">
                      پیشنهاد بر اساس توضیح شما
                    </p>
                  ) : null}
                </div>
              </div>
              <p className="mt-2.5 text-xs leading-6 text-slate-500">
                {category.description}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {category.targetMarket.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
