"use client";

import { useEffect, useRef, useState } from "react";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
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
        if (window.scrollY / maxScroll >= 0.6) {
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

  const source =
    triggerRef.current === "scroll" ? "doctors_scroll_intent" : "doctors_exit_intent";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-navy-900/60 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="شروع پروژه با ۶ میلیون"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 text-center shadow-2xl sm:rounded-3xl sm:p-8">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-navy-400 hover:bg-navy-50"
          aria-label="بستن"
        >
          <IconClose size={18} />
        </button>

        <h3 className="text-lg font-extrabold text-cyan-800">شروع با ۶ میلیون — قبل از رفتن</h3>
        <p className="mt-2 text-sm leading-relaxed text-navy-500">
          نسخه اولیه در ۲ روز. پرداخت دوم فقط بعد از تأیید نسخه. مالکیت دامنه و سایت برای پزشک.
        </p>
        <a
          href="#quote-form"
          onClick={() => {
            setOpen(false);
            trackDoctorsEvent("doctors_hero_cta_click", { source });
          }}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
        >
          شروع پروژه با ۶ میلیون
        </a>
      </div>
    </div>
  );
}
