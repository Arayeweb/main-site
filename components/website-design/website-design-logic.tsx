"use client";

import { useCallback, useRef, useState } from "react";
import MedisaHomePreview from "@/components/home/previews/MedisaHomePreview";

const ACCENT = "#3157F6";

const QUESTIONS = [
  {
    id: "intro",
    number: 1,
    text: "این کسب‌وکار چه کاری انجام می‌دهد؟",
    marker: "معرفی",
  },
  {
    id: "services",
    number: 2,
    text: "کدام خدمت برای من مناسب است؟",
    marker: "خدمات",
  },
  {
    id: "trust",
    number: 3,
    text: "چرا باید به آن اعتماد کنم؟",
    marker: "اعتماد",
  },
  {
    id: "contact",
    number: 4,
    text: "چطور تماس بگیرم، رزرو کنم یا سفارش بدهم؟",
    marker: "تماس",
  },
] as const;

type ZoneId = (typeof QUESTIONS)[number]["id"];

/** Highlight regions aligned to MedisaHomePreview layout */
const ZONES: Record<
  ZoneId,
  { top: string; height: string; dotTop: string; dotInline: string }
> = {
  intro: { top: "0%", height: "38%", dotTop: "14%", dotInline: "12%" },
  services: { top: "52%", height: "14%", dotTop: "58%", dotInline: "50%" },
  trust: { top: "38%", height: "18%", dotTop: "46%", dotInline: "72%" },
  contact: { top: "66%", height: "28%", dotTop: "76%", dotInline: "28%" },
};

export default function WebsiteDesignLogic() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneId>("intro");
  const [hoverZone, setHoverZone] = useState<ZoneId | null>(null);
  const activeZone = hoverZone ?? selectedZone;

  const selectZone = useCallback((id: ZoneId) => {
    setSelectedZone(id);
    setHoverZone(null);
    previewRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="container-mx container-px">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="text-right">
            <span
              className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold"
              style={{ backgroundColor: "#EEF2FF", color: ACCENT }}
            >
              روش طراحی آرایه
            </span>

            <h2 className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-navy-900 sm:text-3xl lg:text-[2rem]">
              سایت را بر اساس مسیر تصمیم مشتری می‌سازیم
            </h2>

            <p className="mt-4 max-w-xl text-[15px] leading-[1.85] text-navy-500 sm:text-base">
              کسی که وارد سایت می‌شود باید خیلی سریع پاسخ چهار سؤال را پیدا کند.
            </p>

            <ol className="mt-8 space-y-0 border-t border-[#E8EDFF]">
              {QUESTIONS.map((item) => {
                const active = activeZone === item.id;
                return (
                  <li key={item.id} className="border-b border-[#E8EDFF]">
                    <button
                      type="button"
                      className="group flex w-full items-start gap-4 py-4 text-right transition-colors sm:py-5"
                      onClick={() => selectZone(item.id)}
                      onMouseEnter={() => setHoverZone(item.id)}
                      onMouseLeave={() => setHoverZone(null)}
                      onFocus={() => setHoverZone(item.id)}
                      onBlur={() => setHoverZone(null)}
                      aria-pressed={selectedZone === item.id}
                    >
                      <span
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums transition-colors"
                        style={
                          active
                            ? { backgroundColor: ACCENT, color: "#fff" }
                            : { backgroundColor: "#EEF2FF", color: ACCENT }
                        }
                      >
                        {item.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block text-[15px] font-bold leading-relaxed transition-colors sm:text-base"
                          style={{ color: active ? ACCENT : "#102a43" }}
                        >
                          {item.text}
                        </span>
                        <span className="mt-1 block text-[12px] font-semibold text-navy-400">
                          {item.marker}
                        </span>
                      </span>
                      <span
                        className="mt-2 hidden h-full w-px shrink-0 bg-[#D9E4FF] transition-all group-hover:bg-[#3157F6] sm:block"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div ref={previewRef}>
            <div className="relative overflow-hidden rounded-[12px] border border-[#E8EDFF] bg-white shadow-soft">
              <div className="relative [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
                <MedisaHomePreview />

                {QUESTIONS.map((item) => {
                  const zone = ZONES[item.id];
                  const active = activeZone === item.id;
                  return (
                    <div key={item.id}>
                      <div
                        className="pointer-events-none absolute inset-x-0 transition-all duration-200 motion-reduce:transition-none"
                        style={{
                          top: zone.top,
                          height: zone.height,
                          backgroundColor: active ? "rgba(49, 87, 246, 0.12)" : "transparent",
                          boxShadow: active ? "inset 0 0 0 2px rgba(49, 87, 246, 0.55)" : "none",
                        }}
                        aria-hidden="true"
                      />
                      <div
                        className="pointer-events-none absolute z-10 flex items-center gap-1.5 transition-opacity duration-200 motion-reduce:transition-none"
                        style={{
                          top: zone.dotTop,
                          insetInlineStart: zone.dotInline,
                          opacity: active ? 1 : 0.72,
                        }}
                        aria-hidden="true"
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold text-white shadow-sm"
                          style={{ backgroundColor: active ? ACCENT : "#627d98" }}
                        >
                          {item.number}
                        </span>
                        <span
                          className="rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-sm"
                          style={{ backgroundColor: active ? ACCENT : "rgba(16, 42, 67, 0.72)" }}
                        >
                          {item.marker}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-4 text-center text-sm font-semibold leading-relaxed text-navy-600 sm:text-[15px]">
              هر بخش سایت باید یک کار مشخص انجام دهد.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
