"use client";

import { useMemo, useRef, useState } from "react";
import GrowthToolLeadCapture from "./GrowthToolLeadCapture";
import GrowthToolServiceCta from "./GrowthToolServiceCta";
import { trackGrowthToolEvent } from "@/lib/analytics/growthToolsEvents";

type CheckItem = { id: string; label: string; fix: string };

const BASE_CHECKS: CheckItem[] = [
  { id: "profile", label: "پروفایل کسب‌وکار در گوگل یا نقشه‌ها ثبت شده", fix: "پروفایل را ثبت و مالکیت آن را تأیید کنید." },
  { id: "nap", label: "نام، آدرس و تلفن در سایت و نقشه‌ها یکسان است", fix: "NAP را در تمام کانال‌ها دقیقاً یکسان کنید." },
  { id: "category", label: "دسته‌بندی اصلی و فرعی درست انتخاب شده", fix: "دسته‌ای را انتخاب کنید که دقیقاً خدمت اصلی شما را توصیف می‌کند." },
  { id: "hours", label: "ساعت کاری و روزهای تعطیل به‌روز است", fix: "ساعت عادی و تعطیلات مناسبتی را کامل کنید." },
  { id: "photos", label: "حداقل ۱۰ عکس واقعی و باکیفیت دارید", fix: "عکس محیط، تیم، تابلو و خدمات را با نام مناسب اضافه کنید." },
  { id: "reviews", label: "نظرهای جدید دارید و به آن‌ها پاسخ می‌دهید", fix: "برای دریافت نظر واقعی فرایند ثابت بسازید و به همه پاسخ دهید." },
  { id: "website", label: "وب‌سایت سریع و سازگار با موبایل دارید", fix: "سرعت موبایل و مسیر تماس/رزرو سایت را اصلاح کنید." },
  { id: "local-page", label: "صفحه‌ای برای خدمت و منطقه هدف دارید", fix: "یک صفحه مفید با خدمت، منطقه، مدارک اعتماد و FAQ بسازید." },
  { id: "schema", label: "اسکیما LocalBusiness یا نوع تخصصی روی سایت فعال است", fix: "اسکیما معتبر شامل نام، آدرس، تلفن و ساعت کاری اضافه کنید." },
  { id: "tracking", label: "تماس، فرم، مسیریابی و ورودی ارگانیک را اندازه می‌گیرید", fix: "GA4، Search Console و رویدادهای تماس/فرم را فعال کنید." },
];

const INDUSTRY_EXTRA: Record<string, CheckItem> = {
  general: {
    id: "industry",
    label: "خدمت اصلی، محدوده پوشش و مسیر تماس در پروفایل و سایت روشن است",
    fix: "خدمت اصلی، منطقه هدف و CTA تماس/رزرو را در پروفایل و سایت شفاف کنید.",
  },
  doctor: {
    id: "industry",
    label: "تخصص، شماره نظام پزشکی و مسیر نوبت‌دهی روشن است",
    fix: "تخصص، مدارک حرفه‌ای و CTA نوبت را شفاف نمایش دهید.",
  },
  clinic: {
    id: "industry",
    label: "خدمات، پزشکان و مسیر نوبت هر بخش مشخص است",
    fix: "برای خدمات اصلی و پزشکان صفحات روشن و قابل رزرو بسازید.",
  },
  dentist: {
    id: "industry",
    label: "خدمات دندانپزشکی و نمونه‌کارها با رضایت بیمار مشخص است",
    fix: "صفحات خدمات و نمونه‌های مجاز و واقعی را تکمیل کنید.",
  },
  lawyer: {
    id: "industry",
    label: "حوزه‌های وکالت و اطلاعات اعتماد حرفه‌ای روشن است",
    fix: "حوزه‌های تخصص، سوابق و روش رزرو مشاوره را شفاف کنید.",
  },
  restaurant: {
    id: "industry",
    label: "منوی متنی، رزرو و اطلاعات شعبه در دسترس است",
    fix: "منوی قابل خواندن برای گوگل و اطلاعات هر شعبه را اضافه کنید.",
  },
};

export default function LocalSeoReadinessTool({ industry = "doctor" }: { industry?: string }) {
  const checks = useMemo(
    () => [...BASE_CHECKS, INDUSTRY_EXTRA[industry] ?? INDUSTRY_EXTRA.general],
    [industry],
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const started = useRef(false);
  const score = Math.round((selected.length / checks.length) * 100);
  const missing = checks.filter((item) => !selected.includes(item.id));
  const topFixes = missing.slice(0, 3);

  function toggle(id: string) {
    if (!started.current) {
      started.current = true;
      trackGrowthToolEvent("start", "local_seo_check", industry);
    }
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setSubmitted(false);
  }

  function calculate() {
    setSubmitted(true);
    trackGrowthToolEvent("complete", "local_seo_check", industry, { score });
  }

  const level = score >= 80 ? "آماده رشد" : score >= 55 ? "نیازمند بهبود" : "نیازمند اقدام فوری";

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-navy-100 bg-white p-5 shadow-card sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-navy-900">چک‌لیست ۱۱ مرحله‌ای سئو محلی</h3>
          <p className="mt-1 text-sm text-navy-500">هر موردی که اکنون انجام داده‌اید علامت بزنید.</p>
        </div>
        <span className="rounded-full bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700">
          {selected.length} از {checks.length}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {checks.map((item) => (
          <label
            key={item.id}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
              selected.includes(item.id) ? "border-emerald-300 bg-emerald-50" : "border-navy-100 hover:border-brand-200"
            }`}
          >
            <input
              type="checkbox"
              checked={selected.includes(item.id)}
              onChange={() => toggle(item.id)}
              className="mt-1 h-4 w-4 accent-emerald-600"
            />
            <span className="text-sm font-bold leading-6 text-navy-800">{item.label}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={calculate}
        className="mt-6 w-full rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-700"
      >
        محاسبه امتیاز سئو محلی
      </button>

      {submitted ? (
        <div className="mt-6 space-y-5" aria-live="polite">
          <div className="rounded-2xl bg-navy-900 p-5 text-white">
            <p className="text-sm font-bold text-white/70">امتیاز آمادگی شما</p>
            <div className="mt-2 flex items-end gap-3">
              <strong className="text-4xl">{score}</strong>
              <span className="pb-1 text-sm font-bold">از ۱۰۰ — {level}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-navy-900">۳ اقدام اولویت‌دار</h4>
            {topFixes.length ? (
              <ol className="mt-3 space-y-3">
                {topFixes.map((item, index) => (
                  <li key={item.id} className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-navy-700">
                    <span className="font-extrabold text-amber-700">{index + 1}</span>
                    <span>{item.fix}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                همه موارد پایه تکمیل است؛ حالا کیفیت اجرا و جایگاه رقبا را بررسی کنید.
              </p>
            )}
          </div>

          {!unlocked && missing.length > 3 ? (
            <GrowthToolLeadCapture
              tool="local_seo_check"
              industry={industry}
              detail={`score=${score} | completed=${selected.join(",")} | missing=${missing.map((item) => item.id).join(",")}`}
              onSuccess={() => setUnlocked(true)}
            />
          ) : null}

          {unlocked || missing.length <= 3 ? (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/40 p-5">
              <h4 className="text-sm font-extrabold text-navy-900">گزارش کامل اقدامات</h4>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-navy-700">
                {(missing.length ? missing : checks).map((item) => (
                  <li key={item.id}>• {missing.length ? item.fix : `${item.label}: تکمیل شده`}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <GrowthToolServiceCta tool="local_seo_check" industry={industry} />
        </div>
      ) : null}
    </div>
  );
}
