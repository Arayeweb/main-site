"use client";

import { pushGtmEvent } from "@/lib/gtm";

export default function BizcardStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,.08)] backdrop-blur-sm sm:hidden">
      <div className="container-mx flex items-center justify-between gap-3">
        <p className="text-[11px] font-bold leading-snug text-navy-600">کارت ویزیت رایگان</p>
        <a
          href="#builder"
          onClick={() => pushGtmEvent("cta_click", { location: "bizcard_sticky", page: "bizcard" })}
          className="shrink-0 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white"
        >
          ساخت کارت
        </a>
      </div>
    </div>
  );
}
