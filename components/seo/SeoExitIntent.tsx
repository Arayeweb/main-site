"use client";

import { useEffect, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { IconClose } from "@/components/icons";

const SESSION_KEY = "seo_exit_shown";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

export default function SeoExitIntent() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // فقط دسکتاپ — روی موبایل mouseleave معنا ندارد
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const onLeave = (e: MouseEvent) => {
      if (e.clientY > 10) return;
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setOpen(true);
      pushGtmEvent("exit_intent_shown", { page: "seo" });
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
          source: "seo_exit_intent",
          page: "/seo",
          contact: digits,
          goal: "seo_audit_free",
          plan: "free_audit",
          channel: "seo_landing",
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
      pushGtmEvent("generate_lead", { source: "seo_exit_intent", goal: "seo_audit_free", page: "seo" });
      setSuccess(true);
    } catch {
      setError("خطا در ارتباط. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-navy-900/60 p-5 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="بررسی رایگان سئو"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
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
            <h3 className="text-lg font-extrabold text-teal-700">ثبت شد ✓</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              گزارش بررسی رایگان سئوی سایتت تا ۲۴ ساعت آینده آماده می‌شود.
            </p>
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold text-teal-700">صبر کن! یک هدیه داری 🎁</h3>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              قبل از رفتن، <b className="text-navy-800">بررسی رایگان سئوی محلی</b> سایتت را بگیر —
              گزارش کامل مشکلات و فرصت‌ها، بدون هیچ تعهدی.
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
                className="w-full flex-1 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-center text-sm outline-none transition focus:border-teal-400 focus:bg-white"
                aria-label="شماره موبایل"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-teal-700 disabled:opacity-60"
              >
                {loading ? "..." : "بگیر"}
              </button>
            </form>
            {error ? (
              <p className="mt-2 text-xs font-bold text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-navy-400">
              <span>✓ تحویل در ۲۴ ساعت</span>
              <span>✓ کاملاً رایگان</span>
              <span>✓ بدون تعهد</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
