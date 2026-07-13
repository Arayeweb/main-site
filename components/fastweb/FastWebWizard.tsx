"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import StepBusiness from "@/components/fastweb/wizard-steps/StepBusiness";
import StepContacts from "@/components/fastweb/wizard-steps/StepContacts";
import StepDomain from "@/components/fastweb/wizard-steps/StepDomain";
import StepGoalAudience from "@/components/fastweb/wizard-steps/StepGoalAudience";
import StepPayment from "@/components/fastweb/wizard-steps/StepPayment";
import StepPreview from "@/components/fastweb/wizard-steps/StepPreview";
import StepStyle from "@/components/fastweb/wizard-steps/StepStyle";
import { pushGtmEvent } from "@/lib/gtm";
import {
  FASTWEB_PACKAGES,
  isFastWebPackageKey,
  normalizeIranPhone,
  type FastWebBrief,
  type FastWebPackageKey,
} from "@/lib/fastweb";
import { buildDraftPreview } from "@/lib/fastwebContent";
import {
  clearFastWebDraft,
  createEmptyBrief,
  loadFastWebDraft,
  saveFastWebDraft,
} from "@/lib/fastwebDraft";

const STEP_LABELS = [
  "کسب‌وکار",
  "هدف و مخاطب",
  "ظاهر",
  "آدرس سایت",
  "تماس",
  "پیش‌نمایش",
  "پرداخت",
] as const;

const PREVIEW_STEP = 5;
const PAY_STEP = 6;

type SlugStatus = "idle" | "checking" | "ok" | "taken" | "invalid";

