"use client";

import { useState } from "react";
import { IconCalendar, IconCheck } from "@/components/icons";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

interface AppointmentFormProps {
  accentClasses: {
    ring: string;
    bg: string;
    hoverBg: string;
    text: string;
  };
  services: string[];
}

// Front-end-only "book an appointment" form for the demo site. This simulates
// what the doctor's real patients would use — no backend call, just a
// realistic success state, since this page itself is a sample.
export default function AppointmentForm({ accentClasses, services }: AppointmentFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(services[0] ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("لطفاً نام و نام‌خانوادگی را وارد کنید.");
      return;
    }
    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 900);
  };

  if (success) {
    return (
      <div
        className={`rounded-2xl border ${accentClasses.ring} bg-white p-6 text-center shadow-card sm:p-8`}
        role="status"
        aria-live="polite"
      >
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${accentClasses.bg} text-white`}
        >
          <IconCheck size={26} />
        </div>
        <h3 className="text-base font-extrabold text-navy-900 sm:text-lg">نوبت شما ثبت شد ✓</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
          به‌زودی جهت هماهنگی زمان دقیق حضور، با شماره {phone || "شما"} تماس گرفته می‌شود.
        </p>
        <p className="mt-4 rounded-xl bg-navy-50/60 px-3 py-2 text-[11px] text-navy-400">
          (این فقط یک نمونه‌ی نوبت‌دهی است — در سایت واقعی، پیامک تأیید و یادآوری هم برای بیمار ارسال می‌شود.)
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-navy-100 bg-white p-5 shadow-card sm:p-7"
    >
      <div className="mb-5 flex items-center gap-2.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClasses.bg} text-white`}>
          <IconCalendar size={18} />
        </span>
        <h3 className="text-sm font-extrabold text-navy-900 sm:text-base">رزرو نوبت آنلاین</h3>
      </div>

      <div className="mb-4">
        <label htmlFor="apt-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
          نام و نام‌خانوادگی
        </label>
        <input
          id="apt-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً مریم احمدی"
          className={`w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:bg-white ${accentClasses.ring}`}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="apt-phone" className="mb-1.5 block text-[13px] font-bold text-navy-700">
          شماره موبایل
        </label>
        <input
          id="apt-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (error) setError(null);
          }}
          placeholder="09xxxxxxxxx"
          className={`w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:bg-white ${accentClasses.ring}`}
        />
      </div>

      {services.length ? (
        <div className="mb-4">
          <label htmlFor="apt-service" className="mb-1.5 block text-[13px] font-bold text-navy-700">
            نوع خدمت
          </label>
          <select
            id="apt-service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className={`w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:bg-white ${accentClasses.ring}`}
          >
            {services.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {error ? (
        <p className="mb-3 text-xs font-bold text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-xl px-6 py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-60 ${accentClasses.bg} ${accentClasses.hoverBg}`}
      >
        {loading ? "در حال ثبت..." : "رزرو نوبت"}
      </button>
      <p className="mt-3 text-center text-[11px] text-navy-400">
        این فرم صرفاً برای نمایش عملکرد سایت است.
      </p>
    </form>
  );
}
