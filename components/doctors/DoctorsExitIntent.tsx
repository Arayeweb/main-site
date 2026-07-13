"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { IconClose } from "@/components/icons";

const SESSION_KEY = "doctors_exit_shown";

type TriggerKind = "exit" | "scroll";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

export default function DoctorsExitIntent() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
          pushGtmEvent("scroll_intent_shown", { page: "doctors" });
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
      pushGtmEvent("exit_intent_shown", { page: "doctors" });
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

  const leadSource =
    triggerRef.current === "scroll" ? "doctors_scroll_intent" : "doctors_exit_intent";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      const digits = phone.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: leadSource,
          page: "/doctors",
          contact: digits,
          goal: "clinic_audit",
          plan: "free_report",
          channel: "doctors_landing",
          consent: true,
          referrer: document.referrer || null,
          company: "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setError("ثبت ناموفق بود. دوباره تلاش کنید.");
        return;
      }
      pushGtmEvent("generate_lead", { source: leadSource, goal: "clinic_audit", page: "doctors" });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
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

        {success ? (
          <>
            <h3 className="text-lg font-extrabold text-sky-700">ثبت شد</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              سه ایراد مهم و پیشنهادهای عملی را تا پایان روز کاری در واتساپ می‌فرستیم.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold text-sky-700">گزارش رایگان مسیر جذب بیمار</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              قبل از رفتن، وضعیت حضور مطب در گوگل و مسیر نوبت را برایتان بررسی می‌کنیم.
            </p>
            <form onSubmit={handleSubmit} className="mt-5 flex gap-2" noValidate>
              <input
                type="tel"
                inputMode="numeric"
                dir="ltr"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                className="w-full flex-1 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-center text-sm outline-none transition focus:border-sky-400 focus:bg-white"
                aria-label="شماره موبایل"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 disabled:opacity-60"
              >
                {loading ? "..." : "بفرست"}
              </button>
            </form>
            {error ? (
              <p className="mt-2 text-xs font-bold text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <p className="mt-4 text-[11px] text-navy-400">تا پایان روز کاری در واتساپ</p>
          </>
        )}
      </div>
    </div>
  );
}
