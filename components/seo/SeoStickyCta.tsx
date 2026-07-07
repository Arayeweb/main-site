"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";

export default function SeoStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/90 p-3 pl-20 shadow-2xl backdrop-blur sm:hidden">
      <div className="flex items-center gap-3">
        <div className="flex-1 text-right">
          <div className="text-[13px] font-extrabold text-navy-900">سئو برای لید و مشتری</div>
          <div className="text-[11px] text-navy-400">مشاوره رایگان + پیشنهاد قیمت</div>
        </div>
        <a
          href="#lead-form"
          onClick={() => pushGtmEvent("cta_click", { location: "seo_sticky_mobile", page: "seo" })}
          className="rounded-xl bg-teal-600 px-5 py-2.5 text-[13px] font-bold text-white transition-all active:scale-[0.98]"
        >
          دریافت مشاوره رایگان
        </a>
      </div>
    </div>
  );
}
