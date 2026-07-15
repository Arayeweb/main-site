import { BookOpen, MessageCircle } from "lucide-react";

export default function ModaresTeacherPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card"
      aria-label="نمونه نمایشی سایت مدرس"
    >
      <div className="flex items-center justify-between gap-2 border-b border-navy-50 bg-navy-50/40 px-3 py-2 sm:px-4">
        <span className="text-[10px] font-bold text-navy-400 sm:text-xs">نمونه نمایشی</span>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-navy-200" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-navy-200" aria-hidden="true" />
          <span className="h-2 w-2 rounded-full bg-navy-200" aria-hidden="true" />
        </div>
      </div>

      <div className="border-b border-navy-50 px-3 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <nav className="hidden items-center gap-3 text-[10px] font-semibold text-navy-500 sm:flex">
            <span>درباره من</span>
            <span>کلاس‌ها</span>
            <span>مقالات</span>
          </nav>
          <span className="rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
            درخواست کلاس
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-extrabold text-cyan-700 sm:h-14 sm:w-14"
            aria-hidden="true"
          >
            س‌ن
          </div>
          <div className="min-w-0 text-right">
            <h3 className="text-sm font-extrabold text-navy-900 sm:text-base">سارا نادری</h3>
            <p className="mt-0.5 text-[11px] font-semibold text-cyan-700 sm:text-xs">
              مدرس زبان انگلیسی
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-500 sm:text-[11px]">
              آیلتس، مکالمه و کلاس خصوصی
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <article className="rounded-xl border border-navy-100 bg-navy-50/30 p-3">
            <p className="text-[10px] font-bold text-cyan-700">کلاس خصوصی</p>
            <h4 className="mt-1 text-xs font-extrabold text-navy-900">مکالمه پیشرفته</h4>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-500">
              ۸ جلسه آنلاین · سطح B2 و بالاتر
            </p>
            <p className="mt-2 text-[11px] font-bold text-navy-800">۲.۵ میلیون تومان</p>
          </article>

          <article className="rounded-xl border border-navy-100 bg-white p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy-400">
              <BookOpen size={12} aria-hidden="true" />
              مقاله
            </div>
            <h4 className="mt-1 text-xs font-extrabold leading-snug text-navy-900">
              ۵ اشتباه رایج در آیلتس Speaking
            </h4>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-500">
              راهنمای عملی برای افزایش نمره بخش گفتاری
            </p>
          </article>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-cyan-100 bg-cyan-50/50 px-3 py-2.5">
          <span className="text-[10px] font-semibold text-navy-600 sm:text-[11px]">
            همین حالا درخواست کلاس بدهید
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
            <MessageCircle size={12} aria-hidden="true" />
            واتساپ
          </span>
        </div>
      </div>
    </div>
  );
}
