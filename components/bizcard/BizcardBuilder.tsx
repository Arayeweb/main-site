"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pushGtmEvent } from "@/lib/gtm";
import BizcardPreview, { bizcardThemes } from "@/components/bizcard/BizcardPreview";
import type { BizcardTheme } from "@/lib/bizcardData";
import { IconCheck } from "@/components/icons";

type Screen = "form" | "done" | "questions" | "suggestion" | "final";

interface CardState {
  id: string;
  slug: string;
  link: string;
}

interface Suggestion {
  service: string;
  icon: string;
  title: string;
  text: string;
  cta: string;
  ctaLink?: string;
}

const inputClass =
  "w-full rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-brand-400 focus:bg-white";

export default function BizcardBuilder() {
  const [screen, setScreen] = useState<Screen>("form");
  const [theme, setTheme] = useState<BizcardTheme>(bizcardThemes[0]);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [card, setCard] = useState<CardState>({ id: "", slug: "", link: "" });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [siteUrl, setSiteUrl] = useState("");
  const [suggested, setSuggested] = useState<Suggestion | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    business_name: "",
    category: "",
    city: "",
    phone: "",
    whatsapp: "",
    instagram: "",
    telegram: "",
    website: "",
    hours: "",
    address: "",
    maps_url: "",
    neshan_url: "",
    balad_url: "",
  });

  const setField = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const previewData = {
    businessName: form.business_name,
    category: form.category,
    phone: form.phone,
    address: form.address,
    mapsUrl: form.maps_url,
    logoPreview,
    theme,
  };

  const removeAvatar = useCallback(() => {
    setUploadedUrl("");
    setLogoPreview(null);
    setUploadStatus("");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFile = async (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      setError("حجم فایل بیش از ۳ مگابایت است.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(String(e.target?.result || ""));
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadStatus("در حال آپلود...");
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/bizcards/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      setUploading(false);
      if (data.ok && data.url) {
        setUploadedUrl(data.url);
        setUploadStatus("✓ آپلود شد");
      } else {
        setUploadStatus("خطا در آپلود");
        setError(data.error || "خطا در آپلود تصویر");
      }
    } catch {
      setUploading(false);
      setUploadStatus("خطا در اتصال");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (uploading) {
      setError("لطفاً منتظر بمانید تا آپلود تصویر کامل شود.");
      return;
    }
    if (!form.business_name.trim() || !form.category.trim() || !form.city.trim() || !form.phone.trim()) {
      setError("لطفاً فیلدهای ستاره‌دار را پر کنید.");
      return;
    }

    const body: Record<string, string> = { theme_color: theme.key };
    (Object.keys(form) as (keyof typeof form)[]).forEach((k) => {
      const v = form[k].trim();
      if (v) body[k] = v;
    });
    if (uploadedUrl) body.logo_url = uploadedUrl;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bizcards/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; id?: string; slug?: string; error?: string };
      if (!data.ok || !data.slug) {
        setError(
          data.error === "missing_name"
            ? "لطفاً نام کسب‌وکار را وارد کنید."
            : "مشکلی در ساخت کارت پیش آمد. دوباره تلاش کنید."
        );
        return;
      }
      const link = `${window.location.origin}/b/${data.slug}`;
      setCard({ id: data.id || "", slug: data.slug, link });
      pushGtmEvent("generate_lead", { source: "bizcard_create", page: "bizcard" });
      setScreen("done");
    } catch {
      setError("خطا در اتصال — دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const computeSuggestion = (): Suggestion => {
    if (answers.has_site === "no") {
      return {
        service: "website",
        icon: "🌐",
        title: "کارت شما آماده شد — حالا یک قدم جلوتر",
        text: "برای دیده‌شدن در گوگل، فقط کارت کافی نیست. پیشنهاد ما: سایت معرفی سریع کسب‌وکار.",
        cta: "درخواست طراحی سایت",
      };
    }
    if (answers.has_googlemap === "no" || answers.has_googlemap === "unknown") {
      return {
        service: "googlemap",
        icon: "📍",
        title: "کارت شما آماده شد",
        text: "اگر مشتری اسم کسب‌وکارتان را در گوگل سرچ کند، باید گوگل‌مپ هم درست ثبت شده باشد. پکیج محبوب: ثبت ۵ نقشه + همه مسیریاب‌ها روی لینک BizCard.",
        cta: "ثبت حرفه‌ای در گوگل‌مپ",
        ctaLink: "/googlesabt?from=bizcard&package=popular#packages",
      };
    }
    return {
      service: "seo",
      icon: "🔎",
      title: "کارت شما آماده شد",
      text: "می‌توانیم سایت شما را رایگان بررسی کنیم و بگوییم چرا از گوگل مشتری نمی‌گیرید.",
      cta: "درخواست بررسی سئو",
    };
  };

  const postLead = async (service: string | null) => {
    const payload: Record<string, unknown> = {
      bizcard_id: card.id || undefined,
      slug: card.slug || undefined,
      business_name: form.business_name.trim(),
      phone: form.phone.trim(),
      category: form.category.trim(),
      city: form.city.trim(),
    };
    if (answers.has_site === "yes") payload.has_site = true;
    if (answers.has_site === "no") payload.has_site = false;
    if (siteUrl.trim()) payload.site_url = siteUrl.trim();
    if (answers.has_googlemap) payload.has_googlemap = answers.has_googlemap;
    if (answers.wants_google === "yes") payload.wants_google = true;
    if (answers.wants_google === "no") payload.wants_google = false;
    if (answers.wants_review === "yes") payload.wants_review = true;
    if (answers.wants_review === "no") payload.wants_review = false;
    if (service) payload.requested_service = service;

    await fetch("/api/bizcards/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const resetAll = () => {
    setScreen("form");
    setForm({
      business_name: "",
      category: "",
      city: "",
      phone: "",
      whatsapp: "",
      instagram: "",
      telegram: "",
      website: "",
      hours: "",
      address: "",
      maps_url: "",
      neshan_url: "",
      balad_url: "",
    });
    removeAvatar();
    setTheme(bizcardThemes[0]);
    setAnswers({});
    setSiteUrl("");
    setSuggested(null);
    setCard({ id: "", slug: "", link: "" });
    setError(null);
  };

  const copyLink = async () => {
    if (!card.link) return;
    try {
      await navigator.clipboard.writeText(card.link);
    } catch {
      window.prompt("لینک کارت:", card.link);
    }
  };

  const qrUrl = card.link
    ? `https://api.qrserver.com/v1/create-qr-code/?size=340x340&margin=8&data=${encodeURIComponent(card.link)}`
    : "";

  useEffect(() => {
    if (screen !== "form") {
      document.getElementById("builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [screen]);

  return (
    <section id="builder" className="section-py scroll-mt-24 bg-white">
      <div className="container-mx container-px">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-card sm:p-8">
            {screen === "form" ? (
              <>
                <h2 className="text-xl font-extrabold text-navy-900">کارت ویزیت رایگان بساز</h2>
                <p className="mt-1 text-[13px] text-navy-500">
                  چند فیلد کوتاه — لینک اختصاصی و QR کد همین الان فعال می‌شود.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5" id="bizForm">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">اطلاعات کسب‌وکار</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">نام کسب‌وکار *</label>
                      <input
                        className={inputClass}
                        value={form.business_name}
                        onChange={(e) => setField("business_name", e.target.value)}
                        placeholder="مثلاً کافه آریا"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">صنف *</label>
                      <input
                        className={inputClass}
                        value={form.category}
                        onChange={(e) => setField("category", e.target.value)}
                        placeholder="رستوران / پزشک / سالن زیبایی"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">شهر *</label>
                      <input
                        className={inputClass}
                        value={form.city}
                        onChange={(e) => setField("city", e.target.value)}
                        placeholder="تهران"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">شماره تماس *</label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.phone}
                        onChange={(e) => setField("phone", e.target.value)}
                        placeholder="09121234567"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">
                        واتساپ <span className="font-normal text-navy-400">(اختیاری)</span>
                      </label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.whatsapp}
                        onChange={(e) => setField("whatsapp", e.target.value)}
                        placeholder="09121234567"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">
                        اینستاگرام <span className="font-normal text-navy-400">(اختیاری)</span>
                      </label>
                      <input
                        className={inputClass}
                        value={form.instagram}
                        onChange={(e) => setField("instagram", e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">
                        تلگرام <span className="font-normal text-navy-400">(اختیاری)</span>
                      </label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.telegram}
                        onChange={(e) => setField("telegram", e.target.value)}
                        placeholder="@username"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">
                        وب‌سایت <span className="font-normal text-navy-400">(اختیاری)</span>
                      </label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        type="url"
                        value={form.website}
                        onChange={(e) => setField("website", e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">
                        ساعات کاری <span className="font-normal text-navy-400">(اختیاری)</span>
                      </label>
                      <input
                        className={inputClass}
                        value={form.hours}
                        onChange={(e) => setField("hours", e.target.value)}
                        placeholder="شنبه تا پنجشنبه ۹ تا ۱۸"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">آدرس</label>
                      <input
                        className={inputClass}
                        value={form.address}
                        onChange={(e) => setField("address", e.target.value)}
                        placeholder="تهران، خیابان ولیعصر، پلاک ۱۲"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">لینک گوگل مپ</label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.maps_url}
                        onChange={(e) => setField("maps_url", e.target.value)}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">لینک نشان</label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.neshan_url}
                        onChange={(e) => setField("neshan_url", e.target.value)}
                        placeholder="https://neshan.org/..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-bold text-navy-700">لینک بلد</label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={form.balad_url}
                        onChange={(e) => setField("balad_url", e.target.value)}
                        placeholder="https://balad.ir/..."
                      />
                    </div>
                  </div>

                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">ظاهر کارت</p>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-navy-700">لوگو / تصویر</label>
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-navy-200 p-4 text-right transition hover:border-brand-300 hover:bg-brand-50/30"
                    >
                      {logoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoPreview} alt="" className="h-14 w-14 rounded-xl object-cover" />
                      ) : (
                        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-navy-50 text-2xl">📷</span>
                      )}
                      <span className="text-sm text-navy-500">
                        {uploadStatus || "انتخاب یا کشیدن تصویر — حداکثر ۳MB"}
                      </span>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleFile(f);
                      }}
                    />
                    {logoPreview ? (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="mt-2 text-xs font-bold text-red-500"
                      >
                        حذف تصویر
                      </button>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-bold text-navy-700">رنگ کارت</label>
                    <div className="flex flex-wrap gap-2">
                      {bizcardThemes.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          title={t.label}
                          onClick={() => setTheme(t)}
                          className={`h-8 w-8 rounded-full border-2 transition ${
                            theme.key === t.key ? "scale-110 border-navy-800" : "border-transparent"
                          }`}
                          style={{ background: `linear-gradient(135deg, ${t.brand}, ${t.deep})` }}
                        />
                      ))}
                    </div>
                  </div>

                  {error ? (
                    <p className="text-xs font-bold text-red-600" role="alert">
                      {error}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-brand-600 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
                  >
                    {submitting ? "در حال ساخت..." : "ساخت کارت ویزیت ←"}
                  </button>
                </form>
              </>
            ) : null}

            {screen === "done" ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
                  🎉
                </div>
                <h3 className="text-xl font-extrabold text-emerald-700">کارت ویزیت شما آماده است!</h3>
                <p className="mt-2 text-sm text-navy-500">لینک اختصاصی فعال است — برای مشتریانت بفرست.</p>

                <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-3">
                  <a href={card.link} target="_blank" rel="noopener noreferrer" className="flex-1 break-all text-left text-sm font-bold text-brand-600">
                    {card.link}
                  </a>
                  <button type="button" onClick={copyLink} className="shrink-0 rounded-lg bg-brand-50 px-3 py-2 text-xs font-bold text-brand-600">
                    کپی
                  </button>
                </div>

                {qrUrl ? (
                  <div className="mx-auto mt-4 inline-block rounded-xl border border-emerald-200 bg-white p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrUrl} alt="QR کارت" className="h-40 w-40" />
                    <p className="mt-2 text-[11px] font-bold text-navy-400">QR — برای پرینت جلوی مغازه</p>
                  </div>
                ) : null}

                <div className="mt-5 rounded-2xl border border-blue-200 bg-gradient-to-l from-blue-50 to-green-50 p-4 text-right">
                  <p className="text-sm font-extrabold text-navy-800">📍 ثبت حرفه‌ای در گوگل‌مپ؟</p>
                  <p className="mt-1 text-xs leading-relaxed text-navy-500">
                    کارت رایگان فقط لینک شماست. پکیج <b>محبوب</b>: ثبت ۵ نقشه + همه مسیریاب‌ها روی همین لینک.
                  </p>
                  <Link
                    href="/googlesabt?from=bizcard&package=popular#packages"
                    className="mt-3 inline-block rounded-lg bg-[#4285F4] px-4 py-2 text-xs font-bold text-white"
                  >
                    ثبت در گوگل — از ۹۹۰ هزار تومان
                  </Link>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    مشاهده کارت
                  </a>
                  <button type="button" onClick={resetAll} className="rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-700">
                    ساخت کارت دیگر
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setScreen("questions")}
                  className="mt-4 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white"
                >
                  ۴ سوال کوتاه برای پیشنهاد رشد ←
                </button>
              </div>
            ) : null}

            {screen === "questions" ? (
              <div>
                <h3 className="text-lg font-extrabold text-navy-900">۴ سوال کوتاه (اختیاری)</h3>
                <p className="mt-1 text-sm text-navy-500">برای پیشنهاد دقیق‌تر رشد کسب‌وکار</p>

                {[
                  { key: "has_site", q: "سایت دارید؟", opts: ["yes", "no"], labels: ["بله", "خیر"] },
                  {
                    key: "has_googlemap",
                    q: "گوگل‌مپ دارید؟",
                    opts: ["yes", "no", "unknown"],
                    labels: ["بله", "خیر", "نمی‌دانم"],
                  },
                  { key: "wants_google", q: "می‌خواهید از گوگل مشتری بگیرید؟", opts: ["yes", "no"], labels: ["بله", "خیر"] },
                  { key: "wants_review", q: "بررسی وضعیت آنلاین توسط مشاور؟", opts: ["yes", "no"], labels: ["بله", "خیر"] },
                ].map((block) => (
                  <div key={block.key} className="mt-5">
                    <p className="mb-2 text-sm font-bold text-navy-800">{block.q}</p>
                    <div className="flex flex-wrap gap-2">
                      {block.opts.map((val, i) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setAnswers((a) => ({ ...a, [block.key]: val }))}
                          className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
                            answers[block.key] === val
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-navy-100 bg-white text-navy-600"
                          }`}
                        >
                          {block.labels[i]}
                        </button>
                      ))}
                    </div>
                    {block.key === "has_site" && answers.has_site === "yes" ? (
                      <input
                        className={`${inputClass} mt-3`}
                        dir="ltr"
                        value={siteUrl}
                        onChange={(e) => setSiteUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    ) : null}
                  </div>
                ))}

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (answers.has_site === "yes") setSiteUrl(siteUrl);
                      await postLead(null);
                      setSuggested(computeSuggestion());
                      setScreen("suggestion");
                    }}
                    className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white"
                  >
                    دیدن پیشنهاد آرایه
                  </button>
                  <button type="button" onClick={() => { void postLead(null); resetAll(); }} className="text-xs font-bold text-navy-400 underline">
                    فعلاً نه
                  </button>
                </div>
              </div>
            ) : null}

            {screen === "suggestion" && suggested ? (
              <div className="text-center">
                <div className="text-4xl">{suggested.icon}</div>
                <h3 className="mt-3 text-lg font-extrabold text-navy-900">{suggested.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-500">{suggested.text}</p>
                <button
                  type="button"
                  onClick={async () => {
                    if (suggested.ctaLink) {
                      window.location.href = suggested.ctaLink;
                      return;
                    }
                    await postLead(suggested.service);
                    setScreen("final");
                  }}
                  className="mt-5 w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white"
                >
                  {suggested.cta}
                </button>
                <button type="button" onClick={resetAll} className="mt-3 text-xs font-bold text-navy-400 underline">
                  فعلاً نه، ممنون
                </button>
              </div>
            ) : null}

            {screen === "final" ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <IconCheck size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-extrabold text-emerald-700">درخواست ثبت شد</h3>
                <p className="mt-2 text-sm text-navy-500">مشاور آرایه به‌زودی با شما تماس می‌گیرد.</p>
                <a href={card.link} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white">
                  مشاهده کارت من
                </a>
              </div>
            ) : null}
          </div>

          <div className="hidden lg:block">
            <BizcardPreview data={previewData} />
          </div>
        </div>
      </div>
    </section>
  );
}
