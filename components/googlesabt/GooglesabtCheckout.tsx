"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { pushGtmEvent } from "@/lib/gtm";
import {
  googlesabtPackages,
  formatToman,
  type GooglesabtPackageKey,
} from "@/lib/googlesabtData";
import {
  CHECKOUT_STEP_LABELS,
  CHECKOUT_STORAGE_KEY,
  GOOGLESABT_CATEGORIES,
  GOOGLESABT_WEEKDAYS,
  IRAN_PROVINCE_CITIES,
  IRAN_PROVINCES,
  PROVINCE_MAP_CENTER,
  emptyOrderDraft,
  type CheckoutWizardStep,
  type GooglesabtOrderDraft,
  type GooglesabtWeekdayId,
} from "@/lib/googlesabtCheckout";
import { IconCheck, IconShield, IconStar } from "@/components/icons";
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
type PaymentFail = "failed" | "error" | null;

function fieldClass(extra = "") {
  return `w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-[#4285F4] focus:bg-white ${extra}`;
}

function labelClass() {
  return "mb-1.5 block text-[13px] font-bold text-navy-700";
}

export default function GooglesabtCheckout() {
  const rootRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>("pricing");
  const [step, setStep] = useState<CheckoutWizardStep>(1);
  const [draft, setDraft] = useState<GooglesabtOrderDraft>(() => emptyOrderDraft("popular"));
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [paymentFail, setPaymentFail] = useState<PaymentFail>(null);
  const [trackId, setTrackId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const pkg =
    googlesabtPackages.find((p) => p.key === draft.packageKey) ?? googlesabtPackages[1];
  const cities = draft.province ? IRAN_PROVINCE_CITIES[draft.province] ?? [] : [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const tid = params.get("trackId");

    if (payment === "success") {
      setPhase("success");
      setTrackId(tid);
      pushGtmEvent("purchase", { page: "googlesabt" });
      try {
        const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as { draft?: GooglesabtOrderDraft };
          if (saved.draft?.packageKey) {
            setDraft({ ...emptyOrderDraft(saved.draft.packageKey), ...saved.draft });
          }
        }
        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setHydrated(true);
      return;
    }
    if (payment === "failed" || payment === "error") {
      setPaymentFail(payment);
      setPhase("checkout");
      setStep(5);
      setTrackId(tid);
    }

    try {
      const raw = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          draft?: GooglesabtOrderDraft;
          step?: CheckoutWizardStep;
          phase?: Phase;
        };
        if (saved.draft?.packageKey) {
          setDraft({ ...emptyOrderDraft(saved.draft.packageKey), ...saved.draft });
        }
        if (payment !== "failed" && payment !== "error") {
          if (saved.phase === "checkout" && saved.step) {
            setPhase("checkout");
            setStep(saved.step);
          }
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

  const selectPackage = (key: GooglesabtPackageKey) => {
    pushGtmEvent("pkg_selected", { package: key, page: "googlesabt" });
    pushGtmEvent("begin_checkout", { package: key, page: "googlesabt" });
    startTransition(() => {
      setDraft((d) => ({ ...d, packageKey: key }));
      setStep(1);
      setPhase("checkout");
      setError(null);
      setPaymentFail(null);
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

  const startPayment = async () => {
    const phone = normalizePhone(draft.phone);
    if (!phone) {
      setError("شماره موبایل معتبر نیست.");
      setStep(1);
      return;
    }
    setPaying(true);
    setError(null);
    pushGtmEvent("add_payment_info", { package: draft.packageKey, page: "googlesabt" });
    try {
      const res = await fetch("/api/googlesabt/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: draft.packageKey,
          businessName: draft.businessName.trim(),
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
        }),
      });
      const data = (await res.json()) as { ok?: boolean; redirectUrl?: string };
      if (data.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      throw new Error("checkout_failed");
    } catch {
      setError("اتصال به درگاه پرداخت برقرار نشد. دوباره تلاش کنید.");
      setPaying(false);
    }
  };

  const weekdayLabels = draft.weekdays
    .map((id) => GOOGLESABT_WEEKDAYS.find((d) => d.id === id)?.label)
    .filter(Boolean)
    .join("، ");

  const downloadInvoice = () => {
    const lines = [
      "فاکتور رزرو — آرایه ثبت گوگل",
      `کد پیگیری: ${trackId || "—"}`,
      `پکیج: ${pkg.name}`,
      `مبلغ پرداختی: ${formatToman(pkg.price)} تومان`,
      `کسب‌وکار: ${draft.businessName || "—"}`,
      `تماس: ${draft.phone || "—"}`,
      `تاریخ: ${new Date().toLocaleDateString("fa-IR")}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `araaye-invoice-${trackId || "order"}.txt`;
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
                پکیج مناسب را انتخاب کنید
              </h2>
              <p className="mt-3 text-[15px] text-navy-500">
                با انتخاب پکیج، مستقیم وارد تکمیل سفارش می‌شوید.
              </p>
            </header>

            <div className="mx-auto mt-14 grid max-w-6xl items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
              {googlesabtPackages.map((p) => {
                const isPopular = Boolean(p.popular);
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
                        پیشنهادی
                      </span>
                    ) : null}

                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-lg font-extrabold text-navy-900">پکیج {p.name}</h3>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        ۱۰٪ تخفیف
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed text-navy-500">{p.description}</p>

                    <div className="mt-5">
                      <span className="block text-xs text-navy-300 line-through">
                        {formatToman(p.oldPrice)} تومان
                      </span>
                      <span className="text-2xl font-extrabold text-navy-900 sm:text-[1.75rem]">
                        {formatToman(p.price)}
                        <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                      </span>
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
                      انتخاب این پکیج
                    </button>
                  </article>
                );
              })}
            </div>
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
                  {formatToman(pkg.price)} تومان
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
                    ? "آخرین مرحله"
                    : stepsLeft === 1
                      ? "فقط ۱ مرحله تا تکمیل سفارش"
                      : `فقط ${stepsLeft} مرحله تا تکمیل سفارش`}
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

            {paymentFail ? (
              <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-[13px] font-bold text-red-600">
                پرداخت انجام نشد. می‌توانید دوباره تلاش کنید.
              </div>
            ) : null}

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
                      <GooglesabtMapPicker
                        lat={draft.lat}
                        lng={draft.lng}
                        province={draft.province}
                        onChange={(lat, lng) => patch({ lat, lng })}
                      />
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-5">
                    <h3 className="text-base font-extrabold text-navy-900">ساعات کاری</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="gs-open" className={labelClass()}>
                          ساعت شروع
                        </label>
                        <input
                          id="gs-open"
                          type="time"
                          className={fieldClass()}
                          value={draft.openTime}
                          onChange={(e) => patch({ openTime: e.target.value })}
                        />
                      </div>
                      <div>
                        <label htmlFor="gs-close" className={labelClass()}>
                          ساعت پایان
                        </label>
                        <input
                          id="gs-close"
                          type="time"
                          className={fieldClass()}
                          value={draft.closeTime}
                          onChange={(e) => patch({ closeTime: e.target.value })}
                        />
                      </div>
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
                        <span className="text-navy-500">قیمت</span>
                        <span className="font-bold text-navy-800">
                          {formatToman(pkg.price)} تومان
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 rounded-2xl border border-navy-100 p-4 text-[13px] leading-relaxed text-navy-600">
                      <Row
                        label="کسب‌وکار"
                        value={`${draft.businessName} · ${draft.category}`}
                        onEdit={() => setStep(1)}
                      />
                      <Row label="تماس" value={draft.phone} onEdit={() => setStep(1)} />
                      <Row
                        label="آدرس"
                        value={`${draft.province}، ${draft.city} — ${draft.address}`}
                        onEdit={() => setStep(2)}
                      />
                      <Row
                        label="ساعات"
                        value={`${draft.openTime} تا ${draft.closeTime} · ${weekdayLabels}`}
                        onEdit={() => setStep(3)}
                      />
                    </div>
                  </div>
                ) : null}

                {step === 5 ? (
                  <div className="space-y-5">
                    <h3 className="text-base font-extrabold text-navy-900">تکمیل سفارش</h3>
                    <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-5">
                      <div className="flex justify-between text-[13px] text-navy-500">
                        <span>پکیج {pkg.name}</span>
                        <span className="line-through">{formatToman(pkg.oldPrice)} تومان</span>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-navy-100 pt-3 text-sm font-extrabold text-navy-900">
                        <span>مبلغ قابل پرداخت</span>
                        <span className="text-[#4285F4]">
                          {formatToman(pkg.price)} تومان
                        </span>
                      </div>
                      <p className="mt-2 text-[11px] text-navy-400">
                        پرداخت کامل پکیج. با تأیید پرداخت، راه‌اندازی همان روز شروع می‌شود. مالیات بر ارزش افزوده در صورت شمول در فاکتور لحاظ می‌شود.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[12px] font-bold text-emerald-700">
                      <IconShield size={15} className="shrink-0" />
                      پرداخت امن از طریق درگاه معتبر
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
                      {step === 4 ? "ادامه به پرداخت" : "ادامه"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startPayment}
                      disabled={paying}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#4285F4] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#1b6ef3] active:scale-[0.98] disabled:opacity-60"
                    >
                      {paying ? (
                        "در حال انتقال…"
                      ) : (
                        <>
                          <IconShield size={16} className="shrink-0" />
                          پرداخت امن آنلاین
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
              ثبت سفارش شما با موفقیت انجام شد.
            </h2>
            <p className="mt-3 text-[14px] text-navy-500">
              تیم آرایه به‌زودی برای تکمیل راه‌اندازی با شما تماس می‌گیرد.
            </p>

            <div className="mt-8 space-y-3 rounded-[1.75rem] border border-navy-100 bg-white p-6 text-right shadow-[0_12px_40px_rgba(16,42,67,0.06)] sm:p-7">
              <SuccessRow label="کد پیگیری" value={trackId || "—"} mono />
              <SuccessRow label="زمان تحویل تقریبی" value="کمتر از ۱ روز کاری" />
              <SuccessRow label="پکیج" value={pkg.name} />
              <SuccessRow label="مبلغ پرداخت‌شده" value={`${formatToman(pkg.price)} تومان`} />
              {draft.businessName ? (
                <SuccessRow label="کسب‌وکار" value={draft.businessName} />
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
                href={siteWhatsAppUrl(`سلام، سفارش ثبت گوگل من با کد ${trackId || ""}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-white"
              >
                واتساپ
              </a>
            </div>
            <button
              type="button"
              onClick={downloadInvoice}
              className="mt-3 w-full rounded-xl border border-navy-100 px-4 py-3 text-sm font-bold text-[#4285F4]"
            >
              دانلود فاکتور
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
