"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  doctorPackages,
  doctorNeeds,
  formatToman,
  type DoctorNeedKey,
  type DoctorPackageKey,
} from "@/lib/doctorsData";
import { IconCheck, IconPhone } from "@/components/icons";
import SectionHeader from "@/components/home/SectionHeader";
import { SITE_PHONE_DISPLAY, SITE_PHONE_TEL } from "@/lib/siteContact";

const toLatinDigits = (s: string) =>
  s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

const isPhone = (v: string) => /^(\+98|0098|0)?9\d{9}$/.test(toLatinDigits(v).replace(/[\s\-()]/g, ""));
const isTelegram = (v: string) => /^@[a-zA-Z0-9_]{5,32}$/.test(v.trim());

function normalizeContact(raw: string): { kind: "phone" | "telegram" | "invalid"; value: string } {
  const v = String(raw || "").trim();
  if (isPhone(v)) {
    const digits = toLatinDigits(v).replace(/[\s\-()]/g, "");
    return { kind: "phone", value: "0" + digits.replace(/^(\+98|0098|0)?/, "") };
  }
  if (isTelegram(v)) return { kind: "telegram", value: v.toLowerCase() };
  return { kind: "invalid", value: v };
}

type PaymentState = "success" | "failed" | "error" | null;
type FormStep = 1 | 2;

