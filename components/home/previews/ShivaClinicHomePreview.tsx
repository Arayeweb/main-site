import Image from "next/image";
import { shivaImages } from "@/lib/showcaseSites/shiva/config";

const CREDENTIALS = [
  "ارزیابی شنوایی بزرگسالان و کودکان",
  "مشاوره و تجویز سمعک متناسب با نیاز",
  "تنظیم، سرویس و پیگیری دوره‌ای",
] as const;

export default function ShivaClinicHomePreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9e8e6] bg-white shadow-[0_12px_40px_rgba(16,42,67,0.07)]">
      <div className="flex items-center justify-between gap-3 border-b border-[#e8f1f0] bg-white px-4 py-2.5 sm:px-5">
        <div className="text-right">
          <p className="text-sm font-extrabold text-[#0d5c52]">کلینیک شنوایی شیوا</p>
          <p className="text-[10px] font-semibold text-[#5a8a84]">ارزیابی شنوایی و سمعک</p>
        </div>
        <nav className="hidden items-center gap-3 text-[10px] font-semibold text-[#4a6f6a] sm:flex">
          <span>خدمات</span>
          <span>درباره ما</span>
          <span>تماس</span>
        </nav>
        <span className="shrink-0 rounded-lg bg-[#0d6b5c] px-2.5 py-1.5 text-[10px] font-bold text-white">
          رزرو نوبت
        </span>
      </div>

      <div className="grid items-center gap-4 p-4 sm:grid-cols-[1.05fr_0.95fr] sm:gap-5 sm:p-5">
        <div className="text-right">
          <span className="inline-block h-0.5 w-8 rounded-full bg-[#c8784a]" aria-hidden="true" />
          <h3 className="mt-2 text-base font-extrabold leading-snug text-[#1a3348] sm:text-lg">
            کلینیک شنوایی شیوا
          </h3>
          <p className="mt-2 text-[11px] leading-relaxed text-[#5a6f82] sm:text-xs">
            ارزیابی شنوایی، مشاوره تخصصی و انتخاب سمعک؛ با توضیحات روشن و مسیر نوبت
            ساده برای بیماران و خانواده‌ها.
          </p>
          <ul className="mt-3 space-y-1.5">
            {CREDENTIALS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-[10px] leading-relaxed text-[#3d5563] sm:text-[11px]"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#0d6b5c]"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-lg border border-[#0d6b5c]/30 px-2.5 py-1.5 text-[10px] font-bold text-[#0d6b5c]">
              مشاهده خدمات
            </span>
            <span className="rounded-lg bg-[#0d6b5c] px-2.5 py-1.5 text-[10px] font-bold text-white">
              دریافت وقت مشاوره
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[220px] sm:max-w-none">
          <div
            className="pointer-events-none absolute -left-3 top-2 h-16 w-16 rounded-full bg-[#d4ebe8]/80 blur-sm"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-2 bottom-0 h-20 w-20 rounded-full bg-[#f3e8df]/90 blur-sm"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-xl border border-[#d9e8e6] shadow-md">
            <Image
              src={shivaImages.hero}
              alt="فضای کلینیک شنوایی شیوا"
              width={400}
              height={300}
              className="aspect-[4/3] w-full object-cover"
              sizes="(max-width: 640px) 220px, 280px"
            />
            <div className="absolute bottom-2 right-2 left-2 rounded-lg bg-white/95 px-2.5 py-2 shadow-sm backdrop-blur-sm">
              <p className="text-[9px] font-bold text-[#0d6b5c]">ارزیابی audiometry</p>
              <p className="text-[8px] text-[#5a6f82]">نوبت همان هفته</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
