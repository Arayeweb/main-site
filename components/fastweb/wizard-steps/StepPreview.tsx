"use client";

import { CheckCircle2, Eye, LockKeyhole, Sparkles } from "lucide-react";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import type { FastWebBrief, FastWebPreviewContent } from "@/lib/fastweb";
import { getFastWebCategory } from "@/lib/fastwebCategories";

interface StepPreviewProps {
  brief: FastWebBrief;
  preview: FastWebPreviewContent;
  slugHint: string;
}

export default function StepPreview({
  brief,
  preview,
  slugHint,
}: StepPreviewProps) {
  const category = getFastWebCategory(preview.categoryKey);
  const personalizedItems = [
    brief.businessName ? `نام ${brief.businessName}` : null,
    category?.label,
    brief.city ? `بازار ${brief.city}` : null,
    brief.offerings ? "خدمات واقعی شما" : "خدمات پیشنهادی",
    brief.brandColor ? "رنگ برند" : null,
  ].filter(Boolean) as string[];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl bg-[#0b2f38] px-5 py-6 text-white shadow-xl sm:px-8 sm:py-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold text-teal-200">
              <Sparkles className="h-4 w-4" />
              دموی اختصاصی شما آماده است
            </p>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              {brief.businessName}، این می‌تواند سایت شما باشد.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              این فقط یک قالب رنگ‌شده نیست؛ متن، ساختار، مسیر اقدام و تصاویر بر
              اساس نوع کسب‌وکار و اطلاعات شما چیده شده‌اند.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold backdrop-blur">
            <Eye className="h-4 w-4 text-teal-200" />
            پیش‌نمایش زنده
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {personalizedItems.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-white/80"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-300" />
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_90px_-35px_rgba(15,23,42,.35)]">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex gap-1.5" dir="ltr" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
          <div
            className="flex min-w-0 max-w-xl flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500 shadow-sm"
            dir="ltr"
          >
            <LockKeyhole className="h-3 w-3 shrink-0 text-emerald-600" />
            <span className="truncate">{slugHint}</span>
          </div>
          <span className="hidden text-[10px] font-medium text-slate-400 sm:block">
            نسخهٔ دسکتاپ
          </span>
        </div>
        <FastWebSiteView content={preview} brief={brief} mode="preview" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <p className="text-sm font-bold text-emerald-950">
          تصاویر، متن و جزئیات نهایی قبل از انتشار با اطلاعات شما کنترل می‌شوند.
        </p>
        <p className="text-xs text-emerald-800">
          با انتخاب «این طرح را می‌خواهم» آدرس سایت را ثبت می‌کنید.
        </p>
      </div>
    </section>
  );
}