export default function DoctorsPackagesForm() {
  const [selected, setSelected] = useState<DoctorPackageKey>("clinic");
  const [step, setStep] = useState<FormStep>(1);
  const [need, setNeed] = useState<DoctorNeedKey | "">("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "success" || p === "failed" || p === "error") {
      setPayment(p);
      if (p === "success") {
        pushGtmEvent("purchase", { page: "doctors" });
      }
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const pkg = doctorPackages.find((p) => p.key === selected) ?? doctorPackages[1];

  const choosePackage = (key: DoctorPackageKey) => {
    setSelected(key);
    setStep(1);
    setError(null);
    pushGtmEvent("pkg_selected", { package: key, page: "doctors" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!need) {
      setError("لطفاً مهم‌ترین نیاز مطب‌تان را انتخاب کنید.");
      return;
    }
    if (!name.trim()) {
      setError("لطفاً نام‌تان را وارد کنید.");
      return;
    }
    const c = normalizeContact(contact);
    if (c.kind === "invalid") {
      setError("شماره موبایل یا آیدی تلگرام معتبر وارد کنید.");
      return;
    }
    if (!consent) {
      setError("برای تماس، لطفاً رضایت خود را تأیید کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "doctors_multistep",
          page: "/doctors",
          name: name.trim(),
          contact: c.value,
          goal: need,
          plan: selected,
          budget: String(pkg.price),
          channel: "doctors_landing",
          detail:
            `package: ${selected} | name: ${pkg.name} | price: ${pkg.price} | deposit: ${pkg.deposit}` +
            (specialty.trim() ? ` | specialty: ${specialty.trim()}` : ""),
          consent: true,
          referrer: document.referrer || null,
          company: "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "مشکلی در ارسال پیش آمد. دوباره تلاش کنید یا تماس بگیرید."
        );
        return;
      }
      pushGtmEvent("generate_lead", { source: "doctors_multistep", plan: selected, page: "doctors" });
      setStep(2);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const startCheckout = async () => {
    setPaying(true);
    setError(null);
    pushGtmEvent("begin_checkout", { package: selected, page: "doctors" });
    try {
      const res = await fetch("/api/doctors/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selected,
          name: name.trim(),
          contact: normalizeContact(contact).value,
          specialty: specialty.trim() || null,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; redirectUrl?: string };
      if (data.ok && data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      throw new Error("checkout_failed");
    } catch {
      setError("مشکلی در اتصال به درگاه پرداخت پیش آمد. دوباره تلاش کنید یا تماس بگیرید.");
      setPaying(false);
    }
  };

  return (
    <section id="packages" className="section-py bg-gradient-to-b from-white to-sky-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="پکیج‌ها و قیمت"
          badgeClassName="bg-sky-50 text-sky-700"
          title="قیمت شفاف؛ بدون جلسه و چانه‌زنی"
          subtitle="پکیج مناسب مطب‌تان را انتخاب کنید؛ با پرداخت آنلاین پیش‌پرداخت، قیمت قفل می‌شود و پروژه همان روز شروع می‌شود."
        />

        {payment ? (
          <div
            className={`mx-auto mb-8 max-w-2xl rounded-2xl border p-5 text-center text-sm font-bold ${
              payment === "success"
                ? "border-sky-200 bg-sky-50 text-sky-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
            role="status"
          >
            {payment === "success"
              ? "پیش‌پرداخت با موفقیت انجام شد ✓ تیم آرایه در کمتر از ۲ ساعت کاری با شما تماس می‌گیرد."
              : "پرداخت انجام نشد. می‌توانید دوباره تلاش کنید یا با ۰۲۱۲۸۴۲۶۶۹۹ تماس بگیرید."}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          {doctorPackages.map((p) => {
            const isSelected = selected === p.key;
            return (
              <div
                key={p.key}
                className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 transition-all duration-300 ${
                  isSelected
                    ? "border-sky-500 shadow-card -translate-y-1"
                    : "border-navy-100 shadow-soft hover:-translate-y-1 hover:border-sky-200"
                }`}
              >
                {p.popular ? (
                  <span className="absolute -top-3 right-6 rounded-full bg-sky-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-soft">
                    پیشنهاد آرایه
                  </span>
                ) : null}

                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-extrabold text-navy-900">{p.name}</h3>
                  <span className="text-[11px] font-bold text-navy-400">{p.tagline}</span>
                </div>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{p.description}</p>

                <div className="mt-4">
                  <span className="block text-xs text-navy-300 line-through">
                    {formatToman(p.oldPrice)} تومان
                  </span>
                  <span className="text-2xl font-extrabold text-sky-600">
                    {formatToman(p.price)}
                    <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                  </span>
                  <span className="mt-1 block text-[11px] font-bold text-emerald-600">
                    شروع با پیش‌پرداخت {formatToman(p.deposit)} تومان
                  </span>
                </div>

                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-600">
                      <IconCheck size={14} className="mt-1 shrink-0 text-sky-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => choosePackage(p.key)}
                  className={`mt-5 w-full rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-sky-600 text-white hover:bg-sky-700"
                      : "border border-navy-200 bg-white text-navy-700 hover:border-sky-300 hover:text-sky-700"
                  }`}
                >
                  {isSelected ? "انتخاب شد ✓" : "انتخاب پکیج"}
                </button>
              </div>
            );
          })}
        </div>

        <div
          ref={formRef}
          id="lead-form"
          className="mx-auto mt-12 max-w-xl scroll-mt-24 rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
              <div
                className="h-full rounded-full bg-gradient-to-l from-sky-500 to-cyan-400 transition-all duration-300"
                style={{ width: step === 2 ? "100%" : "50%" }}
              />
            </div>
            <span className="rounded-full bg-navy-50 px-3 py-1 text-[11px] font-bold text-navy-500">
              {step === 2 ? "تکمیل شد ✓" : "مرحله ۱ از ۲"}
            </span>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="mb-1 text-base font-extrabold text-navy-900">
                مشخصات مطب‌تان را بگویید
              </h3>
              <p className="mb-5 text-[13px] text-navy-500">
                پکیج انتخابی: <span className="font-bold text-sky-600">{pkg.name}</span>
              </p>

              <fieldset className="mb-5">
                <legend className="mb-2 block text-[13px] font-bold text-navy-700">
                  مهم‌ترین نیاز مطب شما چیست؟ *
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {doctorNeeds.map((n) => (
                    <button
                      key={n.key}
                      type="button"
                      onClick={() => {
                        setNeed(n.key);
                        if (error) setError(null);
                      }}
                      className={`rounded-xl border px-3 py-2.5 text-[12px] font-bold transition-all ${
                        need === n.key
                          ? "border-sky-500 bg-sky-50 text-sky-700"
                          : "border-navy-100 bg-navy-50/50 text-navy-600 hover:border-sky-200"
                      }`}
                    >
                      {n.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mb-4">
                <label htmlFor="doctors-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  نام و نام خانوادگی *
                </label>
                <input
                  id="doctors-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثلاً دکتر مریم سلامت"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="doctors-specialty" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  تخصص / نوع مرکز <span className="font-normal text-navy-400">(اختیاری)</span>
                </label>
                <input
                  id="doctors-specialty"
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder="مثلاً پوست و مو، دندانپزشکی، کلینیک چندتخصصی"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="doctors-contact" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  موبایل یا آیدی تلگرام *
                </label>
                <input
                  id="doctors-contact"
                  type="text"
                  dir="ltr"
                  inputMode="tel"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="09xxxxxxxxx یا @username"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-sky-400 focus:bg-white"
                />
              </div>

              <label className="mb-4 flex cursor-pointer items-start gap-2 text-[12px] leading-relaxed text-navy-500">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (error) setError(null);
                  }}
                  className="mt-0.5 shrink-0 rounded border-navy-200"
                />
                <span>مایلم آرایه برای ارسال پیشنهاد قیمت با من تماس بگیرد.</span>
              </label>

              {error ? (
                <p className="mb-3 text-xs font-bold text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? "در حال ثبت..." : "ثبت درخواست"}
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-600">
                <IconCheck size={30} />
              </div>
              <h3 className="text-lg font-extrabold text-sky-700">درخواست‌تان ثبت شد</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                پکیج <b className="text-navy-800">{pkg.name}</b> را انتخاب کردید. برای قفل‌شدن قیمت
                و شروع همان روز، پیش‌پرداخت را آنلاین انجام دهید یا منتظر تماس تیم ما باشید
                (کمتر از ۲ ساعت کاری).
              </p>

              <div className="mt-5 rounded-2xl border border-navy-100 bg-navy-50/50 p-4 text-right">
                <div className="flex justify-between text-[13px] text-navy-600">
                  <span>پکیج</span>
                  <b>{pkg.name}</b>
                </div>
                <div className="mt-2 flex justify-between text-[13px] text-navy-600">
                  <span>قیمت کل</span>
                  <b>{formatToman(pkg.price)} تومان</b>
                </div>
                <div className="mt-2 flex justify-between border-t border-navy-100 pt-2 text-sm font-extrabold text-sky-700">
                  <span>پیش‌پرداخت رزرو</span>
                  <span>{formatToman(pkg.deposit)} تومان</span>
                </div>
              </div>

              {error ? (
                <p className="mt-3 text-xs font-bold text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={startCheckout}
                disabled={paying}
                className="mt-5 w-full rounded-xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60"
              >
                {paying
                  ? "در حال انتقال به درگاه پرداخت..."
                  : `پرداخت آنلاین امن ${formatToman(pkg.deposit)} تومان`}
              </button>

              <a
                href={SITE_PHONE_TEL}
                onClick={() => pushGtmEvent("phone_click", { location: "doctors_form_success", page: "doctors" })}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
              >
                <IconPhone size={16} />
                ترجیح می‌دهم اول صحبت کنم — {SITE_PHONE_DISPLAY}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
