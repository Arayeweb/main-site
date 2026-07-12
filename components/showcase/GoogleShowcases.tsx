import Image from "next/image";

const SHOOPE_LOGO = "/showcase-assets/shoope/logo.jpg";
const EMDAD_AHAN_LOGO = "/showcase-assets/emdadahan/logo.jpg";

function ShoopeBizcardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden bg-white ${compact ? "h-28" : "h-36 sm:h-auto sm:min-h-[140px] sm:w-2/5"}`}
    >
      <div
        className={`relative w-full shrink-0 bg-[#f97316] ${compact ? "h-10" : "h-12 sm:h-14"}`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
      <div className={`relative z-10 -mt-7 flex flex-col items-center px-3 pb-3 ${compact ? "" : "sm:-mt-9 sm:pb-4"}`}>
        <div
          className={`overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] ${compact ? "h-14 w-14" : "h-16 w-16 sm:h-[72px] sm:w-[72px]"}`}
        >
          <Image
            src={SHOOPE_LOGO}
            alt="لوگوی اسموک لاب شوپه"
            width={72}
            height={72}
            className="h-full w-full object-cover"
          />
        </div>
        <p className={`mt-1.5 text-center font-bold text-navy-900 ${compact ? "text-[10px]" : "text-[11px] sm:text-xs"}`}>
          اسموک لاب شوپه
        </p>
        <span
          className={`mt-1 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[#ea580c] ${compact ? "text-[8px]" : "text-[9px]"}`}
        >
          <span className="h-1 w-1 rounded-full bg-[#ea580c]" />
          رستوران باربیکیو تگزاسی
        </span>
      </div>
    </div>
  );
}

export function GoogleShoopeShowcase({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_12px_40px_rgba(16,42,67,0.08)]">
      <div className="flex items-center gap-2 border-b border-navy-50 bg-[#f8f9fa] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-serif font-bold text-[#4285F4] shadow-sm">
          G
        </span>
        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-bold text-navy-900">اسموک لاب شوپه</p>
          <p className="text-[10px] text-navy-500">رستوران باربیکیو تگزاسی</p>
        </div>
        <span className="mr-auto shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          ثبت‌شده
        </span>
      </div>
      <div className={`overflow-hidden ${compact ? "" : "sm:flex"}`}>
        <ShoopeBizcardPreview compact={compact} />
        <div className={`space-y-2 p-4 ${compact ? "" : "sm:w-3/5"}`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-500">۵٫۰</span>
            <span className="text-navy-400">(۱ نظر)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-navy-600">
            منو · تماس · مسیریابی · وب‌سایت
          </p>
          <p className="text-[10px] text-emerald-700">cafeshoope.menew.ir</p>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use GoogleShoopeShowcase */
export const GoogleDentalShowcase = GoogleShoopeShowcase;

function EmdadAhanBizcardPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden bg-white ${compact ? "h-28" : "h-36 sm:h-auto sm:min-h-[140px] sm:w-2/5"}`}
    >
      <div
        className={`relative w-full shrink-0 bg-[#7c1d1d] ${compact ? "h-10" : "h-12 sm:h-14"}`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
        }}
      />
      <div className={`relative z-10 -mt-7 flex flex-col items-center px-3 pb-3 ${compact ? "" : "sm:-mt-9 sm:pb-4"}`}>
        <div
          className={`overflow-hidden rounded-2xl border-4 border-white bg-white shadow-[0_8px_24px_rgba(16,42,67,0.12)] ${compact ? "h-14 w-14" : "h-16 w-16 sm:h-[72px] sm:w-[72px]"}`}
        >
          <Image
            src={EMDAD_AHAN_LOGO}
            alt="لوگوی امداد آهن"
            width={72}
            height={72}
            className="h-full w-full object-cover"
          />
        </div>
        <p className={`mt-1.5 text-center font-bold text-navy-900 ${compact ? "text-[10px]" : "text-[11px] sm:text-xs"}`}>
          امداد آهن
        </p>
        <span
          className={`mt-1 inline-flex max-w-full items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[#7c1d1d] ${compact ? "text-[8px]" : "text-[9px]"}`}
        >
          <span className="h-1 w-1 shrink-0 rounded-full bg-[#7c1d1d]" />
          <span className="truncate">توزیع مقاطع فولادی و ورق</span>
        </span>
      </div>
    </div>
  );
}

export function GoogleEmdadAhanShowcase({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-[0_12px_40px_rgba(16,42,67,0.08)]">
      <div className="flex items-center gap-2 border-b border-navy-50 bg-[#f8f9fa] px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-serif font-bold text-[#4285F4] shadow-sm">
          G
        </span>
        <div className="min-w-0 text-right">
          <p className="truncate text-xs font-bold text-navy-900">امداد آهن</p>
          <p className="text-[10px] text-navy-500">توزیع مقاطع فولادی · تهران</p>
        </div>
        <span className="mr-auto shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
          ثبت‌شده
        </span>
      </div>
      <div className={`overflow-hidden ${compact ? "" : "sm:flex"}`}>
        <EmdadAhanBizcardPreview compact={compact} />
        <div className={`space-y-2 p-4 ${compact ? "" : "sm:w-3/5"}`}>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-amber-500">۵٫۰</span>
            <span className="text-navy-400">(۱ نظر)</span>
          </div>
          <p className="text-[11px] leading-relaxed text-navy-600">
            تماس · واتساپ · مسیریابی · ساعات کاری
          </p>
          <p className="text-[10px] text-emerald-700">araaye.com/b/emdadahan</p>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use GoogleEmdadAhanShowcase */
export const GooglePourdastShowcase = GoogleEmdadAhanShowcase;
/** @deprecated Use GoogleEmdadAhanShowcase */
export const GoogleAshrafivandShowcase = GoogleEmdadAhanShowcase;