type ApiEnvelope = {
  ok?: boolean;
  error?: string;
  message?: string;
  accessToken?: string;
  order?: { id: string; slug?: string; temporaryHostHint?: string };
  redirectUrl?: string;
  alreadyPaid?: boolean;
  slugs?: string[];
  available?: boolean;
  valid?: boolean;
  url?: string;
  name?: string;
  listAmountToman?: number;
  discountToman?: number;
  finalAmountToman?: number;
  promoCode?: string;
  label?: string;
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
  const [uploading, setUploading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLabel, setCouponLabel] = useState<string | null>(null);
  const [couponList, setCouponList] = useState(0);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponFinal, setCouponFinal] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);
  const [, startTransition] = useTransition();

  const paymentFlag = searchParams.get("payment");
  const preview = useMemo(() => buildDraftPreview(brief), [brief]);

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

  useEffect(() => {
    const draft = loadFastWebDraft();
    const pkgParam = searchParams.get("package");
    if (draft) {
      setBrief({ ...createEmptyBrief(), ...draft.brief });
      setStep(Math.min(draft.step, 4));
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

  useEffect(() => {
    if (step !== 3) return;
    const slug = brief.slugPreference?.trim();
    if (!slug) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    const t = setTimeout(() => {
      void apiJson(`/api/fastweb/check-slug?slug=${encodeURIComponent(slug)}`).then(
        (data) => {
          if (!data.ok) {
            setSlugStatus("idle");
            return;
          }
          if (!data.valid) setSlugStatus("invalid");
          else if (data.available) setSlugStatus("ok");
          else setSlugStatus("taken");
        }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [brief.slugPreference, step]);

  useEffect(() => {
    setCouponApplied(false);
    setCouponLabel(null);
    setCouponDiscount(0);
    setCouponError(null);
  }, [packageKey]);

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

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/fastweb/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as ApiEnvelope;
      if (!data.ok || !data.url) {
        setError("آپلود فایل ممکن نشد.");
        return;
      }
      patchBrief({
        attachmentUrl: data.url,
        attachmentName: data.name || file.name,
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleSuggestSlug() {
    setSuggesting(true);
    setError(null);
    try {
      const data = await apiJson("/api/fastweb/suggest-slug", {
        method: "POST",
        body: JSON.stringify({
          businessName: brief.businessName,
          industry: brief.industry,
          city: brief.city,
          shortDescription: brief.shortDescription,
        }),
      });
      if (!data.ok || !data.slugs?.length) {
        setError("پیشنهاد نام ممکن نشد. خودتان یک نام وارد کنید.");
        return;
      }
      setSuggestedSlugs(data.slugs);
    } finally {
      setSuggesting(false);
    }
  }

  const applyCoupon = useCallback(async () => {
    setCouponApplying(true);
    setCouponError(null);
    try {
      const data = await apiJson("/api/fastweb/apply-coupon", {
        method: "POST",
        body: JSON.stringify({ package: packageKey, promoCode: couponCode }),
      });
      if (!data.ok) {
        setCouponApplied(false);
        setCouponError(data.message || "کد معتبر نیست.");
        return;
      }
      setCouponApplied(true);
      setCouponLabel(data.label || null);
      setCouponList(data.listAmountToman || FASTWEB_PACKAGES[packageKey].priceToman);
      setCouponDiscount(data.discountToman || 0);
      setCouponFinal(data.finalAmountToman || FASTWEB_PACKAGES[packageKey].priceToman);
    } finally {
      setCouponApplying(false);
    }
  }, [couponCode, packageKey]);

  async function goNext() {
    setError(null);

    if (step === 0) {
      if (!brief.businessName?.trim() || !brief.shortDescription?.trim()) {
        setError("نام کسب‌وکار و توضیح کسب‌وکار لازم است.");
        return;
      }
    }
    if (step === 1 && !brief.goal) {
      setError("هدف سایت را انتخاب کنید.");
      return;
    }
    if (step === 3 && brief.slugPreference?.trim()) {
      if (slugStatus === "invalid" || slugStatus === "taken") {
        setError("آدرس سایت معتبر نیست یا قبلاً گرفته شده.");
        return;
      }
      if (slugStatus === "checking") {
        setError("لطفاً چند لحظه صبر کنید تا آدرس بررسی شود.");
        return;
      }
    }
    if (step === 4) {
      const p = normalizeIranPhone(brief.contacts?.phone || "");
      if (!p) {
        setError("شماره تماس معتبر وارد کنید.");
        return;
      }
      patchContacts({ phone: p });
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

  async function startCheckout(e: React.FormEvent) {
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
          promoCode: couponApplied ? couponCode : undefined,
        }),
      });
      if (data.alreadyPaid && data.redirectUrl) {
        clearFastWebDraft();
        router.push(data.redirectUrl);
        return;
      }
      if (!data.ok || !data.redirectUrl) {
        setError(data.message || "اتصال به درگاه ممکن نشد. دوباره تلاش کنید.");
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
          {step === 0 ? (
            <StepBusiness
              brief={brief}
              onPatch={patchBrief}
              onUpload={handleUpload}
              uploading={uploading}
            />
          ) : null}

          {step === 1 ? (
            <StepGoalAudience brief={brief} onPatch={patchBrief} />
          ) : null}

          {step === 2 ? (
            <StepStyle brief={brief} onPatch={patchBrief} />
          ) : null}

          {step === 3 ? (
            <StepDomain
              brief={brief}
              slugHint={slugHint}
              slugStatus={slugStatus}
              suggestedSlugs={suggestedSlugs}
              suggesting={suggesting}
              onPatch={patchBrief}
              onSuggest={() => void handleSuggestSlug()}
            />
          ) : null}

          {step === 4 ? (
            <StepContacts
              brief={brief}
              onPatch={patchBrief}
              onPatchContacts={patchContacts}
            />
          ) : null}

          {step === PREVIEW_STEP ? (
            <StepPreview
              brief={brief}
              preview={preview}
              previewMode={previewMode}
              slugHint={slugHint}
              onPreviewMode={setPreviewMode}
            />
          ) : null}

          {step === PAY_STEP ? (
            <StepPayment
              brief={brief}
              packageKey={packageKey}
              phone={phone || brief.contacts?.phone || ""}
              busy={busy}
              slugHint={slugHint}
              coupon={{
                code: couponCode,
                applied: couponApplied,
                label: couponLabel,
                listAmountToman: couponList,
                discountToman: couponDiscount,
                finalAmountToman: couponFinal,
                error: couponError,
                applying: couponApplying,
              }}
              onPackageChange={(key) => {
                setPackageKey(key);
                setCouponApplied(false);
              }}
              onPhoneChange={(v) => {
                setPhone(v);
                patchContacts({ phone: v });
              }}
              onCouponCodeChange={setCouponCode}
              onApplyCoupon={() => void applyCoupon()}
              onSubmit={(e) => void startCheckout(e)}
            />
          ) : null}

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

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
                {step === 4
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
