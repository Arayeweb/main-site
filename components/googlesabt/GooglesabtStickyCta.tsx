"use client";

import { pushGtmEvent } from "@/lib/gtm";
import { formatToman, googlesabtPackages } from "@/lib/googlesabtData";

const fromPrice = Math.min(...googlesabtPackages.map((p) => p.price));

export default function GooglesabtStickyCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,.08)] backdrop-blur-sm sm:hidden">
      <div className="container-mx flex items-center gap-3">
        <p className="min-w-0 flex-1 text-[11px] font-bold leading-snug text-navy-600">
          از <span className="text-[#4285F4]">{formatToman(fromPrice)}</span> — بدون پرداخت آنلاین
        </p>
        <a
          href="#packages"
          onClick={() =>
            pushGtmEvent("cta_click", { location: "googlesabt_sticky", page: "googlesabt" })
          }
          className="shrink-0 rounded-xl bg-[#4285F4] px-5 py-2.5 text-xs font-bold text-white"
        >
          ثبت درخواست
        </a>
      </div>
    </div>
  );
}
