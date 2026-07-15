"use client";

import { useEffect, useRef, useState } from "react";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import { DOCTORS_SLA } from "@/lib/doctorsData";
import { scrollToDoctorsAuditForm } from "@/lib/doctorsScroll";
import { IconClose } from "@/components/icons";

const SESSION_KEY = "doctors_exit_shown";

type TriggerKind = "exit" | "scroll";

export default function DoctorsExitIntent() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<TriggerKind>("exit");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;

    if (isCoarse) {
      const onScroll = () => {
        if (sessionStorage.getItem(SESSION_KEY)) return;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;
        const ratio = window.scrollY / maxScroll;
        if (ratio >= 0.6) {
          sessionStorage.setItem(SESSION_KEY, "1");
          triggerRef.current = "scroll";
          setOpen(true);
          trackDoctorsEvent("scroll_intent_shown", { source: "doctors_scroll_intent" });
          window.removeEventListener("scroll", onScroll);
        }
      };

      const timer = setTimeout(() => {
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
      }, 5000);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("scroll", onScroll);
      };
    }

    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 10) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      triggerRef.current = "exit";
      setOpen(true);
      trackDoctorsEvent("exit_intent_shown", { source: "doctors_exit_intent" });
    };

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", onLeave);
    }, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (!open) return null;

  const handleGoToForm = () => {
    trackDoctorsEvent("doctors_final_cta_click", {
      source: triggerRef.current === "scroll" ? "doctors_scroll_intent" : "doctors_exit_intent",
    });
    setOpen(false);
    scrollToDoctorsAuditForm();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-900/60 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="گزارش رایگان مطب"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 text-center shadow-2xl sm:rounded-3xl sm:p-8">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 transition-colors hover:bg-navy-50"
          aria-label="بستن"
        >
          <IconClose size={18} />
        </button>

        <h3 className="text-lg font-extrabold text-sky-700">گزارش رایگان مسیر جذب بیمار</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          قبل از رفتن، نام مطب و شماره واتساپ را وارد کنید تا مشکل اصلی و سه اقدام اولویت‌دار را
          دریافت کنید.
        </p>
        <button
          type="button"
          onClick={handleGoToForm}
          className="mt-5 w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98]"
        >
          گزارش رایگان مطبم را بگیرم
        </button>
        <p className="mt-4 text-[11px] text-navy-400">{DOCTORS_SLA}</p>
      </div>
    </div>
  );
}
