"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Monitor,
  Smartphone,
} from "lucide-react";
import Logo from "@/components/Logo";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import { formatPriceToman } from "@/lib/aiPricingConfig";
import { pushGtmEvent } from "@/lib/gtm";
import {
  FASTWEB_GOALS,
  FASTWEB_PACKAGES,
  FASTWEB_STYLES,
  isFastWebPackageKey,
  normalizeIranPhone,
  suggestedSectionsForGoal,
  type FastWebBrief,
  type FastWebPackageKey,
  type FastWebStyleId,
} from "@/lib/fastweb";
import { buildDraftPreview } from "@/lib/fastwebContent";
import {
  clearFastWebDraft,
  createEmptyBrief,
  loadFastWebDraft,
  saveFastWebDraft,
} from "@/lib/fastwebDraft";

const STEP_LABELS = [
  "هدف",
  "کسب‌وکار",
  "ظاهر",
  "تماس",
  "پیش‌نمایش",
  "پرداخت",
] as const;

const PREVIEW_STEP = 4;
const PAY_STEP = 5;

type ApiEnvelope = {
  ok?: boolean;
  error?: string;
  accessToken?: string;
  order?: { id: string; slug?: string; temporaryHostHint?: string };
  redirectUrl?: string;
  alreadyPaid?: boolean;
};

async function apiJson(url: string, init?: RequestInit): Promise<ApiEnvelope> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  return (await res.json().catch(() => ({}))) as ApiEnvelope;
}

