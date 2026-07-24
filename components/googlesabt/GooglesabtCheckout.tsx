"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pushGtmEvent } from "@/lib/gtm";
import {
  googlesabtPackages,
  formatToman,
  applyGooglesabtDiscount,
  resolveGooglesabtDiscount,
  type GooglesabtPackageKey,
} from "@/lib/googlesabtData";
import {
  CHECKOUT_STEP_LABELS,
  CHECKOUT_STORAGE_KEY,
  GOOGLESABT_CALL_WINDOWS,
  GOOGLESABT_CATEGORIES,
  GOOGLESABT_CONTACT_CHANNELS,
  GOOGLESABT_WEEKDAYS,
  IRAN_PROVINCE_CITIES,
  IRAN_PROVINCES,
  PROVINCE_MAP_CENTER,
  callWindowLabel,
  emptyOrderDraft,
  type CheckoutWizardStep,
  type GooglesabtCallWindowId,
  type GooglesabtContactChannelId,
  type GooglesabtOrderDraft,
  type GooglesabtWeekdayId,
} from "@/lib/googlesabtCheckout";
import { IconCheck, IconPhone, IconStar } from "@/components/icons";
import GooglesabtMapPicker from "@/components/googlesabt/GooglesabtMapPicker";
import {
  SITE_PHONE_DISPLAY,
  SITE_PHONE_TEL,
  siteWhatsAppUrl,
} from "@/lib/siteContact";

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

const isPhone = (v: string) =>
  /^(\+98|0098|0)?9\d{9}$/.test(toLatinDigits(v).replace(/[\s\-()]/g, ""));

function normalizePhone(raw: string): string | null {
  if (!isPhone(raw)) return null;
  const digits = toLatinDigits(raw).replace(/[\s\-()]/g, "");
  return "0" + digits.replace(/^(\+98|0098|0)?/, "");
}

type Phase = "pricing" | "checkout" | "success";

function fieldClass(extra = "") {
  return `w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-[#4285F4] focus:bg-white ${extra}`;
}

function labelClass() {
  return "mb-1.5 block text-[13px] font-bold text-navy-700";
}

const TIME_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const TIME_MINUTES = ["00", "15", "30", "45"] as const;

/** Native type=time breaks in RTL (AM/PM + reversed digits). Use clear 24h selects. */
function parseHm(value: string): { h: string; m: string } {
  const [rawH = "09", rawM = "00"] = value.split(":");
  const h = String(Math.min(23, Math.max(0, Number(rawH) || 0))).padStart(2, "0");
  const minuteNum = Number(rawM) || 0;
  const snapped =
    TIME_MINUTES.find((m) => Number(m) === minuteNum) ??
    TIME_MINUTES.reduce((best, m) =>
      Math.abs(Number(m) - minuteNum) < Math.abs(Number(best) - minuteNum) ? m : best,
    );
  return { h, m: snapped };
}

function formatHmFa(value: string): string {
  const { h, m } = parseHm(value);
  return `${h}:${m}`;
}

