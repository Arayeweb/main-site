"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PACKAGE_LIST } from "@/lib/aiPackages";
import { formatStarterCredits, FREE_PLAN_EQUIVALENTS } from "@/lib/aiFreeMessaging";
import { trackAiBeginCheckout } from "@/lib/aiTracking";
import {
  ARENA_PROMO_STORAGE_KEY,
  ARENA_REF_STORAGE_KEY,
  getStoredPromoCode,
  getUtmParams,
  pickUtmForDb,
} from "@/lib/utm";
import { IconCheck, IconDiamond, IconX } from "../icons";
import { useArenaAuth } from "../ArenaAuthContext";

type PricePreview = {
  listPrice: number;
  discount: number;
  finalPrice: number;
  codeType: string | null;
  label: string | null;
};

export default function PricingPage() {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const { authed } = useArenaAuth();
  const [failed, setFailed] = useState(false);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [validating, setValidating] = useState(false);
  const [preview, setPreview] = useState<PricePreview | null>(null);
  const [selectedPkg, setSelectedPkg] = useState(PACKAGE_LIST[0]?.id || "starter");

  useEffect(() => {
    getUtmParams();

    const params = new URLSearchParams(window.location.search);

    const promoFromUrl = params.get("code");
    const ref = params.get("ref");
    if (promoFromUrl) {
      const upper = promoFromUrl.toUpperCase();
      setCode(upper);
      try {
        sessionStorage.setItem(ARENA_PROMO_STORAGE_KEY, upper);
      } catch {
        /* ignore */
      }
    } else if (ref) {
      setCode(ref.toUpperCase());
      try {
        sessionStorage.setItem(ARENA_REF_STORAGE_KEY, ref.toUpperCase());
      } catch {
        /* ignore */
      }
    } else {
      try {
        const storedPromo = getStoredPromoCode();
        const storedRef = sessionStorage.getItem(ARENA_REF_STORAGE_KEY);
        if (storedPromo) setCode(storedPromo);
        else if (storedRef) setCode(storedRef);
      } catch {
        /* ignore */
      }
    }

    const cleanParams = new URLSearchParams();
    if (params.get("payment") === "failed" || params.get("payment") === "error") {
      setFailed(true);
      cleanParams.set("payment", params.get("payment")!);
    }
    const pkg = params.get("package");
    if (pkg && PACKAGE_LIST.some((p) => p.id === pkg)) {
      setSelectedPkg(pkg);
      cleanParams.set("package", pkg);
    }
    const nextQs = cleanParams.toString();
    window.history.replaceState({}, "", nextQs ? `/ai/pricing?${nextQs}` : "/ai/pricing");
  }, []);

  async function validateCode(pkgId?: string) {
    const packageId = pkgId || selectedPkg;
    if (!code.trim()) {
      setPreview(null);
      setCodeErr("");
      return;
    }
    if (authed === false) return;

    setValidating(true);
    setCodeErr("");
    try {
      const res = await fetch("/api/ai/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId, code: code.trim() }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setPreview(null);
        setCodeErr(data?.message || "کد معتبر نیست.");
        setValidating(false);
        return;
      }
      setPreview({
        listPrice: data.listPrice,
        discount: data.discount,
        finalPrice: data.finalPrice,
        codeType: data.codeType,
        label: data.label,
      });
    } catch {
      setCodeErr("خطا در بررسی کد.");
      setPreview(null);
    }
    setValidating(false);
  }

  useEffect(() => {
    if (authed && code.trim()) validateCode(selectedPkg);
    else if (!code.trim()) setPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPkg, authed]);

  function priceFor(pkgId: string) {
    if (preview && pkgId === selectedPkg && code.trim()) {
      return preview;
    }
    const pkg = PACKAGE_LIST.find((p) => p.id === pkgId);
    return pkg
      ? { listPrice: pkg.priceToman, discount: 0, finalPrice: pkg.priceToman, codeType: null, label: null }
      : null;
  }

  async function buy(packageId: string) {
    if (busy) return;
    setErr("");
    setSelectedPkg(packageId);

    if (authed === false) {
      window.location.href = "/ai?login=1";
      return;
    }

    const p = priceFor(packageId);
    trackAiBeginCheckout({
      packageId,
      amountToman: p?.finalPrice ?? PACKAGE_LIST.find((x) => x.id === packageId)?.priceToman ?? 0,
      promoCode: code.trim() || undefined,
    });

    setBusy(packageId);
    try {
      const utm = pickUtmForDb(getUtmParams());
      const res = await fetch("/api/ai/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          code: code.trim() || undefined,
          ...utm,
        }),
      });
      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        window.location.href = "/ai?login=1";
        return;
      }
      if (res.status === 422) {
        setErr(data?.message || "کد تخفیف معتبر نیست.");
        setBusy(null);
        return;
      }
      if (!res.ok || !data?.ok || !data.redirectUrl) {
        setErr("اتصال به درگاه پرداخت ناموفق بود. دوباره تلاش کن.");
        setBusy(null);
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setErr("خطایی پیش آمد. دوباره تلاش کن.");
      setBusy(null);
    }
  }

  return (
    <div>
      <nav className="ar-nav">
        <div className="ar-container-wide ar-nav-inner">
          <Link href="/ai" className="ar-logo">
            آرایه <span>AI</span>
          </Link>
          <div className="ar-nav-links">
            <Link href="/ai" className="ar-btn ar-btn-primary ar-btn-sm">
              شروع گفتگو
            </Link>
          </div>
        </div>
      </nav>

      <section className="ar-pricing-hero">
        <div className="ar-container">
          <h1>
            دسترسی به <span className="ar-hl">۵ مدل AI</span> — با تومان
          </h1>
          <p>
            GPT، Claude، Gemini، Grok و DeepSeek — بدون VPN و کارت خارجی.
            هر پرسش از ۱ کردیت — یا به زبان ساده: {formatStarterCredits(PACKAGE_LIST[0]?.credits ?? 50)}.
          </p>
          <p className="ar-pricing-free-hint">
            ثبت‌نام رایگان — {FREE_PLAN_EQUIVALENTS.signupBonus} هدیه برای شروع
          </p>
        </div>
      </section>

      <div className="ar-container-wide">
        {failed && (
          <div className="ar-banner error" style={{ marginBottom: 20 }}>
            <IconX size={14} />
            پرداخت ناموفق بود یا لغو شد. دوباره تلاش کن.
          </div>
        )}
        {err && (
          <div className="ar-banner error" style={{ marginBottom: 20 }}>
            <IconX size={14} />
            {err}
          </div>
        )}

        <div className="ar-promo-box">
          <label htmlFor="promo-code">کد تخفیف یا معرفی</label>
          <div className="ar-promo-row">
            <input
              id="promo-code"
              type="text"
              placeholder="مثلاً PAGEA20 یا AI-XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              dir="ltr"
            />
            <button
              type="button"
              className="ar-btn ar-btn-ghost ar-btn-sm"
              onClick={() => validateCode(selectedPkg)}
              disabled={validating || !code.trim()}
            >
              {validating ? "…" : "اعمال"}
            </button>
          </div>
          {codeErr && <div className="ar-promo-err">{codeErr}</div>}
          {preview?.label && (
            <div className="ar-promo-ok">
              <IconCheck size={13} />
              {preview.label} — {preview.discount.toLocaleString("fa-IR")} تومان تخفیف
            </div>
          )}
        </div>

        <div className="ar-plans-grid">
          {PACKAGE_LIST.map((pkg) => {
            const p = priceFor(pkg.id);
            const showDiscount = p && p.discount > 0 && pkg.id === selectedPkg && code.trim();
            return (
              <div
                key={pkg.id}
                className={`ar-plan-card${pkg.featured ? " featured" : ""}${pkg.id === "starter" ? " starter-hero" : ""}`}
                onMouseEnter={() => setSelectedPkg(pkg.id)}
              >
                {pkg.id === "starter" && <div className="ar-plan-badge">پیشنهاد لانچ</div>}
                {pkg.featured && pkg.badge && pkg.id !== "starter" && (
                  <div className="ar-plan-badge">{pkg.badge}</div>
                )}

                <div>
                  <div className="ar-plan-name">{pkg.name}</div>
                  <div className="ar-plan-price" style={{ marginTop: 8 }}>
                    {showDiscount && (
                      <span className="ar-price-old">
                        {p!.listPrice.toLocaleString("fa-IR")}
                      </span>
                    )}
                    {(showDiscount ? p!.finalPrice : pkg.priceToman).toLocaleString("fa-IR")}
                    <span className="per"> تومان</span>
                  </div>
                  <div className="ar-plan-desc" style={{ marginTop: 8 }}>
                    {pkg.desc}
                  </div>
                </div>

                <span className="ar-plan-credits">
                  <IconDiamond size={13} />
                  {formatStarterCredits(pkg.credits)}
                </span>

                <ul className="ar-plan-features">
                  {pkg.features.map((f, i) => (
                    <li key={i}>
                      <span className="check">
                        <IconCheck size={14} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`ar-btn ar-btn-block${pkg.featured || pkg.id === "starter" ? " ar-btn-primary" : " ar-btn-ghost"}`}
                  onClick={() => buy(pkg.id)}
                  disabled={busy !== null}
                >
                  {busy === pkg.id ? "در حال اتصال به درگاه…" : "خرید با زیبال"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="ar-pricing-studios">
          <h2>هزینه کردیت استودیوها</h2>
          <table className="ar-pricing-studio-table">
            <thead>
              <tr>
                <th>استودیو</th>
                <th>مدل</th>
                <th>کردیت</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>تصویر</td>
                <td>سبک / خلاق / دقیق</td>
                <td>۳ – ۶</td>
              </tr>
              <tr>
                <td>ویدیو (۵ ثانیه)</td>
                <td>Seedance / Kling / Sora / Veo</td>
                <td>۱۰ / ۵۰ / ۱۲۵ / ۱۵۰</td>
              </tr>
              <tr>
                <td>صدا (TTS)</td>
                <td>GPT Audio Mini / Pro</td>
                <td>۲ / ۵</td>
              </tr>
              <tr>
                <td>رونویسی</td>
                <td>GPT-4o Transcribe</td>
                <td>۲ / دقیقه</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ar-pricing-bundle">
          <div className="ar-pricing-bundle-title">Content & Sales Bundle</div>
          <p className="ar-pricing-bundle-desc">
            ۳۰ ریلز + ۳۰ کپشن + ۲۰ دایرکت + کمپین‌ها + ۱ ماه AI Pro — برای محتوا و فروش، نه فقط چت خام.
          </p>
          <Link href="/ai/content-sales" className="ar-btn ar-btn-primary ar-btn-sm">
            مشاهده پکیج · ۵۹۰ هزار تومان
          </Link>
        </div>

        <div className="ar-pricing-note">
          پرداخت امن از طریق درگاه زیبال انجام می‌شود.
          <br />
          با کد معرفی دوست، ۱۰٪ تخفیف می‌گیری — معرف هم ۱۰ کردیت پاداش می‌گیرد.
          <br />
          پرسش‌ها بلافاصله بعد از پرداخت به حسابت اضافه می‌شوند و منقضی نمی‌شوند.
        </div>
      </div>
    </div>
  );
}