export default function FastWebWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<FastWebBrief>(createEmptyBrief);
  const [packageKey, setPackageKey] = useState<FastWebPackageKey>("fast");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();

  const paymentFlag = searchParams.get("payment");

  // Deterministic, instant preview from the brief — no AI, no cost.
  const preview = useMemo(() => buildDraftPreview(brief), [brief]);

  useEffect(() => {
    const draft = loadFastWebDraft();
    const pkgParam = searchParams.get("package");
    if (draft) {
      setBrief({ ...createEmptyBrief(), ...draft.brief });
      // Never restore straight into preview/pay without re-confirming inputs.
      setStep(Math.min(draft.step, 3));
      if (draft.orderId) setOrderId(draft.orderId);
      if (draft.accessToken) setAccessToken(draft.accessToken);
      if (draft.packageKey) setPackageKey(draft.packageKey);
    }
    if (isFastWebPackageKey(pkgParam)) setPackageKey(pkgParam);
    setHydrated(true);
    pushGtmEvent("fastweb_wizard_open", { package: pkgParam || "fast" });
  }, [searchParams]);

  useEffect(() => {
    if (!hydrated) return;
    saveFastWebDraft({
      version: 1,
      savedAt: Date.now(),
      step,
      orderId: orderId || undefined,
      accessToken: accessToken || undefined,
      packageKey,
      brief,
    });
  }, [hydrated, step, orderId, accessToken, packageKey, brief]);

  const slugHint = useMemo(() => {
    const base =
      brief.slugPreference?.trim() ||
      brief.businessName
        ?.trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 24) ||
      "business";
    return `${base || "business"}.araaye.site`;
  }, [brief.slugPreference, brief.businessName]);

  function patchBrief(patch: Partial<FastWebBrief>) {
    setBrief((prev) => ({ ...prev, ...patch }));
  }

  function patchContacts(patch: NonNullable<FastWebBrief["contacts"]>) {
    setBrief((prev) => ({
      ...prev,
      contacts: { ...(prev.contacts || {}), ...patch },
    }));
  }

  async function ensureDraft(): Promise<{
    orderId: string;
    accessToken: string;
  } | null> {
    const data = await apiJson("/api/fastweb/draft", {
      method: "POST",
      body: JSON.stringify({ brief, package: packageKey, orderId, accessToken }),
    });
    if (!data.ok || !data.order?.id || !data.accessToken) {
      setError("ذخیره پیش‌نویس ممکن نشد. کمی بعد دوباره تلاش کنید.");
      return null;
    }
    setOrderId(data.order.id);
    setAccessToken(data.accessToken);
    return { orderId: data.order.id, accessToken: data.accessToken };
  }

  async function goNext() {
    setError(null);

    if (step === 0 && !brief.goal) {
      setError("هدف سایت را انتخاب کنید.");
      return;
    }
    if (step === 1) {
      if (!brief.businessName?.trim() || !brief.shortDescription?.trim()) {
        setError("نام کسب‌وکار و توضیح کوتاه لازم است.");
        return;
      }
    }
    if (step === 3) {
      const p = normalizeIranPhone(brief.contacts?.phone || "");
      if (!p) {
        setError("شماره تماس معتبر وارد کنید.");
        return;
      }
      patchContacts({ phone: p });
      // Persist the draft (also stores deterministic preview server-side).
      setBusy(true);
      try {
        const draft = await ensureDraft();
        if (!draft) return;
        pushGtmEvent("fastweb_wizard_preview", {});
        setStep(PREVIEW_STEP);
      } finally {
        setBusy(false);
      }
      return;
    }

    pushGtmEvent("fastweb_wizard_step", { step: step + 1 });
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function startCheckout(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const normalized = normalizeIranPhone(phone || brief.contacts?.phone || "");
    if (!normalized) {
      setError("موبایل معتبر برای پرداخت لازم است.");
      return;
    }
    setBusy(true);
    try {
      let ids = orderId && accessToken ? { orderId, accessToken } : null;
      if (!ids) {
        ids = await ensureDraft();
        if (!ids) return;
      }
      pushGtmEvent("fastweb_checkout_start", { package: packageKey });
      const data = await apiJson("/api/fastweb/checkout", {
        method: "POST",
        body: JSON.stringify({
          orderId: ids.orderId,
          accessToken: ids.accessToken,
          phone: normalized,
          package: packageKey,
        }),
      });
      if (data.alreadyPaid && data.redirectUrl) {
        clearFastWebDraft();
        router.push(data.redirectUrl);
        return;
      }
      if (!data.ok || !data.redirectUrl) {
        setError("اتصال به درگاه ممکن نشد. دوباره تلاش کنید.");
        return;
      }
      clearFastWebDraft();
      window.location.href = data.redirectUrl;
    } finally {
      setBusy(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F8]" dir="rtl">
        <Loader2 className="h-6 w-6 animate-spin text-[#0F4C5C]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F7F8] text-slate-900" dir="rtl">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/fastweb" className="flex items-center gap-2">
            <Logo />
            <span className="hidden sm:inline text-sm font-medium text-slate-600">
              سایت فوری
            </span>
          </Link>
          <p className="text-xs text-slate-500">
            مرحله {step + 1} از {STEP_LABELS.length} — {STEP_LABELS[step]}
          </p>
        </div>
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <div className="flex gap-1.5">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= step ? "bg-[#0F4C5C]" : "bg-slate-200"
                }`}
                title={label}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        {paymentFlag === "failed" || paymentFlag === "error" ? (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            پرداخت کامل نشد. می‌توانید دوباره از مرحله پرداخت اقدام کنید.
          </div>
        ) : null}

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
          {/* Step 0: Goal */}
          {step === 0 ? (
            <section>
              <h1 className="text-2xl font-bold">از سایت چه نتیجه‌ای می‌خواهید؟</h1>
              <p className="mt-2 text-sm text-slate-600">
                یک گزینه اصلی انتخاب کنید تا ساختار پیشنهادی تنظیم شود.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {FASTWEB_GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() =>
                      patchBrief({
                        goal: g.id,
                        sections: suggestedSectionsForGoal(g.id),
                      })
                    }
                    className={`rounded-xl border px-4 py-4 text-right transition ${
                      brief.goal === g.id
                        ? "border-[#0F4C5C] bg-teal-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="font-medium">{g.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {/* Step 1: Business + audience */}
          {step === 1 ? (
            <section className="space-y-4">
              <h1 className="text-2xl font-bold">اطلاعات کسب‌وکار</h1>
              <Field
                label="نام کسب‌وکار"
                value={brief.businessName || ""}
                onChange={(v) => patchBrief({ businessName: v })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="حوزه فعالیت"
                  value={brief.industry || ""}
                  onChange={(v) => patchBrief({ industry: v })}
                  placeholder="مثلاً کلینیک پوست، کافه، خدمات ساختمانی"
                />
                <Field
                  label="شهر یا محدوده فعالیت"
                  value={brief.city || ""}
                  onChange={(v) => patchBrief({ city: v })}
                />
              </div>
              <Field
                label="توضیح کوتاه"
                value={brief.shortDescription || ""}
                onChange={(v) => patchBrief({ shortDescription: v })}
                textarea
                placeholder="کسب‌وکارتان چه می‌کند و چرا مشتری باید شما را انتخاب کند؟"
              />
              <Field
                label="خدمات یا محصولات اصلی"
                value={brief.offerings || ""}
                onChange={(v) => patchBrief({ offerings: v })}
                textarea
                placeholder="هر مورد در یک خط"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="مزیت اصلی"
                  value={brief.mainAdvantage || ""}
                  onChange={(v) => patchBrief({ mainAdvantage: v })}
                />
                <Field
                  label="بیشتر چه کسانی از شما خرید می‌کنند؟"
                  value={brief.audience || ""}
                  onChange={(v) => patchBrief({ audience: v })}
                  placeholder="مثلاً خانواده‌های غرب تهران"
                />
              </div>
            </section>
          ) : null}

          {/* Step 2: Style */}
          {step === 2 ? (
            <section className="space-y-5">
              <h1 className="text-2xl font-bold">ظاهر سایت</h1>
              <p className="text-sm text-slate-600">
                بخش‌های سایت بر اساس هدف شما از قبل انتخاب شده‌اند و در پیش‌نمایش
                قابل تغییرند.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {FASTWEB_STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => patchBrief({ style: s.id as FastWebStyleId })}
                    className={`rounded-xl border p-4 text-right ${
                      brief.style === s.id
                        ? "border-[#0F4C5C] bg-teal-50"
                        : "border-slate-200"
                    }`}
                  >
                    <p className="font-semibold">{s.label}</p>
                    <p className="mt-1 text-xs text-slate-500 leading-6">{s.hint}</p>
                  </button>
                ))}
              </div>
              <label className="block text-sm">
                <span className="font-medium">رنگ برند</span>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="color"
                    value={brief.brandColor || "#0F4C5C"}
                    onChange={(e) => patchBrief({ brandColor: e.target.value })}
                    className="h-10 w-14 cursor-pointer rounded border border-slate-200"
                  />
                  <input
                    value={brief.brandColor || "#0F4C5C"}
                    onChange={(e) => patchBrief({ brandColor: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </label>
              <Field
                label="لینک لوگو (اختیاری)"
                value={brief.logoUrl || ""}
                onChange={(v) => patchBrief({ logoUrl: v })}
                placeholder="https://..."
              />
              <Field
                label="نمونه سایت موردعلاقه (اختیاری)"
                value={brief.favoriteSites || ""}
                onChange={(v) => patchBrief({ favoriteSites: v })}
                placeholder="آدرس یک یا دو سایت"
              />
            </section>
          ) : null}

          {/* Step 3: Contacts */}
          {step === 3 ? (
            <section className="space-y-4">
              <h1 className="text-2xl font-bold">اطلاعات تماس</h1>
              <p className="text-sm text-slate-600">
                کد ملی فقط بعد از خرید و برای فاکتور رسمی گرفته می‌شود.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="شماره تماس"
                  value={brief.contacts?.phone || ""}
                  onChange={(v) => patchContacts({ phone: v })}
                  placeholder="0912..."
                />
                <Field
                  label="واتساپ"
                  value={brief.contacts?.whatsapp || ""}
                  onChange={(v) => patchContacts({ whatsapp: v })}
                />
                <Field
                  label="اینستاگرام"
                  value={brief.contacts?.instagram || ""}
                  onChange={(v) => patchContacts({ instagram: v })}
                  placeholder="@username"
                />
                <Field
                  label="ساعت کاری"
                  value={brief.contacts?.hours || ""}
                  onChange={(v) => patchContacts({ hours: v })}
                />
              </div>
              <Field
                label="آدرس"
                value={brief.contacts?.address || ""}
                onChange={(v) => patchContacts({ address: v })}
                textarea
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="لینک نقشه / لوکیشن"
                  value={brief.contacts?.locationUrl || ""}
                  onChange={(v) => patchContacts({ locationUrl: v })}
                />
                <Field
                  label="ایمیل"
                  value={brief.contacts?.email || ""}
                  onChange={(v) => patchContacts({ email: v })}
                />
              </div>
            </section>
          ) : null}

          {/* Step 4: Preview + address */}
          {step === PREVIEW_STEP ? (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">پیش‌نمایش سایت</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    این ساختار، ظاهر و رنگ سایت شماست. متن نهایی را تیم آرایه
                    می‌نویسد و قبل از انتشار کنترل می‌کند.
                  </p>
                </div>
                <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`rounded-md p-2 ${
                      previewMode === "mobile" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`rounded-md p-2 ${
                      previewMode === "desktop" ? "bg-white shadow-sm" : ""
                    }`}
                  >
                    <Monitor className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                className={`mx-auto mt-6 overflow-hidden rounded-2xl border border-slate-200 shadow-inner ${
                  previewMode === "mobile" ? "max-w-[390px]" : "w-full"
                }`}
              >
                <FastWebSiteView content={preview} brief={brief} mode="preview" />
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium">آدرس سایت</p>
                <p className="mt-1 text-xs text-slate-500">
                  برای شروع مجبور نیستید دامنه بخرید؛ سایت روی آدرس موقت تحویل
                  می‌شود و اتصال دامنه اختصاصی را بعد انجام می‌دهیم.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <label className="block text-sm">
                    <span className="font-medium">نامک زیردامنه</span>
                    <input
                      value={brief.slugPreference || ""}
                      onChange={(e) =>
                        patchBrief({ slugPreference: e.target.value })
                      }
                      placeholder="my-business"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0F4C5C]"
                    />
                  </label>
                  <p className="pb-2 text-sm text-slate-600">{slugHint}</p>
                </div>
              </div>
            </section>
          ) : null}

          {/* Step 5: Pay */}
          {step === PAY_STEP ? (
            <section>
              <h1 className="text-2xl font-bold">انتخاب بسته و پرداخت</h1>
              <p className="mt-2 text-sm text-slate-600">
                نسخه اول قابل انتشار تا ۲۴ ساعت کاری، پس از تکمیل اطلاعات و پرداخت.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(Object.values(FASTWEB_PACKAGES) as Array<(typeof FASTWEB_PACKAGES)["fast"]>).map(
                  (pkg) => (
                    <button
                      key={pkg.key}
                      type="button"
                      onClick={() => setPackageKey(pkg.key)}
                      className={`rounded-xl border p-4 text-right ${
                        packageKey === pkg.key
                          ? "border-[#0F4C5C] bg-teal-50"
                          : "border-slate-200"
                      }`}
                    >
                      <p className="font-bold">{pkg.name}</p>
                      <p className="mt-1 text-lg font-bold text-[#0F4C5C]">
                        {formatPriceToman(pkg.priceToman)} تومان
                      </p>
                      <ul className="mt-3 space-y-1 text-xs text-slate-600">
                        {pkg.features.slice(0, 4).map((f) => (
                          <li key={f}>• {f}</li>
                        ))}
                      </ul>
                    </button>
                  )
                )}
              </div>
              <form onSubmit={startCheckout} className="mt-6 space-y-4">
                <Field
                  label="موبایل برای پیگیری سفارش"
                  value={phone || brief.contacts?.phone || ""}
                  onChange={(v) => {
                    setPhone(v);
                    patchContacts({ phone: v });
                  }}
                  placeholder="0912..."
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C5C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  پرداخت و ثبت سفارش
                </button>
                <p className="text-center text-xs text-slate-500">
                  یا{" "}
                  <Link href="/website-design" className="underline">
                    طراحی سایت اختصاصی
                  </Link>{" "}
                  اگر به فروشگاه، پنل یا امکانات سفارشی نیاز دارید.
                </p>
              </form>
            </section>
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {/* Nav buttons */}
          {step < PAY_STEP ? (
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0 || busy}
                className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm text-slate-600 disabled:opacity-40"
              >
                <ArrowRight className="h-4 w-4" />
                قبلی
              </button>
              <button
                type="button"
                onClick={() => startTransition(() => void goNext())}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {step === 3
                  ? "ذخیره و مشاهده پیش‌نمایش"
                  : step === PREVIEW_STEP
                    ? "ادامه به پرداخت"
                    : "ادامه"}
                {!busy ? <ArrowLeft className="h-4 w-4" /> : null}
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const cls =
    "mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0F4C5C]";
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={cls}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  );
}
