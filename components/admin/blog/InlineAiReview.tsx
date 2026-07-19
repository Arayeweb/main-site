'use client';

type Props = {
  actionLabel: string;
  original: string;
  suggested: string;
  model: string;
  onPush: () => void;
  onReject: () => void;
};

export function InlineAiReview({ actionLabel, original, suggested, model, onPush, onReject }: Props) {
  return (
    <div className="border border-violet-200 bg-violet-50/80 rounded-xl p-4 space-y-3 shadow-lg" dir="rtl">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-violet-900">پیشنهاد AI — {actionLabel}</span>
        <span className="text-[10px] text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">{model}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-white border border-red-100 rounded-lg p-3">
          <div className="text-[10px] font-medium text-red-500 mb-1">قبل</div>
          <p className="text-slate-700 whitespace-pre-wrap leading-relaxed max-h-40 overflow-auto">{original || '—'}</p>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-3">
          <div className="text-[10px] font-medium text-emerald-600 mb-1">بعد</div>
          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed max-h-40 overflow-auto">{suggested}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPush}
          className="px-4 py-2 text-xs font-medium bg-violet-700 text-white rounded-lg hover:bg-violet-800"
        >
          اعمال (Push)
        </button>
        <button
          type="button"
          onClick={onReject}
          className="px-4 py-2 text-xs border border-slate-300 rounded-lg bg-white hover:bg-slate-50"
        >
          رد
        </button>
      </div>
      <p className="text-[10px] text-slate-500">تا Push نزنید، متن اصلی تغییر نمی‌کند.</p>
    </div>
  );
}
