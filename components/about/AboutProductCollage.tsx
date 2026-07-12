import type { ReactNode } from "react";

function MiniBrowser({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-navy-50 bg-navy-50/50 px-2 py-1">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
        <span className="mr-auto truncate text-[8px] text-navy-400">{title}</span>
      </div>
      <div className="p-2.5">{children}</div>
    </div>
  );
}

export default function AboutProductCollage() {
  return (
    <div className="relative grid grid-cols-2 gap-3 sm:gap-4" aria-hidden="true">
      <div className="col-span-2 -rotate-1">
        <MiniBrowser title="araaye.com/ai">
          <p className="text-[9px] font-bold text-navy-800">هوش مصنوعی آرایه</p>
          <div className="mt-2 space-y-1.5">
            <div className="rounded-md bg-navy-50 px-2 py-1.5 text-[8px] text-navy-400">
              پرسش خود را بنویسید...
            </div>
            <div className="flex gap-1">
              {["متن", "تصویر", "کد"].map((t) => (
                <span
                  key={t}
                  className="rounded bg-brand-50 px-1.5 py-0.5 text-[7px] font-semibold text-brand-600"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </MiniBrowser>
      </div>

      <div className="rotate-1 translate-y-2">
        <MiniBrowser title="clinic-arya.com">
          <p className="text-[9px] font-bold text-navy-800">طراحی سایت</p>
          <div className="mt-1.5 h-8 rounded-md bg-navy-100/70" />
          <div className="mt-1.5 rounded-md bg-navy-900 py-1 text-center text-[7px] font-bold text-white">
            درخواست مشاوره
          </div>
        </MiniBrowser>
      </div>

      <div className="-rotate-1 -translate-y-1">
        <MiniBrowser title="گوگل — جست‌وجو">
          <p className="text-[9px] font-bold text-[#1a0dab]">خدمات کلینیک آریا</p>
          <p className="text-[7px] text-emerald-700">clinic-arya.com</p>
          <p className="mt-1 text-[7px] text-navy-400">SEO آرایه</p>
        </MiniBrowser>
      </div>

      <div className="col-span-2 rotate-[0.5deg]">
        <div className="rounded-xl border border-navy-100 bg-white p-2.5 shadow-sm">
          <p className="text-[9px] font-bold text-navy-800">درخواست‌های مشتری</p>
          <ul className="mt-2 space-y-1">
            {["مریم — جدید", "علی — پیگیری"].map((row) => (
              <li
                key={row}
                className="flex items-center justify-between rounded-md bg-navy-50/60 px-2 py-1 text-[8px] text-navy-600"
              >
                <span>{row}</span>
                <span className="text-brand-600">AdReady</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
