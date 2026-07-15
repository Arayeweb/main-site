import { BookOpen, MessageCircle, Play } from "lucide-react";
import type { ModaresDemoTab } from "@/lib/modaresData";

type ModaresDemoPreviewProps = {
  tab: ModaresDemoTab;
};

export default function ModaresDemoPreview({ tab }: ModaresDemoPreviewProps) {
  const { accent } = tab;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-card"
      aria-label={`نمونه نمایشی سایت ${tab.name}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-navy-50 bg-navy-50/40 px-3 py-2 sm:px-4">
        <span className="text-[10px] font-bold text-navy-400 sm:text-xs">نمونه نمایشی</span>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-navy-200" />
          <span className="h-2 w-2 rounded-full bg-navy-200" />
          <span className="h-2 w-2 rounded-full bg-navy-200" />
        </div>
      </div>

      <div className="border-b border-navy-50 px-3 py-2.5 sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <nav className="hidden items-center gap-3 text-[10px] font-semibold text-navy-500 sm:flex">
            <span>درباره من</span>
            <span>کلاس‌ها</span>
            <span>مقالات</span>
          </nav>
          <span
            className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white ${accent.cta}`}
          >
            {tab.ctaLabel}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-extrabold sm:h-14 sm:w-14 ${accent.avatar}`}
            aria-hidden="true"
          >
            {tab.initials}
          </div>
          <div className="min-w-0 text-right">
            <h3 className="text-sm font-extrabold text-navy-900 sm:text-base">{tab.name}</h3>
            <p className={`mt-0.5 text-[11px] font-semibold sm:text-xs ${accent.role}`}>
              {tab.role}
            </p>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-500 sm:text-[11px]">
              {tab.specialties}
            </p>
          </div>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-navy-600 sm:text-xs">{tab.intro}</p>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <article className={`rounded-xl border p-3 ${accent.classBg}`}>
            <p className={`text-[10px] font-bold ${accent.tag}`}>{tab.classCard.tag}</p>
            <h4 className="mt-1 text-xs font-extrabold text-navy-900">{tab.classCard.title}</h4>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-500">{tab.classCard.detail}</p>
            <p className="mt-2 text-[11px] font-bold text-navy-800">{tab.classCard.price}</p>
          </article>

          <article className="rounded-xl border border-navy-100 bg-navy-50/20 p-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy-400">
              <Play size={12} aria-hidden="true" />
              نمونه تدریس
            </div>
            <h4 className="mt-1 text-xs font-extrabold leading-snug text-navy-900">
              {tab.sampleTeaching.title}
            </h4>
            <p className="mt-1 text-[10px] leading-relaxed text-navy-500">
              {tab.sampleTeaching.detail}
            </p>
          </article>
        </div>

        <article className="mt-2.5 rounded-xl border border-navy-100 bg-white p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-navy-400">
            <BookOpen size={12} aria-hidden="true" />
            مقاله
          </div>
          <h4 className="mt-1 text-xs font-extrabold leading-snug text-navy-900">
            {tab.article.title}
          </h4>
          <p className="mt-1 text-[10px] leading-relaxed text-navy-500">{tab.article.detail}</p>
        </article>

        <div
          className={`mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${accent.footer}`}
        >
          <span className="text-[10px] font-semibold text-navy-600 sm:text-[11px]">
            همین حالا درخواست کلاس بدهید
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white ${accent.cta}`}
          >
            <MessageCircle size={12} aria-hidden="true" />
            واتساپ
          </span>
        </div>
      </div>
    </div>
  );
}