function TimeField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const { h, m } = parseHm(value);
  return (
    <div>
      <label htmlFor={`${id}-h`} className={labelClass()}>
        {label}
      </label>
      <div className="flex items-center gap-2" dir="ltr">
        <select
          id={`${id}-h`}
          className={fieldClass("text-center tabular-nums")}
          value={h}
          onChange={(e) => onChange(`${e.target.value}:${m}`)}
          aria-label={`${label} — ساعت`}
        >
          {TIME_HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <span className="text-sm font-extrabold text-navy-400" aria-hidden>
          :
        </span>
        <select
          id={`${id}-m`}
          className={fieldClass("text-center tabular-nums")}
          value={m}
          onChange={(e) => onChange(`${h}:${e.target.value}`)}
          aria-label={`${label} — دقیقه`}
        >
          {TIME_MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-navy-400" dir="ltr">
        {formatHmFa(value)} · ۲۴ ساعته
      </p>
    </div>
  );
}

export default function GooglesabtCheckout() {
  const rootRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>("pricing");
  const [step, setStep] = useState<CheckoutWizardStep>(1);
  const [draft, setDraft] = useState<GooglesabtOrderDraft>(() => emptyOrderDraft("popular"));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [discountInput, setDiscountInput] = useState("");
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);

  const pkg =
    googlesabtPackages.find((p) => p.key === draft.packageKey) ?? googlesabtPackages[1];
  const cities = draft.province ? IRAN_PROVINCE_CITIES[draft.province] ?? [] : [];
  const activeDiscount = resolveGooglesabtDiscount(draft.discountCode);
  const finalPrice = activeDiscount
    ? applyGooglesabtDiscount(pkg.price, activeDiscount.percent)
    : pkg.price;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    try {
      const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          draft?: GooglesabtOrderDraft;
          step?: CheckoutWizardStep;
          phase?: Phase;
        };
        if (saved.draft?.packageKey) {
          const nextDraft = { ...emptyOrderDraft(saved.draft.packageKey), ...saved.draft };
          setDraft(nextDraft);
          if (nextDraft.discountCode) setDiscountInput(nextDraft.discountCode);
        }
        if (saved.phase === "checkout" && saved.step) {
          setPhase("checkout");
          setStep(saved.step);
        }
        if (saved.phase === "success") {
          setPhase("success");
        }
      }
    } catch {
      /* ignore */
    }

    const pkgParam = params.get("package") as GooglesabtPackageKey | null;
    if (pkgParam && ["basic", "popular", "vip"].includes(pkgParam)) {
      setDraft((d) => ({ ...d, packageKey: pkgParam }));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || phase === "success") return;
    try {
      sessionStorage.setItem(
        CHECKOUT_STORAGE_KEY,
        JSON.stringify({ draft, step, phase })
      );
    } catch {
      /* ignore */
    }
  }, [draft, step, phase, hydrated]);

  const progressPct = useMemo(() => Math.round((step / 5) * 100), [step]);
  const stepsLeft = 5 - step;

  const patch = (partial: Partial<GooglesabtOrderDraft>) => {
    setDraft((d) => ({ ...d, ...partial }));
    if (error) setError(null);
  };

  const scrollToRoot = () => {
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const applyDiscountCode = () => {
    const resolved = resolveGooglesabtDiscount(discountInput);
    if (!resolved) {
      patch({ discountCode: "" });
      setDiscountMessage("کد تخفیف معتبر نیست.");
      return;
    }
    patch({ discountCode: resolved.code });
    setDiscountInput(resolved.code);
    setDiscountMessage(`${resolved.label} اعمال شد.`);
  };

  const selectPackage = (key: GooglesabtPackageKey) => {
    pushGtmEvent("pkg_selected", { package: key, page: "googlesabt" });
    pushGtmEvent("begin_checkout", { package: key, page: "googlesabt" });
    startTransition(() => {
      setDraft((d) => ({ ...d, packageKey: key }));
      setStep(1);
      setPhase("checkout");
      setError(null);
    });
    requestAnimationFrame(scrollToRoot);
  };

  const validateStep = (s: CheckoutWizardStep): string | null => {
    if (s === 1) {
      if (!draft.businessName.trim()) return "نام کسب‌وکار را وارد کنید.";
      if (!normalizePhone(draft.phone)) return "شماره موبایل معتبر وارد کنید.";
      if (!draft.category) return "دسته‌بندی را انتخاب کنید.";
    }
    if (s === 2) {
      if (!draft.province) return "استان را انتخاب کنید.";
      if (!draft.city) return "شهر را انتخاب کنید.";
      if (!draft.address.trim() || draft.address.trim().length < 8)
        return "آدرس کامل را وارد کنید.";
      if (draft.lat == null || draft.lng == null) return "موقعیت را روی نقشه مشخص کنید.";
    }
    if (s === 3) {
      if (!draft.openTime || !draft.closeTime) return "ساعات کاری را مشخص کنید.";
      if (draft.weekdays.length === 0) return "حداقل یک روز کاری انتخاب کنید.";
    }
    return null;
  };

  const goNext = () => {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < 5) setStep((step + 1) as CheckoutWizardStep);
  };

  const goBack = () => {
    setError(null);
    if (step === 1) {
      setPhase("pricing");
      return;
    }
    setStep((step - 1) as CheckoutWizardStep);
  };

  const toggleDay = (id: GooglesabtWeekdayId) => {
    setDraft((d) => {
      const has = d.weekdays.includes(id);
      return {
        ...d,
        weekdays: has ? d.weekdays.filter((x) => x !== id) : [...d.weekdays, id],
      };
    });
  };

  const submitRequest = async () => {
    const phone = normalizePhone(draft.phone);
    if (!phone) {
      setError("شماره موبایل معتبر نیست.");
      setStep(1);
      return;
    }
    setSubmitting(true);
    setError(null);
    pushGtmEvent("generate_lead", {
      source: "googlesabt_request",
      package: draft.packageKey,
      page: "googlesabt",
      has_discount: Boolean(activeDiscount),
    });
    try {
      const res = await fetch("/api/googlesabt/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: draft.packageKey,
          businessName: draft.businessName.trim(),
          contactName: draft.contactName.trim() || undefined,
          contact: phone,
          category: draft.category,
          province: draft.province,
          city: draft.city,
          address: draft.address.trim(),
          lat: draft.lat,
          lng: draft.lng,
          openTime: draft.openTime,
          closeTime: draft.closeTime,
          weekdays: draft.weekdays,
          preferredCallWindow: draft.preferredCallWindow,
          contactChannel: draft.contactChannel,
          discountCode: draft.discountCode || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        trackId?: string;
        error?: string;
      };
      if (data.ok && data.trackId) {
        setTrackId(data.trackId);
        setPhase("success");
        try {
          sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      throw new Error(data.error || "request_failed");
    } catch {
      setError("ثبت درخواست ممکن نشد. دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.");
      setSubmitting(false);
    }
  };

  const weekdayLabels = draft.weekdays
    .map((id) => GOOGLESABT_WEEKDAYS.find((d) => d.id === id)?.label)
    .filter(Boolean)
    .join("، ");

  const downloadSummary = () => {
    const lines = [
      "خلاصه درخواست — آرایه ثبت گوگل",
      `کد پیگیری: ${trackId || "—"}`,
      `پکیج: ${pkg.name}`,
      `مبلغ برآوردی: ${formatToman(finalPrice)} تومان`,
      activeDiscount ? `کد تخفیف: ${activeDiscount.code} (${activeDiscount.percent}٪)` : "کد تخفیف: —",
      `کسب‌وکار: ${draft.businessName || "—"}`,
      `تماس: ${draft.phone || "—"}`,
      "وضعیت: کارشناسان آرایه به‌زودی تماس می‌گیرند",
      `تاریخ: ${new Date().toLocaleDateString("fa-IR")}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `araaye-request-${trackId || "order"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      ref={rootRef}
      id="packages"
      className="scroll-mt-24 bg-gradient-to-b from-white via-blue-50/20 to-white py-20 sm:py-28"
    >
      <div className="container-mx container-px">
        {phase === "pricing" ? (
          <>
            <header className="mx-auto max-w-2xl text-center">
              <p className="text-[12px] font-bold tracking-wide text-[#4285F4]">پکیج‌ها</p>
              <h2 className="mt-2 text-2xl font-extrabold text-navy-900 sm:text-3xl lg:text-[2.1rem]">
                پکیج مناسب کسب‌وکارتان را انتخاب کنید
              </h2>
              <p className="mt-3 text-[15px] text-navy-500">
                فقط اطلاعات را ثبت کنید. کارشناس آرایه با شما تماس می‌گیرد و جزئیات را نهایی
                می‌کند.
              </p>
            </header>

            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-navy-100 bg-white p-4 shadow-soft sm:p-5">
              <label htmlFor="gs-discount" className={labelClass()}>
                کد تخفیف{" "}
                <span className="font-normal text-navy-400">(اختیاری)</span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="gs-discount"
                  value={discountInput}
                  onChange={(e) => {
                    setDiscountInput(e.target.value);
                    setDiscountMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyDiscountCode();
                    }
                  }}
                  placeholder="مثلاً ARAAYE10"
                  className={fieldClass("sm:flex-1")}
                  dir="ltr"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={applyDiscountCode}
                  className="rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
                >
                  اعمال کد
                </button>
              </div>
              {discountMessage ? (
                <p
                  className={`mt-2 text-xs font-bold ${
                    activeDiscount ? "text-emerald-700" : "text-red-600"
                  }`}
                >
                  {discountMessage}
                </p>
              ) : (
                <p className="mt-2 text-[11px] text-navy-400">
                  اگر کد دارید اینجا وارد کنید تا روی مبلغ پکیج‌ها اعمال شود.
                </p>
              )}
            </div>

            <div className="mx-auto mt-10 grid max-w-6xl items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
              {googlesabtPackages.map((p) => {
                const isPopular = Boolean(p.popular);
                const discounted = activeDiscount
                  ? applyGooglesabtDiscount(p.price, activeDiscount.percent)
                  : p.price;
                return (
                  <article
                    key={p.key}
                    className={`relative flex flex-col rounded-[1.75rem] border bg-white p-6 transition-all duration-300 sm:p-7 ${
                      isPopular
                        ? "z-10 border-[#4285F4] shadow-[0_24px_60px_rgba(66,133,244,0.18)] lg:-translate-y-3 lg:scale-[1.04] lg:p-8"
                        : "border-navy-100 shadow-[0_8px_30px_rgba(16,42,67,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(16,42,67,0.08)]"
                    }`}
                  >
                    {isPopular ? (
                      <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#4285F4] px-3.5 py-1 text-[11px] font-bold text-white shadow-soft">
                        <IconStar size={12} className="fill-current" />
                        {p.recommendedLabel || "پیشنهادی"}
                      </span>
                    ) : null}

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-extrabold text-navy-900">پکیج {p.name}</h3>
                      {activeDiscount ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          {activeDiscount.percent}٪ با کد
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          ۱۰٪ تخفیف
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{p.description}</p>

                    <div className="mt-5">
                      <span className="block text-xs text-navy-300 line-through">
                        {formatToman(p.oldPrice)} تومان
                      </span>
                      {activeDiscount && discounted !== p.price ? (
                        <span className="mt-0.5 block text-xs text-navy-400 line-through">
                          {formatToman(p.price)} تومان
                        </span>
                      ) : null}
                      <span className="text-2xl font-extrabold text-navy-900 sm:text-[1.75rem]">
                        {formatToman(discounted)}
                        <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                      </span>
                      <p className="mt-1 text-[11px] font-semibold text-navy-400">
                        برآورد قیمت — پرداخت بعد از تماس کارشناس
                      </p>
                    </div>

                    <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-navy-600">
                          <IconCheck size={14} className="mt-1 shrink-0 text-[#34A853]" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => selectPackage(p.key)}
                      className={`mt-7 w-full rounded-xl px-5 py-3.5 text-sm font-bold transition active:scale-[0.98] ${
                        isPopular
                          ? "bg-[#4285F4] text-white hover:bg-[#1b6ef3]"
                          : "border border-navy-200 bg-white text-navy-800 hover:border-[#4285F4] hover:text-[#4285F4]"
                      }`}
                    >
                      {isPopular ? "شروع با این پکیج" : "انتخاب این پکیج"}
                    </button>
                  </article>
                );
              })}
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-xs font-semibold text-navy-400">
              بیشتر کسب‌وکارها پکیج حرفه‌ای را انتخاب می‌کنند.
            </p>
          </>
        ) : null}

        {phase === "checkout" ? (
          <div className="mx-auto max-w-xl">
            {/* Commitment: selected package stays visible through the whole purchase */}
            <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-[#4285F4]/25 bg-blue-50/60 px-4 py-3.5 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-navy-400">پکیج انتخاب‌شده</p>
                <p className="mt-0.5 text-[15px] font-extrabold text-navy-900">
                  {pkg.popular ? (
                    <span className="inline-flex items-center gap-1">
                      <IconStar size={14} className="fill-current text-[#FABB05]" />
                      پکیج {pkg.name}
                    </span>
                  ) : (
                    <>پکیج {pkg.name}</>
                  )}
                </p>
                <p className="mt-0.5 text-[13px] font-bold text-[#4285F4]">
                  {formatToman(finalPrice)} تومان
                  {activeDiscount ? (
                    <span className="mr-1 text-[11px] font-semibold text-emerald-700">
                      ({activeDiscount.code})
                    </span>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPhase("pricing")}
                className="shrink-0 rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-[12px] font-bold text-navy-600 transition hover:border-[#4285F4] hover:text-[#4285F4]"
              >
                تغییر
              </button>
            </div>

            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[12px] font-bold text-navy-700">
                  {progressPct}٪ تکمیل شده
                </p>
                <p className="text-[11px] font-bold text-navy-400">
                  {stepsLeft === 0
                    ? "آخرین مرحله — کارشناسان تماس می‌گیرند"
                    : stepsLeft === 1
                      ? "فقط ۱ مرحله تا ثبت درخواست"
                      : `فقط ${stepsLeft} مرحله تا ثبت درخواست`}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-navy-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-l from-[#4285F4] to-[#34A853]"
                  initial={false}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-[11px] text-navy-400">{CHECKOUT_STEP_LABELS[step]}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="rounded-[1.75rem] border border-navy-100 bg-white p-6 shadow-[0_12px_40px_rgba(16,42,67,0.06)] sm:p-8"
              >
                {step === 1 ? (
                  <div className="space-y-4">
                    <h3 className="text-base font-extrabold text-navy-900">اطلاعات کسب‌وکار</h3>
                    <div>
                      <label htmlFor="gs-name" className={labelClass()}>
                        نام کسب‌وکار
                      </label>
                      <input
                        id="gs-name"
                        className={fieldClass()}
                        value={draft.businessName}
                        onChange={(e) => patch({ businessName: e.target.value })}
                        placeholder="مثلاً کافه ارکیده"
                        autoComplete="organization"
                      />
                    </div>
                    <div>
                      <label htmlFor="gs-contact-name" className={labelClass()}>
                        نام مسئول تماس
                      </label>
                      <input
                        id="gs-contact-name"
                        className={fieldClass()}
                        value={draft.contactName}
                        onChange={(e) => patch({ contactName: e.target.value })}
                        placeholder="مثلاً آقای محمدی"
                        autoComplete="name"
                      />
                      <p className="mt-1.5 text-[11px] font-semibold text-navy-400">
                        کارشناس با همین نام شما را صدا می‌زند.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="gs-phone" className={labelClass()}>
                        شماره موبایل
                      </label>
                      <input
                        id="gs-phone"
                        dir="ltr"
                        inputMode="tel"
                        className={fieldClass("text-left")}
                        value={draft.phone}
                        onChange={(e) => patch({ phone: e.target.value })}
                        placeholder="09xxxxxxxxx"
                        autoComplete="tel"
                      />
                    </div>
                    <div>
                      <label htmlFor="gs-cat" className={labelClass()}>
                        دسته‌بندی
                      </label>
                      <select
                        id="gs-cat"
                        className={fieldClass()}
                        value={draft.category}
                        onChange={(e) => patch({ category: e.target.value })}
                      >
                        <option value="">انتخاب کنید</option>
                        {GOOGLESABT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-4">
                    <h3 className="text-base font-extrabold text-navy-900">آدرس کسب‌وکار</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="gs-prov" className={labelClass()}>
                          استان
                        </label>
                        <select
                          id="gs-prov"
                          className={fieldClass()}
                          value={draft.province}
                          onChange={(e) => {
                            const province = e.target.value;
                            const center = PROVINCE_MAP_CENTER[province];
                            patch({
                              province,
                              city: "",
                              ...(center
                                ? { lat: center.lat, lng: center.lng }
                                : {}),
                            });
                          }}
                        >
                          <option value="">انتخاب استان</option>
                          {IRAN_PROVINCES.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="gs-city" className={labelClass()}>
                          شهر
                        </label>
                        <select
                          id="gs-city"
                          className={fieldClass()}
                          value={draft.city}
                          disabled={!draft.province}
                          onChange={(e) => patch({ city: e.target.value })}
                        >
                          <option value="">انتخاب شهر</option>
                          {cities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="gs-addr" className={labelClass()}>
                        آدرس
                      </label>
                      <textarea
                        id="gs-addr"
                        rows={2}
                        className={fieldClass("resize-none")}
                        value={draft.address}
                        onChange={(e) => patch({ address: e.target.value })}
                        placeholder="خیابان، کوچه، پلاک…"
                      />
                    </div>
                    <div>
                      <p className={labelClass()}>موقعیت روی نقشه</p>
                      <div className="mt-2">
                        <GooglesabtMapPicker
                          lat={draft.lat}
                          lng={draft.lng}
                          province={draft.province}
                          onChange={(lat, lng) => patch({ lat, lng })}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-5">
                    <h3 className="text-base font-extrabold text-navy-900">ساعات کاری</h3>
                    <p className="text-[12px] font-semibold leading-6 text-navy-500">
                      ساعت را به‌صورت ۲۴ ساعته انتخاب کنید (مثلاً ۰۹:۰۰ تا ۲۱:۰۰).
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <TimeField
                        id="gs-open"
                        label="ساعت شروع"
                        value={draft.openTime}
                        onChange={(openTime) => patch({ openTime })}
                      />
                      <TimeField
                        id="gs-close"
                        label="ساعت پایان"
                        value={draft.closeTime}
                        onChange={(closeTime) => patch({ closeTime })}
                      />
                    </div>
                    <div>
                      <p className={labelClass()}>روزهای کاری</p>
                      <div className="flex flex-wrap gap-2">
                        {GOOGLESABT_WEEKDAYS.map((d) => {
                          const on = draft.weekdays.includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => toggleDay(d.id)}
                              className={`rounded-full px-3.5 py-2 text-[12px] font-bold transition ${
                                on
                                  ? "bg-[#4285F4] text-white"
                                  : "border border-navy-100 bg-navy-50 text-navy-500"
                              }`}
                            >
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="space-y-5">
                    <h3 className="text-base font-extrabold text-navy-900">بازبینی سفارش</h3>
                    <div className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4 text-[13px]">
                      <div className="flex items-center justify-between">
                        <span className="text-navy-500">پکیج</span>
                        <button
                          type="button"
                          onClick={() => setPhase("pricing")}
                          className="font-extrabold text-[#4285F4]"
                        >
                          {pkg.name} · ویرایش
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-navy-500">برآورد قیمت</span>
                        <span className="font-bold text-navy-800">
                          {formatToman(finalPrice)} تومان
                        </span>
                      </div>
                      {activeDiscount ? (
                        <p className="mt-2 text-[11px] font-bold text-emerald-700">
                          کد {activeDiscount.code} اعمال شده
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-3 rounded-2xl border border-navy-100 p-4 text-[13px] leading-relaxed text-navy-600">
                      <Row
                        label="کسب‌وکار"
                        value={`${draft.businessName} · ${draft.category}`}
                        onEdit={() => setStep(1)}
                      />
                      <Row
                        label="تماس"
                        value={
                          draft.contactName.trim()
                            ? `${draft.contactName.trim()} · ${draft.phone}`
                            : draft.phone
                        }
                        onEdit={() => setStep(1)}
                      />
                      <Row
                        label="آدرس"
                        value={`${draft.province}، ${draft.city} — ${draft.address}`}
                        onEdit={() => setStep(2)}
                      />
                      <Row
                        label="ساعات"
                        value={`${formatHmFa(draft.openTime)} تا ${formatHmFa(draft.closeTime)} · ${weekdayLabels}`}
                        onEdit={() => setStep(3)}
                      />
                    </div>
                  </div>
                ) : null}

                {step === 5 ? (
                  <div className="space-y-5">
                    <h3 className="text-base font-extrabold text-navy-900">ثبت درخواست</h3>
                    <div>
                      <p className={labelClass()}>کی با شما تماس بگیریم؟</p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {GOOGLESABT_CALL_WINDOWS.map((w) => {
                          const on = draft.preferredCallWindow === w.id;
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() =>
                                patch({ preferredCallWindow: w.id as GooglesabtCallWindowId })
                              }
                              className={`rounded-xl px-3 py-3 text-center transition ${
                                on
                                  ? "bg-[#4285F4] text-white"
                                  : "border border-navy-100 bg-navy-50 text-navy-600"
                              }`}
                            >
                              <span className="block text-[12px] font-extrabold">{w.label}</span>
                              <span
                                className={`mt-0.5 block text-[10px] font-semibold ${
                                  on ? "text-white/80" : "text-navy-400"
                                }`}
                              >
                                {w.hint}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <p className={labelClass()}>چطور راحت‌ترید؟</p>
                      <div className="flex flex-wrap gap-2">
                        {GOOGLESABT_CONTACT_CHANNELS.map((c) => {
                          const on = draft.contactChannel === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                patch({ contactChannel: c.id as GooglesabtContactChannelId })
                              }
                              className={`rounded-full px-4 py-2 text-[12px] font-bold transition ${
                                on
                                  ? "bg-[#4285F4] text-white"
                                  : "border border-navy-100 bg-navy-50 text-navy-500"
                              }`}
                            >
                              {c.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                      <div className="flex justify-between text-[13px] text-navy-500">
                        <span>پکیج {pkg.name}</span>
                        <span className="line-through">{formatToman(pkg.oldPrice)} تومان</span>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-navy-100 pt-3 text-sm font-extrabold text-navy-900">
                        <span>برآورد مبلغ</span>
                        <span className="text-[#4285F4]">
                          {formatToman(finalPrice)} تومان
                        </span>
                      </div>
                      {activeDiscount ? (
                        <p className="mt-2 text-[11px] font-bold text-emerald-700">
                          تخفیف {activeDiscount.percent}٪ با کد {activeDiscount.code}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] text-navy-400">
                        الان پرداختی انجام نمی‌شود. بعد از ثبت، در بازهٔ انتخابی با شما هماهنگ
                        می‌کنیم.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] font-bold text-emerald-700">
                      <IconPhone size={15} className="shrink-0" />
                      تماس در بازهٔ {callWindowLabel(draft.preferredCallWindow)}
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className="mt-4 text-xs font-bold text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="mt-7 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={goBack}
                    className="rounded-xl border border-navy-200 px-5 py-3 text-sm font-bold text-navy-600 transition hover:bg-navy-50"
                  >
                    بازگشت
                  </button>
                  {step < 5 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 rounded-xl bg-[#4285F4] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#1b6ef3] active:scale-[0.98]"
                    >
                      {step === 4 ? "ادامه به ثبت درخواست" : "ادامه"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submitRequest}
                      disabled={submitting}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4285F4] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1b6ef3] active:scale-[0.98] disabled:opacity-60"
                    >
                      {submitting ? (
                        "در حال ثبت…"
                      ) : (
                        <>
                          <IconPhone size={16} className="shrink-0" />
                          ثبت درخواست — کارشناسان تماس می‌گیرند
                        </>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        {phase === "success" ? (
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-[#34A853]">
              <IconCheck size={36} />
            </div>
            <h2 className="mt-6 text-2xl font-extrabold text-navy-900 sm:text-3xl">
              درخواست شما ثبت شد.
            </h2>
            <p className="mt-3 text-[14px] text-navy-500">
              کارشناسان ما به‌زودی با شما تماس می‌گیرند تا جزئیات را نهایی و مسیر پرداخت را
              هماهنگ کنند.
            </p>

            <div className="mt-8 space-y-3 rounded-[1.75rem] border border-navy-100 bg-white p-6 text-right shadow-[0_12px_40px_rgba(16,42,67,0.06)] sm:p-7">
              <SuccessRow label="کد پیگیری" value={trackId || "—"} mono />
              <SuccessRow
                label="زمان تماس"
                value={callWindowLabel(draft.preferredCallWindow)}
              />
              <SuccessRow
                label="نحوه تماس"
                value={
                  GOOGLESABT_CONTACT_CHANNELS.find((c) => c.id === draft.contactChannel)
                    ?.label ?? "تماس تلفنی"
                }
              />
              <SuccessRow label="پکیج" value={pkg.name} />
              <SuccessRow label="برآورد مبلغ" value={`${formatToman(finalPrice)} تومان`} />
              {activeDiscount ? (
                <SuccessRow label="کد تخفیف" value={activeDiscount.code} />
              ) : null}
              {draft.businessName ? (
                <SuccessRow label="کسب‌وکار" value={draft.businessName} />
              ) : null}
              {draft.contactName.trim() ? (
                <SuccessRow label="مسئول تماس" value={draft.contactName.trim()} />
              ) : null}
            </div>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={SITE_PHONE_TEL}
                className="flex-1 rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm font-bold text-navy-700"
              >
                پشتیبانی {SITE_PHONE_DISPLAY}
              </a>
              <a
                href={siteWhatsAppUrl(`سلام، درخواست ثبت گوگل من با کد ${trackId || ""}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
              >
                واتساپ
              </a>
            </div>
            <button
              type="button"
              onClick={downloadSummary}
              className="mt-3 w-full rounded-xl border border-navy-100 px-4 py-3 text-sm font-bold text-[#4285F4]"
            >
              دانلود خلاصه درخواست
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-navy-50 pb-3 last:border-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-navy-400">{label}</p>
        <p className="mt-0.5 text-navy-700">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-[11px] font-bold text-[#4285F4]"
      >
        ویرایش
      </button>
    </div>
  );
}

function SuccessRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <span className="text-navy-400">{label}</span>
      <span className={`font-bold text-navy-800 ${mono ? "font-mono tracking-wide" : ""}`}>
        {value}
      </span>
    </div>
  );
}
