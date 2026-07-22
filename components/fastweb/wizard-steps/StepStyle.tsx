"use client";

import { Check, Palette } from "lucide-react";
import { FASTWEB_STYLES, type FastWebBrief, type FastWebStyleId } from "@/lib/fastweb";
import { getFastWebCategory } from "@/lib/fastwebCategories";
import Field from "./Field";

interface StepStyleProps {
  brief: FastWebBrief;
  onPatch: (patch: Partial<FastWebBrief>) => void;
}

export default function StepStyle({ brief, onPatch }: StepStyleProps) {
  const category = getFastWebCategory(brief.categoryKey);
  const recommendedStyle: FastWebStyleId =
    category?.recommendedStyle || "modern";
  const palettes =
    category?.key === "beauty-salon"
      ? ["#A6416F", "#8D5A6B", "#B66B56", "#533747"]
      : category?.key === "gym-fitness"
        ? ["#1A5C3E", "#D34E24", "#172121", "#2B59C3"]
        : category?.key === "restaurant-cafe"
          ? ["#8B3A3A", "#9A5B31", "#315C4A", "#252422"]
          : category?.core === "professional"
            ? ["#1E3A5F", "#2C3E50", "#315C57", "#5C4A2E"]
            : ["#0F4C5C", "#1F3B4D", "#B8542F", "#315C4A"];

  return (
    <section className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-bold text-[#0F4C5C]">هویت بصری دمو</p>
        <h1 className="text-2xl font-bold">دوست دارید برندتان چه حسی بدهد؟</h1>
        <p className="mt-2 text-sm text-slate-600">
          یک سبک ظاهری برای سایت انتخاب کنید؛ رنگ برند را هم می‌توانید تنظیم کنید.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {FASTWEB_STYLES.map((s, index) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPatch({ style: s.id as FastWebStyleId })}
            className={`group relative overflow-hidden rounded-2xl border p-3 text-right transition ${
              brief.style === s.id
                ? "border-[#0F4C5C] bg-teal-50 ring-2 ring-[#0F4C5C]/15"
                : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            }`}
          >
            <div
              className={`relative mb-4 h-28 overflow-hidden ${
                s.id === "formal" ? "rounded-sm" : s.id === "warm" ? "rounded-2xl" : "rounded-xl"
              }`}
              style={{
                background:
                  index === 0
                    ? "linear-gradient(135deg,#172a3a,#9f8b65)"
                    : index === 1
                      ? "linear-gradient(135deg,#0f4c5c,#b8dee1)"
                      : "linear-gradient(135deg,#934b62,#f1c8b6)",
              }}
            >
              <span className="absolute right-4 top-4 h-2 w-16 rounded-full bg-white/85" />
              <span className="absolute right-4 top-8 h-1.5 w-24 rounded-full bg-white/35" />
              <span className="absolute bottom-4 left-4 h-10 w-16 rounded-lg border border-white/30 bg-white/15" />
              <span className="absolute bottom-4 right-4 h-5 w-12 rounded-full bg-white/90" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{s.label}</p>
              {brief.style === s.id ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F4C5C] text-white">
                  <Check className="h-3 w-3" />
                </span>
              ) : null}
            </div>
            {recommendedStyle === s.id ? (
              <p className="mt-1 text-[10px] font-bold text-[#0F4C5C]">پیشنهاد ما برای {category?.label}</p>
            ) : null}
            <p className="mt-1 text-xs leading-6 text-slate-500">{s.hint}</p>
          </button>
        ))}
      </div>

      <label className="block text-sm">
        <span className="flex items-center gap-2 font-medium"><Palette className="h-4 w-4 text-[#0F4C5C]" /> رنگ اصلی برند</span>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {palettes.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onPatch({ brandColor: color })}
              className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-sm ring-1 ${
                brief.brandColor === color ? "ring-2 ring-[#0F4C5C] ring-offset-2" : "ring-slate-200"
              }`}
              style={{ background: color }}
              aria-label={`انتخاب رنگ ${color}`}
            >
              {brief.brandColor === color ? <Check className="h-4 w-4 text-white" /> : null}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="color"
            value={brief.brandColor || "#0F4C5C"}
            onChange={(e) => onPatch({ brandColor: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded-xl border border-slate-200"
          />
          <input
            value={brief.brandColor || "#0F4C5C"}
            onChange={(e) => onPatch({ brandColor: e.target.value })}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </label>

      <Field
        label="لینک لوگو (اختیاری)"
        value={brief.logoUrl || ""}
        onChange={(v) => onPatch({ logoUrl: v })}
        placeholder="https://..."
      />
      <Field
        label="نمونه سایت موردعلاقه (اختیاری)"
        value={brief.favoriteSites || ""}
        onChange={(v) => onPatch({ favoriteSites: v })}
        placeholder="آدرس یک یا دو سایت"
      />
    </section>
  );
}
