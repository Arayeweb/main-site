"use client";

import { FASTWEB_STYLES, type FastWebBrief, type FastWebStyleId } from "@/lib/fastweb";
import Field from "./Field";

interface StepStyleProps {
  brief: FastWebBrief;
  onPatch: (patch: Partial<FastWebBrief>) => void;
}

export default function StepStyle({ brief, onPatch }: StepStyleProps) {
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">سبک طراحی را انتخاب کنید</h1>
        <p className="mt-2 text-sm text-slate-600">
          یک سبک ظاهری برای سایت انتخاب کنید؛ رنگ برند را هم می‌توانید تنظیم کنید.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {FASTWEB_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onPatch({ style: s.id as FastWebStyleId })}
            className={`rounded-xl border p-4 text-right transition ${
              brief.style === s.id
                ? "border-[#0F4C5C] bg-teal-50 ring-1 ring-[#0F4C5C]/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="font-semibold">{s.label}</p>
            <p className="mt-1 text-xs text-slate-500 leading-6">{s.hint}</p>
          </button>
        ))}
      </div>

      <label className="block text-sm">
        <span className="font-medium">رنگ برند</span>
        <div className="mt-2 flex items-center gap-3">
          <input
            type="color"
            value={brief.brandColor || "#0F4C5C"}
            onChange={(e) => onPatch({ brandColor: e.target.value })}
            className="h-10 w-14 cursor-pointer rounded border border-slate-200"
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
