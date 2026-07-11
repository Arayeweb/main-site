import { PhoneFrame } from "./ShowcaseFrames";

type IronProps = { full?: boolean };

export function IronShowcase({ full = false }: IronProps) {
  const screen = (
    <div className="bg-[#1a2332] text-right">
      <div className="bg-gradient-to-b from-[#2d3a4f] to-[#1a2332] px-4 pb-5 pt-6">
        <p className="text-[9px] font-bold tracking-wide text-amber-400">AdReady · کمپین فروش</p>
        <h1 className="mt-2 text-base font-extrabold leading-snug text-white">
          استعلام قیمت آهن‌آلات
        </h1>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-300">
          میلگرد، تیرآهن و ورق — پاسخ سریع کارشناس فروش
        </p>
        <div className="mt-4 flex gap-2">
          <span className="rounded-md bg-amber-500 px-2 py-1 text-[9px] font-bold text-navy-900">
            تحویل امروز
          </span>
          <span className="rounded-md border border-white/20 px-2 py-1 text-[9px] font-semibold text-white">
            قیمت روز بازار
          </span>
        </div>
      </div>

      <div className="space-y-2 px-4 pb-4">
        {[
          { label: "نوع محصول", value: "میلگرد A3" },
          { label: "مقدار تقریبی", value: "۵ تن" },
          { label: "شماره تماس", value: "09xx xxx xxxx" },
        ].map((field) => (
          <div key={field.label} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[8px] text-slate-400">{field.label}</p>
            <p className="text-[11px] font-semibold text-white">{field.value}</p>
          </div>
        ))}
        <button
          type="button"
          className="w-full rounded-lg bg-amber-500 py-2.5 text-[11px] font-extrabold text-navy-900"
        >
          ارسال درخواست استعلام
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-white/10 px-4 py-3">
        <span className="rounded-lg bg-white/10 py-2 text-center text-[10px] font-bold text-white">
          تماس فوری
        </span>
        <span className="rounded-lg bg-emerald-600/90 py-2 text-center text-[10px] font-bold text-white">
          واتساپ
        </span>
      </div>

      {full ? (
        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-[10px] font-bold text-slate-400">درخواست‌های اخیر</p>
          {["کارخانه ساختمانی آریا", "شرکت بتن رضایی"].map((name) => (
            <div
              key={name}
              className="mt-2 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
            >
              <span className="text-[10px] text-white">{name}</span>
              <span className="text-[9px] font-bold text-amber-400">جدید</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (full) {
    return (
      <div className="mx-auto max-w-sm">
        <PhoneFrame>{screen}</PhoneFrame>
      </div>
    );
  }

  return <PhoneFrame>{screen}</PhoneFrame>;
}

export function IronShowcasePreview({ compact }: { compact?: boolean }) {
  void compact;
  return (
    <div className="flex justify-center py-2">
      <IronShowcase />
    </div>
  );
}
