"use client";

import { useEffect, useState } from "react";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import { DOCTORS_WA_ORDER_MESSAGE } from "@/lib/doctorsData";
import { SITE_PHONE_TEL, siteWhatsAppUrl } from "@/lib/siteContact";
import { IconPhone } from "@/components/icons";

export default function DoctorsStickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 p-3 shadow-2xl backdrop-blur sm:hidden">
      <div className="flex items-center gap-2">
        <a
          href="#quote-form"
          onClick={() => trackDoctorsEvent("doctors_hero_cta_click", { source: "sticky_mobile" })}
          className="flex-1 rounded-xl bg-cyan-700 px-3 py-2.5 text-center text-[12px] font-extrabold text-white active:scale-[0.98]"
        >
          شروع پروژه — پیش‌پرداخت ۶ میلیون
        </a>
        <a
          href={siteWhatsAppUrl(DOCTORS_WA_ORDER_MESSAGE)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackDoctorsEvent("doctors_whatsapp_click", { source: "sticky_mobile" })}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-[11px] font-extrabold text-white"
          aria-label="واتساپ"
        >
          WA
        </a>
        <a
          href={SITE_PHONE_TEL}
          onClick={() => trackDoctorsEvent("doctors_phone_click", { source: "sticky_mobile" })}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-navy-200 text-navy-700"
          aria-label="تماس"
        >
          <IconPhone size={18} />
        </a>
      </div>
    </div>
  );
}
