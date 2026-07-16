"use client";

import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import { DOCTORS_WA_ORDER_MESSAGE } from "@/lib/doctorsData";
import { siteWhatsAppUrl } from "@/lib/siteContact";

type DoctorsWhatsAppCtaProps = {
  source: string;
  message?: string;
  specialty?: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
};

export default function DoctorsWhatsAppCta({
  source,
  message = DOCTORS_WA_ORDER_MESSAGE,
  specialty,
  children,
  className = "inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]",
  fullWidth,
}: DoctorsWhatsAppCtaProps) {
  return (
    <a
      href={siteWhatsAppUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        trackDoctorsEvent("doctors_wa_click", {
          source,
          ...(specialty ? { specialty } : {}),
        })
      }
      className={`${className}${fullWidth ? " w-full" : ""}`}
    >
      {children}
    </a>
  );
}
