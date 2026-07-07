"use client";

import { useEffect, useRef, useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import {
  seoPackages,
  seoBundle,
  formatToman,
  type SeoPackageKey,
} from "@/lib/seoData";
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

interface PkgInfo {
  name: string;
  price: number;
}

const allPackages: Record<SeoPackageKey, PkgInfo> = {
  basic: { name: "پایه", price: 890_000 },
  growth: { name: "رشد", price: 1_690_000 },
  pro: { name: "حرفه‌ای", price: 2_900_000 },
  bundle: { name: seoBundle.name, price: seoBundle.price },
};

type PaymentState = "success" | "failed" | "error" | null;

export default function SeoPackagesForm() {
  const [selected, setSelected] = useState<SeoPackageKey>("growth");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bizName, setBizName] = useState("");
  const [website, setWebsite] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState<PaymentState>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // نتیجه بازگشت از درگاه زیبال (?payment=success|failed|error)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "success" || p === "failed" || p === "error") {
      setPayment(p);
      if (p === "success") {
        pushGtmEvent("purchase", { page: "seo" });
      }
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const pkg = allPackages[selected];

  const choosePackage = (key: SeoPackageKey) => {
    setSelected(key);
    setStep(2);
    setError(null);
    pushGtmEvent(key === "bundle" ? "bundle_selected" : "pkg_selected", {
      package: key,
      page: "seo",
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!bizName.trim()) {
      setError("لطفاً نام کسب‌وکار را وارد کنید.");
      return;
    }
    const c = normalizeContact(contact);
    if (c.kind === "invalid") {
      setError("شماره موبایل یا آیدی تلگرام معتبر وارد کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "seo_multistep",
          page: "/seo",
          name: bizName.trim(),
          contact: c.value,
          goal: "seo_service",
          plan: selected,
          budget: String(pkg.price),
          channel: "seo_landing",
          detail:
            `package: ${selected} | name: ${pkg.name} | price: ${pkg.price}` +
            (website.trim() ? ` | website: ${website.trim()}` : ""),
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
      pushGtmEvent("generate_lead", { source: "seo_multistep", plan: selected, page: "seo" });
      setStep(3);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const startCheckout = async () => {
    setPaying(true);
    setError(null);
    pushGtmEvent("begin_checkout", { package: selected, page: "seo" });
    try {
      const res = await fetch("/api/seo/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package: selected,
          amount: pkg.price,
          name: bizName.trim(),
          contact: normalizeContact(contact).value,
          website: website.trim() || null,
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
    <section id="packages" className="section-py bg-gradient-to-b from-white to-teal-50/40">
      <div className="container-mx container-px">
        <SectionHeader
          badge="شروع همکاری"
          badgeClassName="bg-teal-50 text-teal-700"
          title="پکیجی متناسب با مرحله رشد کسب‌وکار"
          subtitle="از شروع مسیر لید تا سیستم کامل سرچ تا CRM — پیشنهاد قیمت دریافت کنید."
        />

        {payment ? (
          <div
            className={`mx-auto mb-8 max-w-2xl rounded-2xl border p-5 text-center text-sm font-bold ${
              payment === "success"
                ? "border-teal-200 bg-teal-50 text-teal-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
            role="status"
          >
            {payment === "success"
              ? "پرداخت با موفقیت انجام شد ✓ تیم آرایه در کمتر از ۲ ساعت کاری با شما تماس می‌گیرد."
              : "پرداخت انجام نشد. می‌توانید دوباره تلاش کنید یا با ۰۲۱۲۸۴۲۶۶۹۹ تماس بگیرید."}
          </div>
        ) : null}

        {/* Packages grid */}
        <div className="grid gap-5 lg:grid-cols-3">
          {seoPackages.map((p) => {
            const isSelected = selected === p.key;
            return (
              <div
                key={p.key}
                className={`relative flex flex-col rounded-3xl border-2 bg-white p-6 transition-all duration-300 ${
                  isSelected
                    ? "border-teal-500 shadow-card -translate-y-1"
                    : "border-navy-100 shadow-soft hover:-translate-y-1 hover:border-teal-200"
                }`}
              >
                {p.popular ? (
                  <span className="absolute -top-3 right-6 rounded-full bg-teal-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-soft">
                    محبوب‌ترین
                  </span>
                ) : null}

                <h3 className="text-base font-extrabold text-navy-900">{p.name}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-navy-500">{p.description}</p>

                <div className="mt-4">
                  <span className="block text-xs text-navy-300 line-through">
                    {formatToman(p.oldPrice)} تومان
                  </span>
                  <span className="text-2xl font-extrabold text-teal-600">
                    {formatToman(p.price)}
                    <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
                  </span>
                </div>

                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-relaxed text-navy-600">
                      <IconCheck size={14} className="mt-1 shrink-0 text-teal-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => choosePackage(p.key)}
                  className={`mt-5 w-full rounded-xl px-5 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
                    isSelected
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "border border-navy-200 bg-white text-navy-700 hover:border-teal-300 hover:text-teal-700"
                  }`}
                >
                  {isSelected ? "انتخاب شد ✓" : "دریافت پیشنهاد قیمت"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Bundle cross-sell */}
        <div className="mx-auto mt-8 max-w-2xl rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-amber-50 to-white p-7 text-center shadow-soft">
          <span className="badge mb-3 bg-amber-100 text-amber-700">پیشنهاد ویژه کسب‌وکار محلی</span>
          <h3 className="text-lg font-extrabold text-navy-900">{seoBundle.name}</h3>
          <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-navy-500">
            {seoBundle.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {seoBundle.items.map((item) => (
              <span
                key={item}
                className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-navy-600 shadow-soft"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <span className="text-sm text-navy-300 line-through">
              {formatToman(seoBundle.oldPrice)} تومان
            </span>
            <span className="mr-3 text-2xl font-extrabold text-amber-600">
              {formatToman(seoBundle.price)}
              <small className="mr-1 text-xs font-medium text-navy-400">تومان</small>
            </span>
          </div>
          <button
            type="button"
            onClick={() => choosePackage("bundle")}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-[0.98]"
          >
            {selected === "bundle" ? "انتخاب شد ✓" : "انتخاب پکیج ترکیبی"}
          </button>
        </div>

        {/* Multistep form */}
        <div
          ref={formRef}
          id="lead-form"
          className="mx-auto mt-12 max-w-xl scroll-mt-24 rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8"
        >
          {/* Progress */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
              <div
                className="h-full rounded-full bg-gradient-to-l from-teal-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
            <span className="rounded-full bg-navy-50 px-3 py-1 text-[11px] font-bold text-navy-500">
              {step === 3 ? "تکمیل شد ✓" : `مرحله ${step === 1 ? "۱" : "۲"} از ۳`}
            </span>
          </div>

          {step === 1 ? (
            <div className="text-center">
              <h3 className="text-base font-extrabold text-navy-900">
                پکیج انتخابی: <span className="text-teal-600">{pkg.name}</span>
              </h3>
              <p className="mt-2 text-[13px] text-navy-500">
                از بالا پکیج را انتخاب کن یا با همین انتخاب ادامه بده.
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-5 w-full rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-[0.98]"
              >
                ادامه با پکیج {pkg.name}
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <form onSubmit={handleSubmit} noValidate>
              <h3 className="mb-5 text-base font-extrabold text-navy-900">
                مشخصات کسب‌وکارت را بگو
              </h3>

              <div className="mb-4">
                <label htmlFor="seo-biz-name" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  نام کسب‌وکار *
                </label>
                <input
                  id="seo-biz-name"
                  type="text"
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  placeholder="مثلاً کلینیک دندانپزشکی مهر"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="seo-website" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  آدرس سایت <span className="font-normal text-navy-400">(اختیاری)</span>
                </label>
                <input
                  id="seo-website"
                  type="url"
                  dir="ltr"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="example.com"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="seo-contact" className="mb-1.5 block text-[13px] font-bold text-navy-700">
                  موبایل یا آیدی تلگرام *
                </label>
                <input
                  id="seo-contact"
                  type="text"
                  dir="ltr"
                  inputMode="tel"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="09xxxxxxxxx یا @username"
                  className="w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-left text-sm text-navy-900 outline-none transition focus:border-teal-400 focus:bg-white"
                />
              </div>

              {error ? (
                <p className="mb-3 text-xs font-bold text-red-600" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-navy-200 px-5 py-3 text-sm font-bold text-navy-600 transition-colors hover:bg-navy-50"
                >
                  بازگشت
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
                >
                  {submitting ? "در حال ثبت..." : "ثبت درخواست"}
                </button>
              </div>
            </form>
          ) : null}

          {step === 3 ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-600">
                <IconCheck size={30} />
              </div>
              <h3 className="text-lg font-extrabold text-teal-700">درخواستت ثبت شد</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-navy-500">
                پکیج <b className="text-navy-800">{pkg.name}</b> را انتخاب کردی. برای شروع همان روز،
                پرداخت آنلاین را انجام بده یا منتظر تماس تیم ما باش (کمتر از ۲ ساعت کاری).
              </p>

              <div className="mt-5 rounded-2xl border border-navy-100 bg-navy-50/50 p-4 text-right">
                <div className="flex justify-between text-[13px] text-navy-600">
                  <span>پکیج</span>
                  <b>{pkg.name}</b>
                </div>
                <div className="mt-2 flex justify-between border-t border-navy-100 pt-2 text-sm font-extrabold text-teal-700">
                  <span>مبلغ قابل پرداخت</span>
                  <span>{formatToman(pkg.price)} تومان</span>
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
                className="mt-5 w-full rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-[0.98] disabled:opacity-60"
              >
                {paying ? "در حال انتقال به درگاه پرداخت..." : `پرداخت آنلاین امن ${formatToman(pkg.price)} تومان`}
              </button>

              <a
                href="tel:02128426699"
                onClick={() => pushGtmEvent("phone_click", { location: "seo_form_success", page: "seo" })}
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
