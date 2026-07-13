"use client";

import { Loader2, Sparkles } from "lucide-react";
import type { FastWebBrief } from "@/lib/fastweb";

interface StepDomainProps {
  brief: FastWebBrief;
  slugHint: string;
  slugStatus: "idle" | "checking" | "ok" | "taken" | "invalid";
  suggestedSlugs: string[];
  suggesting: boolean;
  onPatch: (patch: Partial<FastWebBrief>) => void;
  onSuggest: () => void;
}

export default function StepDomain({
  brief,
  slugHint,
  slugStatus,
  suggestedSlugs,
  suggesting,
  onPatch,
  onSuggest,
}: StepDomainProps) {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">آدرس سایت‌تان را انتخاب کنید</h1>
        <p className="mt-2 text-sm text-slate-600">
          یک نام برای زیردامنه انتخاب کنید (حداقل ۵ حرف، فقط حروف لاتین و عدد).
          برای شروع مجبور نیستید دامنه بخرید؛ سایت روی{" "}
          <span dir="ltr" className="font-mono text-xs">
            *.araaye.site
          </span>{" "}
          تحویل می‌شود.
        </p>
      </div>

      <label className="block text-sm">
        <span className="font-medium">آدرس سایت</span>
        <div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-[#0F4C5C]">
          <input
            value={brief.slugPreference || ""}
            onChange={(e) =>
              onPatch({
                slugPreference: e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, ""),
              })
            }
            placeholder="myshop"
            dir="ltr"
            className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
          />
          <span
            dir="ltr"
            className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
          >
            .araaye.site
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          پیش‌نمایش:{" "}
          <span dir="ltr" className="font-mono">
            {slugHint}
          </span>
        </p>
        {slugStatus === "checking" ? (
          <p className="mt-1 text-xs text-slate-500">در حال بررسی...</p>
        ) : null}
        {slugStatus === "ok" ? (
          <p className="mt-1 text-xs text-emerald-700">این آدرس در دسترس است.</p>
        ) : null}
        {slugStatus === "taken" ? (
          <p className="mt-1 text-xs text-red-600">این آدرس قبلاً گرفته شده.</p>
        ) : null}
        {slugStatus === "invalid" ? (
          <p className="mt-1 text-xs text-red-600">فرمت نامک معتبر نیست.</p>
        ) : null}
      </label>

      <button
        type="button"
        onClick={onSuggest}
        disabled={suggesting || !brief.businessName?.trim()}
        className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-4 py-2 text-sm font-medium text-[#0F4C5C] disabled:opacity-50"
      >
        {suggesting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        پیشنهاد نام با هوش مصنوعی
      </button>

      {suggestedSlugs.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {suggestedSlugs.map((slug) => (
            <button
              key={slug}
              type="button"
              onClick={() => onPatch({ slugPreference: slug })}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-[#0F4C5C] hover:bg-teal-50"
              dir="ltr"
            >
              {slug}.araaye.site
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
