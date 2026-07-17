"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SectionHeader from "@/components/home/SectionHeader";
import DoctorDemoPreviewFrames from "@/components/doctors/demo/DoctorDemoPreviewFrames";
import DoctorsWhatsAppCta from "@/components/doctors/DoctorsWhatsAppCta";
import { getUtmParams } from "@/lib/utm";
import { trackDoctorsEvent } from "@/lib/doctorsAnalytics";
import {
  DOCTORS_DEPOSIT_TOMAN,
  DOCTORS_PRODUCT_PRICE_TOMAN,
  DOCTORS_SALES_SUCCESS_MESSAGE,
  DOCTORS_SPECIALTY_EVENT,
  buildDoctorsWaQuoteMessage,
  doctorFormAddons,
  doctorSpecialtyOptions,
  doctorSpecialtySamples,
  formatToman,
} from "@/lib/doctorsData";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL, siteWhatsAppUrl } from "@/lib/siteContact";
import { IconCheck, IconPhone } from "@/components/icons";

const DEDUP_KEY = "doctors_direct_sale_submitted";

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\D/g, "");

function isValidIranianMobile(value: string): boolean {
  return /^09\d{9}$/.test(toLatinDigits(value));
}

type BusinessType = "matab" | "clinic";
type Step = 1 | 2 | 3;

