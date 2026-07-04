"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  googlesabtPackages,
  formatToman,
  type GooglesabtPackageKey,
} from "@/lib/googlesabtData";
import { IconCheck, IconPhone } from "@/components/icons";
import SectionHeader from "@/components/home/SectionHeader";

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

export default function GooglesabtPackagesForm() {
  const [selected, setSelected] = useState<GooglesabtPackageKey>("popular");
  const [step, setStep] = useState<FormStep>(1);
  const [businessName, setBusinessName] = useState("");
  const [contact, setContact] = useState("");
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(null);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("payment");
    if (p === "success" || p === "failed" || p === "error") {
      setPayment(p);
      if (p === "success") {
        pushGtmEvent("purchase", { page: "googlesabt" });
      }
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const from = params.get("from");
    const pkgParam = params.get("package") as GooglesabtPackageKey | null;
    if (from === "bizcard" || pkgParam === "popular") {
      setSelected("popular");
    }
  }, []);

  const pkg = googlesabtPackages.find((p) => p.key === selected) ?? googlesabtPackages[1];

  const choosePackage = (key: GooglesabtPackageKey) => {
    setSelected(key);
    setStep(1);
    setError(null);
    pushGtmEvent("pkg_selected", { package: key, page: "googlesabt" });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!businessName.trim()) {
      setError("لطفاً نام کسب‌وکار را وارد کنید.");
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
          source: "googlesabt_multistep",
          page: "/googlesabt",
          name: businessName.trim(),
          contact: c.value,
          goal: "map_register",
          plan: selected,
          budget: String(pkg.price),
          channel: "googlesabt_landing",
          detail:
            `package: ${selected} | name: ${pkg.name} | price: ${pkg.price} | deposit: ${pkg.deposit}` +
            ` | includesBizcard: ${pkg.includesBizcard}`,
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
      pushGtmEvent("generate_lead", { source: "googlesabt_multistep", plan: selected, page: "googlesabt" });
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
    pushGtmEvent("begin_checkout", { package: selected, page: "googlesabt" });
    try {
      const res = await fetch("/api/googlesabt/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selected,
          businessName: businessName.trim(),
          contact: normalizeContact(contact).value,
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
    <section id="packages" className="section-py bg-gradient-to-b from-white to-blue-50/30">
      <div className="container-mx container-px">
        <SectionHeader
          badge="پکیج‌ها و قیمت"
          badgeClassName="bg-blue-50 text-[#4285F4]"
          title="ثبت نقشه + لینک همه‌کاره — ۳ پکیج شفاف"
          subtitle="پکیج مناسب را انتخاب کنید؛ با پیش‌پرداخت آنلاین قیمت قفل می‌شود و ثبت همان روز شروع می‌شود. از پکیج محبوب، لینک BizCard با همه مسیریاب‌ها تحویل می‌گیرید."
        />

        {payment ? (
          <div
            className={`mx-auto mb-8 max-w-2xl rounded-2xl border p-5 text-center text-sm font-bold ${
              payment === "success"
                ? "border-blue-200 bg-blue-50 text-[#1b6ef3]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
            role="status"
          >
            {payment === "success"
              ? "پیش‌پرداخت با موفقیت انجام شد ✓ تیم آرایه در کمتر از ۲ ساعت کاری با شما تماس می‌گیرد تا ثبت نقشه و (در صورت پکیج محبوب+) ساخت لینک BizCard را شروع کند."
              : "پرداخت انجام نشد. می‌توانید دوباره تلاش کنید یا با ۰۲۱۲۸۴۲۶۶۹۹ تماس بگیرید."}
          </div>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-3">
          {googlesabtPackages.map((p) => {
            const isSelected = selected === p.key;
            return (
              <div
                key={p.key}
                className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 transition-all duration-300 ${
                  isSelected
                    ? "border-[#4285F4] shadow-card -translate-y-1"
                    : "border-navy-100 shadow-soft hover:-translate-y-1 hover:border-blue-200"
                }`}
              >
                {p.popular ? (
                  <span className="absolute -top-3 right-6 rounded-full bg-[#34A853] px-3.5 py-1 text-[11px] font-bold text-white shadow-soft">
                    محبوب ⭐
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
                  <span className="text-2xl font-extrabold text-[#34A853]">
                    {formatToman(p.price)}
                    <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                  </span>
                  <span className="mt-1 block text-[11px] font-bold text-[#4285F4]">
                    شروع با پیش‌پرداخت {formatToman(p.deposit)} تومان
                  </span>
                </div>

                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-600">
                      <IconCheck size={14} className="mt-1 shrink-0 text-[#34A853]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => choosePackage(p.key)}
                  className={`mt-5 w-full rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-[#4285F4] text-white hover:bg-[#1b6ef3]"
                      : "border border-navy-200 bg-white text-navy-700 hover:border-blue-300 hover:text-[#4285F4]"
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
                className="h-full rounded-full bg-gradient-to-l from-[#4285F4] to-[#34A853] transition-all duration-300"
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
                اطلاعات کسب‌وکار را وارد کنید
              </h3>
              <p className="mb-5 text-[13px] text-navy-500">
                پکیج انتخابی: <span className="font-bold text-[#4285F4]">{pkg.name}</span>
                {pkg.includesBizcard ? (
                  <span className="mr-2 text-[#34A853]"> — شامل لینک BizCard</span>
                ) : null}
              </p>

              <div className="mb-4">
                <label htmlFor="gs-biz-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  نام کسب‌وکار *
                </label>
                <input
                  id="gs-biz-name"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="مثلاً کافه ارکیده"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-[#4285F4] focus:bg-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="gs-contact" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  موبایل یا آیدی تلگرام *
                </label>
                <input
                  id="gs-contact"
                  type="text"
                  dir="ltr"
                  inputMode="tel"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="09xxxxxxxxx یا @username"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-[#4285F4] focus:bg-white"
                />
                <p className="mt-1.5 text-[11px] text-navy-400">
                  کارشناس ما در کمتر از ۲ ساعت با همین راه ارتباطی تماس می‌گیرد.
                </p>
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
                <span>مایلم آرایه برای ثبت نقشه و تحویل لینک با من تماس بگیرد.</span>
              </label>

              {error ? (
                <p className="mb-3 text-xs font-bold text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#4285F4] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#1b6ef3] active:scale-[0.98] disabled:opacity-60"
              >
                {submitting ? "در حال ثبت..." : "ثبت درخواست"}
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-green-100 text-[#34A853]">
                <IconCheck size={30} />
              </div>
              <h3 className="text-lg font-extrabold text-[#4285F4]">درخواست‌تان ثبت شد</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                پکیج <b className="text-navy-800">{pkg.name}</b> را انتخاب کردید.
                {pkg.includesBizcard
                  ? " بعد از پرداخت، تیم ما نقشه‌ها را ثبت و لینک BizCard با همه مسیریاب‌ها را فعال می‌کند."
                  : " بعد از پرداخت، تیم ما ثبت در نقشه‌ها را شروع می‌کند."}
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
                <div className="mt-2 flex justify-between border-t border-navy-100 pt-2 text-sm font-extrabold text-[#4285F4]">
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
                className="mt-5 w-full rounded-xl bg-[#4285F4] px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-[#1b6ef3] active:scale-[0.98] disabled:opacity-60"
              >
                {paying
                  ? "در حال انتقال به درگاه پرداخت..."
                  : `پرداخت آنلاین امن ${formatToman(pkg.deposit)} تومان`}
              </button>

              <a
                href="tel:02128426699"
                onClick={() => pushGtmEvent("phone_click", { location: "googlesabt_form_success", page: "googlesabt" })}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy-200 px-6 py-3 text-sm font-bold text-navy-700 transition-colors hover:bg-navy-50"
              >
                <IconPhone size={16} />
                ترجیح می‌دهم اول صحبت کنم — ۰۲۱۲۸۴۲۶۶۹۹
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
