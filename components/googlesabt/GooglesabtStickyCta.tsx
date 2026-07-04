"use client";

import { pushGtmEvent } from "@/lib/gtm";

export default function GooglesabtStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,.08)] backdrop-blur-sm sm:hidden">
      <div className="container-mx flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold leading-snug text-navy-600">
          <span className="text-[#EA4335]">۵۰٪ تخفیف</span> ثبت گوگل
        </p>
        <a
          href="#packages"
          onClick={() => pushGtmEvent("cta_click", { location: "googlesabt_sticky", page: "googlesabt" })}
          className="shrink-0 rounded-xl bg-[#4285F4] px-4 py-2.5 text-xs font-bold text-white"
        >
          مشاهده پکیج‌ها
        </a>
      </div>
    </div>
  );
}