export default function DoctorsSalesForm() {
  const [step, setStep] = useState<Step>(1);
  const [businessType, setBusinessType] = useState<BusinessType>("matab");
  const [specialty, setSpecialty] = useState(doctorSpecialtyOptions[0]?.label ?? "");
  const [specialtyKey, setSpecialtyKey] = useState(doctorSpecialtyOptions[0]?.key ?? "dentist");
  const [addons, setAddons] = useState<string[]>(["booking_connect"]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const startedRef = useRef(false);
  const liveRef = useRef<HTMLDivElement>(null);
  const openedWaRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DEDUP_KEY) === "1") setSuccess(true);
  }, []);

  useEffect(() => {
    const onSpecialty = (e: Event) => {
      const detail = (e as CustomEvent<{ key: string; label: string }>).detail;
      if (!detail?.label) return;
      setSpecialty(detail.label);
      setSpecialtyKey(detail.key);
    };
    window.addEventListener(DOCTORS_SPECIALTY_EVENT, onSpecialty);
    return () => window.removeEventListener(DOCTORS_SPECIALTY_EVENT, onSpecialty);
  }, []);

  useEffect(() => {
    if (success) liveRef.current?.focus();
  }, [success]);

  const markFormStarted = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackDoctorsEvent("doctors_form_start", { source: "doctors_direct_sale" });
  };

  const selectedSample =
    doctorSpecialtySamples.find(
      (s) =>
        s.key ===
        (doctorSpecialtyOptions.find((o) => o.key === specialtyKey)?.sampleKey ?? "dentist")
    ) ?? doctorSpecialtySamples[0];

  const addonLabels = doctorFormAddons
    .filter((a) => addons.includes(a.key))
    .map((a) => (a.inPackage ? a.label : `${a.label} (نیازمند برآورد)`));

  const businessLabel = businessType === "matab" ? "مطب تک‌پزشک" : "کلینیک";

  const toggleAddon = (key: string) => {
    markFormStarted();
    setAddons((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const goNext = () => {
    setError(null);
    markFormStarted();
    if (step === 1) {
      if (!specialty.trim()) {
        setError("لطفاً تخصص را انتخاب کنید.");
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || success) return;
    setError(null);
    markFormStarted();

    if (sessionStorage.getItem(DEDUP_KEY) === "1") {
      setSuccess(true);
      return;
    }
    if (!name.trim()) {
      setError("لطفاً نام را وارد کنید.");
      return;
    }
    if (!city.trim()) {
      setError("لطفاً شهر را وارد کنید.");
      return;
    }
    if (!isValidIranianMobile(contact)) {
      setError("شماره موبایل معتبر وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const phone = toLatinDigits(contact);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: "medical_website_quote",
          source: "doctors_direct_sale",
          channel: "doctors_landing",
          plan: "medical_site_20m",
          page: "/doctors",
          name: name.trim(),
          contact: phone,
          consent: true,
          specialty: specialty.trim(),
          city: city.trim(),
          business_type: businessType,
          addons: addons.join(","),
          detail: [
            `specialty: ${specialty.trim()}`,
            `city: ${city.trim()}`,
            `business_type: ${businessType}`,
            `addons: ${addons.join(",") || "none"}`,
            `plan: medical_site_20m`,
            `deposit: ${DOCTORS_DEPOSIT_TOMAN}`,
          ].join(" | "),
          company: "",
          referrer: document.referrer || null,
          ...getUtmParams(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : data.error === "invalid_contact"
              ? "شماره موبایل معتبر وارد کنید."
              : "مشکلی در ارسال پیش آمد. دوباره تلاش کنید یا واتساپ بزنید."
        );
        return;
      }

      sessionStorage.setItem(DEDUP_KEY, "1");
      trackDoctorsEvent("doctors_form_submit", {
        source: "doctors_direct_sale",
        specialty: specialtyKey,
        business_type: businessType,
      });
      setSuccess(true);

      if (!openedWaRef.current) {
        openedWaRef.current = true;
        const msg = buildDoctorsWaQuoteMessage({
          specialty,
          city,
          businessType: businessLabel,
          addons: addonLabels,
          name,
        });
        window.open(siteWhatsAppUrl(msg), "_blank", "noopener,noreferrer");
      }
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="quote-form" className="section-py scroll-mt-24 bg-gradient-to-b from-cyan-50/40 to-white">
      <div className="container-mx container-px">
        <SectionHeader
          badge="شروع پروژه"
          badgeClassName="bg-cyan-50 text-cyan-800"
          title="تخصصتان را بفرستید؛ نمونه، زمان‌بندی و مراحل شروع را دریافت کنید"
          subtitle={`پکیج اصلی: ${formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} تومان — شروع با ${formatToman(DOCTORS_DEPOSIT_TOMAN)} تومان`}
        />

        <div className="mx-auto max-w-xl rounded-3xl border border-navy-100 bg-white p-6 shadow-soft sm:p-8">
          {success ? (
            <div ref={liveRef} tabIndex={-1} className="outline-none" role="status">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <IconCheck size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-navy-900">درخواست ثبت شد</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">
                {DOCTORS_SALES_SUCCESS_MESSAGE}
              </p>

              {selectedSample ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-navy-100">
                  <div className="border-b border-navy-50 px-4 py-3">
                    <p className="text-sm font-extrabold text-navy-900">
                      نمونه مرتبط: {selectedSample.label}
                    </p>
                  </div>
                  <div className="p-3">
                    <DoctorDemoPreviewFrames sample={selectedSample} />
                  </div>
                </div>
              ) : null}

              <DoctorsWhatsAppCta
                source="form_success"
                specialty={specialtyKey}
                message={buildDoctorsWaQuoteMessage({
                  specialty,
                  city,
                  businessType: businessLabel,
                  addons: addonLabels,
                  name,
                })}
                fullWidth
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
              >
                ادامه در واتساپ
              </DoctorsWhatsAppCta>

              <a
                href={SITE_PHONE_TEL}
                onClick={() => trackDoctorsEvent("doctors_phone_click", { source: "form_success" })}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 hover:bg-navy-50"
              >
                <IconPhone size={16} />
                تماس مستقیم: {SITE_PHONE_DISPLAY}
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate onFocus={markFormStarted}>
              <div className="mb-6 flex items-center gap-2" aria-label="مراحل فرم">
                {([1, 2, 3] as Step[]).map((s) => (
                  <div
                    key={s}
                    className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-cyan-700" : "bg-navy-100"}`}
                  />
                ))}
              </div>

              {step === 1 ? (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="mb-2 text-sm font-bold text-navy-800">نوع مجموعه</legend>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { key: "matab", label: "مطب تک‌پزشک" },
                          { key: "clinic", label: "کلینیک" },
                        ] as const
                      ).map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setBusinessType(item.key)}
                          className={`rounded-xl px-3 py-3 text-[13px] font-bold ${
                            businessType === item.key
                              ? "bg-cyan-700 text-white"
                              : "bg-navy-50 text-navy-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    {businessType === "clinic" ? (
                      <p className="mt-2 text-[12px] text-navy-500">
                        پکیج ۲۰ میلیونی مخصوص مطب تک‌پزشک است.{" "}
                        <Link href="/website/clinic" className="font-bold text-cyan-800 underline">
                          طراحی سایت کلینیک
                        </Link>
                      </p>
                    ) : null}
                  </fieldset>

                  <div>
                    <label htmlFor="doctors-specialty" className="mb-2 block text-sm font-bold text-navy-800">
                      تخصص
                    </label>
                    <select
                      id="doctors-specialty"
                      value={specialtyKey}
                      onChange={(e) => {
                        const option = doctorSpecialtyOptions.find((o) => o.key === e.target.value);
                        setSpecialtyKey(e.target.value);
                        setSpecialty(option?.label ?? e.target.value);
                      }}
                      className="w-full rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                    >
                      {doctorSpecialtyOptions.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800"
                  >
                    ادامه
                  </button>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="mb-2 text-sm font-bold text-navy-800">امکانات موردنیاز</legend>
                    <div className="space-y-2">
                      {doctorFormAddons.map((addon) => {
                        const checked = addons.includes(addon.key);
                        return (
                          <label
                            key={addon.key}
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                              checked ? "border-cyan-300 bg-cyan-50" : "border-navy-100 bg-white"
                            }`}
                          >
                            <span className="flex items-center gap-2.5 font-semibold text-navy-800">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleAddon(addon.key)}
                                className="h-4 w-4 rounded border-navy-300 text-cyan-700"
                              />
                              {addon.label}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                addon.inPackage ? "text-emerald-700" : "text-amber-700"
                              }`}
                            >
                              {addon.inPackage ? "داخل پکیج" : "نیازمند برآورد"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-xl border border-navy-200 px-4 py-3 text-sm font-bold text-navy-700"
                    >
                      قبلی
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="flex-1 rounded-xl bg-cyan-700 px-6 py-3 text-sm font-extrabold text-white hover:bg-cyan-800"
                    >
                      ادامه
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="doctors-name" className="mb-2 block text-sm font-bold text-navy-800">
                      نام
                    </label>
                    <input
                      id="doctors-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="doctors-city" className="mb-2 block text-sm font-bold text-navy-800">
                      شهر
                    </label>
                    <input
                      id="doctors-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                      autoComplete="address-level2"
                    />
                  </div>
                  <div>
                    <label htmlFor="doctors-phone" className="mb-2 block text-sm font-bold text-navy-800">
                      موبایل
                    </label>
                    <input
                      id="doctors-phone"
                      type="tel"
                      inputMode="numeric"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="۰۹۱۲xxxxxxx"
                      className="w-full rounded-xl border border-navy-200 px-4 py-3 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                      autoComplete="tel"
                    />
                  </div>

                  <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-xl border border-navy-200 px-4 py-3 text-sm font-bold text-navy-700"
                    >
                      قبلی
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-xl bg-cyan-700 px-6 py-3.5 text-sm font-extrabold text-white hover:bg-cyan-800 disabled:opacity-60"
                    >
                      {loading ? "در حال ثبت..." : "دریافت نمونه و شروع پروژه"}
                    </button>
                  </div>
                </div>
              ) : null}

              {error ? (
                <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-[13px] font-medium text-red-700" role="alert">
                  {error}
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
