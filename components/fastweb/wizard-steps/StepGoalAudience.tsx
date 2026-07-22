"use client";

import {
  FASTWEB_AUDIENCE_PRESETS,
  FASTWEB_GOALS,
  FASTWEB_SECTIONS,
  suggestedSectionsForGoal,
  type FastWebAudiencePresetId,
  type FastWebBrief,
  type FastWebSectionId,
} from "@/lib/fastweb";
import Field from "./Field";

interface StepGoalAudienceProps {
  brief: FastWebBrief;
  onPatch: (patch: Partial<FastWebBrief>) => void;
}

function toggleInList<T extends string>(list: T[] | undefined, id: T): T[] {
  const set = new Set(list || []);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  return Array.from(set);
}

function toggleSection(
  sections: FastWebSectionId[] | undefined,
  id: FastWebSectionId
): FastWebSectionId[] {
  const sec = FASTWEB_SECTIONS.find((s) => s.id === id);
  if (sec && "required" in sec && sec.required) {
    return sections?.length ? [...sections] : ["hero", "contact"];
  }
  const next = toggleInList(sections || [], id);
  if (!next.includes("hero")) next.unshift("hero");
  if (!next.includes("contact")) next.push("contact");
  return next.slice(0, 12) as FastWebSectionId[];
}

function mergeGoalSections(
  current: FastWebSectionId[] | undefined,
  suggested: FastWebSectionId[]
): FastWebSectionId[] {
  const optional = Array.from(new Set([...(current || []), ...suggested])).filter(
    (id) => id !== "hero" && id !== "contact"
  );
  return ["hero", ...optional.slice(0, 10), "contact"];
}

export default function StepGoalAudience({ brief, onPatch }: StepGoalAudienceProps) {
  const audiencePresets = (brief.audiencePresets || []) as FastWebAudiencePresetId[];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">از سایت چه نتیجه‌ای می‌خواهید؟</h1>
        <p className="mt-2 text-sm text-slate-600">
          مهم‌ترین هدف سایتتان را انتخاب کنید تا بخش‌های مناسب برایتان آماده شود.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {FASTWEB_GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() =>
              onPatch({
                goal: g.id,
                sections: mergeGoalSections(
                  brief.sections,
                  suggestedSectionsForGoal(g.id)
                ),
              })
            }
            className={`rounded-xl border px-4 py-4 text-right transition ${
              brief.goal === g.id
                ? "border-[#0F4C5C] bg-teal-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="font-medium">{g.label}</span>
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium">مخاطبان اصلی سایت چه کسانی هستند؟</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FASTWEB_AUDIENCE_PRESETS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() =>
                onPatch({
                  audiencePresets: toggleInList(audiencePresets, a.id),
                })
              }
              className={`rounded-full border px-4 py-2 text-sm transition ${
                audiencePresets.includes(a.id)
                  ? "border-[#0F4C5C] bg-teal-50 text-[#0F4C5C]"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <div className="mt-3">
          <Field
            label=""
            value={brief.audience || ""}
            onChange={(v) => onPatch({ audience: v })}
            placeholder="یا پاسخ دلخواه بنویسید..."
          />
        </div>
      </div>

      <details className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-slate-700">
          <span>تنظیم بخش‌های سایت</span>
          <span className="text-xs font-normal text-slate-500 group-open:hidden">
            {brief.sections?.length || 0} بخش متناسب انتخاب شده
          </span>
          <span className="hidden text-xs font-normal text-[#0F4C5C] group-open:block">بستن تنظیمات</span>
        </summary>
        <p className="mt-3 text-xs leading-6 text-slate-500">
          بهترین ساختار برای دسته و هدف شما از قبل انتخاب شده است. فقط در صورت
          نیاز می‌توانید بخش‌ها را تغییر دهید.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {FASTWEB_SECTIONS.map((s) => {
            const isRequired = "required" in s && Boolean(s.required);
            const selected = (brief.sections || []).includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                disabled={isRequired}
                onClick={() =>
                  onPatch({
                    sections: toggleSection(brief.sections, s.id),
                  })
                }
                className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-70 ${
                  selected
                    ? "border-[#0F4C5C] bg-teal-50 text-[#0F4C5C]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {s.label}
                {isRequired ? " *" : ""}
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
}
