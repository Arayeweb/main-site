export default function AboutOriginGraphic() {
  return (
    <div
      className="relative mx-auto w-full max-w-md rounded-[20px] border border-navy-100 bg-navy-50/40 p-6 sm:p-8"
      aria-hidden="true"
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-navy-100 bg-white p-4">
          <p className="text-[11px] font-bold text-navy-400">ساخت سایت</p>
          <div className="mt-3 space-y-2">
            <div className="h-2.5 rounded-md bg-emerald-100" />
            <div className="h-2.5 w-4/5 rounded-md bg-emerald-50" />
            <div className="h-2.5 w-3/5 rounded-md bg-emerald-50" />
          </div>
          <p className="mt-3 text-[10px] font-semibold text-emerald-600">آسان‌تر شده</p>
        </div>

        <div className="flex items-center justify-center">
          <div className="h-8 w-px bg-navy-200" />
        </div>

        <div className="rounded-2xl border border-dashed border-brand-200 bg-white p-4">
          <p className="text-[11px] font-bold text-navy-400">مسیر جذب مشتری</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {["دیده‌شدن", "تماس", "پیگیری"].map((item) => (
              <div
                key={item}
                className="rounded-lg border border-navy-100 bg-navy-50/60 px-2 py-2 text-center text-[9px] font-medium text-navy-500"
              >
                {item}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] font-semibold text-brand-600">هنوز پراکنده است</p>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-3 -top-3 h-16 w-16 rounded-full bg-brand-100/50 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-navy-100/80 blur-2xl" />
    </div>
  );
}
