"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CONTENT_SALES_LAUNCH_PRICE_TOMAN,
  CONTENT_SALES_RENEWAL_PRICE_TOMAN,
  CONTENT_SALES_LIST_PRICE_TOMAN,
  CONTENT_SALES_PACKAGE_ITEMS,
  CONTENT_SALES_7DAY_OUTCOMES,
  CONTENT_SALES_FAQ,
  CONTENT_SALES_ICP,
  formatToman,
} from "@/lib/contentSalesBundle";
import { REEL_SCENARIOS } from "@/lib/contentSales/reels";
import { CAPTION_TEMPLATES } from "@/lib/contentSales/captions";
import { DM_TEMPLATES } from "@/lib/contentSales/dms";
import { CHECKOUT_PAGE_COPY } from "@/lib/contentSales/marketing";
import { getUtmParams } from "@/lib/utm";

const sampleReel = REEL_SCENARIOS[0];
const sampleCaption = CAPTION_TEMPLATES[0];
const sampleDm = DM_TEMPLATES[3];

function isValidMobile(v: string) {
  const d = v.replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(d);
}

type AuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "authed"; phoneMasked: string; hasBundle: boolean };

export default function ContentSalesLanding() {
  const sp = useSearchParams();
  const payment = sp.get("payment");
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleTab, setSampleTab] = useState<"reel" | "caption" | "dm">("reel");

  useEffect(() => {
    fetch("/api/ai/auth", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d.authed && d.user) {
          setAuth({
            status: "authed",
            phoneMasked: d.user.phoneMasked || "09*********",
            hasBundle: !!d.hasContentSalesBundle,
          });
        } else {
          setAuth({ status: "guest" });
        }
      })
      .catch(() => setAuth({ status: "guest" }));
  }, []);

  const checkout = async () => {
    setError(null);
    const isAuthed = auth.status === "authed";

    if (!isAuthed) {
      if (!name.trim()) {
        setError("نام را وارد کن.");
        return;
      }
      if (!isValidMobile(phone)) {
        setError("موبایل را درست وارد کن (۰۹xxxxxxxxx).");
        return;
      }
    }

    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        email: email.trim() || undefined,
        utm: getUtmParams(),
      };
      if (isAuthed) {
        if (name.trim()) body.name = name.trim();
      } else {
        const digits = phone
          .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 0x06f0))
          .replace(/\D/g, "");
        body.name = name.trim();
        body.phone = digits;
      }

      const res = await fetch("/api/ai/content-sales/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error === "already_purchased") {
        setError(data.message || "قبلاً خریده‌ای.");
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.message || "خطا در پرداخت.");
        return;
      }
      window.location.href = data.redirectUrl;
    } catch {
      setError("خطای شبکه.");
    } finally {
      setLoading(false);
    }
  };

  const hasBundle = auth.status === "authed" && auth.hasBundle;

  return (
    <div className="cs-page">
      <header className="cs-topbar">
        <Link href="/ai" className="ar-btn ar-btn-ghost ar-btn-sm">
          ← Araaye AI
        </Link>
        <span className="cs-topbar-label">Content & Sales Bundle</span>
      </header>

      {hasBundle && (
        <div className="cs-banner cs-banner--success">
          پکیج تو فعال است —{" "}
          <Link href="/ai/content-sales/app" style={{ fontWeight: 700, textDecoration: "underline" }}>
            ورود به داشبورد پکیج
          </Link>
        </div>
      )}

      <section className="cs-hero" id="hero">
        {payment === "failed" && <div className="cs-error">پرداخت ناموفق بود. دوباره تلاش کن.</div>}
        {payment === "error" && (
          <div className="cs-error">خطا در پرداخت. واتساپ: ۰۹۹۹۱۳۰۰۷۸۸</div>
        )}

        <div className="cs-hero-badge">قیمت لانچ · محدود</div>
        <p className="cs-eyebrow">برای پیج فروش و محتوا — نه چت عمومی AI</p>
        <h1 className="cs-h1">
          فقط با AI چت نکن؛{" "}
          <span className="cs-h1-accent">محتوا و فروش بساز</span>
        </h1>
        <p className="cs-lead">
          ۳۰ ریلز + ۳۰ کپشن + ۲۰ دایرکت + کمپین‌ها + ۱ ماه Araaye AI — خروجی آماده برای اینستاگرام،
          نه پرامپت خام.
        </p>
        <div className="cs-hero-cta">
          {hasBundle ? (
            <Link href="/ai/content-sales/app" className="ar-btn ar-btn-primary">
              ورود به پکیج من
            </Link>
          ) : (
            <a href="#pricing" className="ar-btn ar-btn-primary">
              شروع — {formatToman(CONTENT_SALES_LAUNCH_PRICE_TOMAN)} تومان
            </a>
          )}
          <Link href="/ai" className="ar-btn ar-btn-ghost">
            امتحان رایگان AI
          </Link>
        </div>
        <div className="cs-trust-row">
          <span>پرداخت امن زیبال</span>
          <span>فعال‌سازی فوری</span>
          <span>دسترسی دائمی با همان حساب</span>
        </div>
      </section>

      <section className="cs-section cs-section-alt" id="problem">
        <div className="cs-split">
          <div>
            <h2 className="cs-h2">مشکل</h2>
            <ul className="cs-list">
              <li>بیشتر آدم‌ها از AI فقط جواب خام می‌گیرند</li>
              <li>نمی‌دانند چه چیزی بپرسند</li>
              <li>خروجی را مستقیم کپی می‌کنند و نتیجه نمی‌گیرند</li>
            </ul>
          </div>
          <div>
            <h2 className="cs-h2">راه‌حل</h2>
            <ul className="cs-list">
              <li>سناریو و قالب آماده برای محتوا و فروش</li>
              <li>اکانت Araaye AI بدون VPN</li>
              <li>مسیر ۷ روزه از ایده تا پست</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cs-section" id="inside">
        <h2 className="cs-h2">داخل پکیج</h2>
        <div className="cs-grid">
          {CONTENT_SALES_PACKAGE_ITEMS.map((item) => (
            <article key={item.id} className="cs-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cs-section cs-section-alt" id="outcome">
        <h2 className="cs-h2">در ۷ روز چه خروجی می‌گیری؟</h2>
        <ul className="cs-list">
          {CONTENT_SALES_7DAY_OUTCOMES.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section className="cs-section" id="icp">
        <h2 className="cs-h2">برای چه کسانی؟</h2>
        <div className="cs-icp-grid">
          <article className="cs-card cs-icp-yes">
            <h3>مناسب است اگر…</h3>
            <ul className="cs-list">
              <li>صاحب پیج فروش یا خدمات هستی</li>
              <li>فریلنسر یا تولیدکننده محتوا هستی</li>
              <li>می‌خواهی خروجی آماده، نه چت خام</li>
              <li>فروش از دایرکت و ریلز داری</li>
            </ul>
          </article>
          <article className="cs-card cs-icp-no">
            <h3>مناسب نیست اگر…</h3>
            <ul className="cs-list cs-list--no">
              <li>فقط چت عمومی AI می‌خواهی</li>
              <li>دانشجو، پزشک یا برنامه‌نویس هستی</li>
              <li>به دنبال دوره ویدیویی طولانی هستی</li>
            </ul>
          </article>
        </div>
        <p className="cs-lead" style={{ marginTop: 20, marginBottom: 0, fontSize: "0.9rem" }}>
          {CONTENT_SALES_ICP}
        </p>
      </section>

      <section className="cs-section cs-section-alt" id="samples">
        <h2 className="cs-h2">نمونه خروجی</h2>
        <div className="cs-sample-tabs">
          {(
            [
              ["reel", "ریلز"],
              ["caption", "کپشن"],
              ["dm", "دایرکت"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`cs-sample-tab${sampleTab === id ? " active" : ""}`}
              onClick={() => setSampleTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {sampleTab === "reel" && (
          <article className="cs-card">
            <h3>سناریوی ریلز — {sampleReel.pageType}</h3>
            <p>
              <strong>Hook:</strong> {sampleReel.hook}
            </p>
            <pre className="cs-sample-pre">{sampleReel.script}</pre>
          </article>
        )}
        {sampleTab === "caption" && (
          <article className="cs-card">
            <h3>کپشن ({sampleCaption.category})</h3>
            <pre className="cs-sample-pre">{sampleCaption.text}</pre>
          </article>
        )}
        {sampleTab === "dm" && (
          <article className="cs-card">
            <h3>دایرکت ({sampleDm.category})</h3>
            <pre className="cs-sample-pre">{sampleDm.text}</pre>
          </article>
        )}
      </section>

      <section className="cs-section cs-section-alt" id="pricing">
        <div className="cs-price-block">
          <div className="cs-price-card">
            <p className="cs-eyebrow">قیمت لانچ</p>
            <p className="cs-price">
              <span className="cs-price-old">{formatToman(CONTENT_SALES_LIST_PRICE_TOMAN)}</span>
              {formatToman(CONTENT_SALES_LAUNCH_PRICE_TOMAN)} تومان
            </p>
            <p className="cs-price-note">همه موارد پکیج + ۱ ماه اکانت Araaye AI Pro</p>
            <p className="cs-price-note">
              تمدید ماهانه بعدی: {formatToman(CONTENT_SALES_RENEWAL_PRICE_TOMAN)} تومان
            </p>

            <ul className="cs-includes">
              <li>۳۰ سناریوی ریلز</li>
              <li>۳۰ کپشن + ۲۰ دایرکت</li>
              <li>۱۲ قالب AI + سیستم نقد</li>
              <li>≈ ۱۸۰ کردیت AI</li>
            </ul>

            {hasBundle ? (
              <div className="cs-form">
                <p className="cs-form-title">پکیج تو فعال است</p>
                <p className="cs-form-sub">
                  همیشه از منوی AI → «پکیج محتوا» یا همین لینک وارد شو.
                </p>
                <Link href="/ai/content-sales/app" className="ar-btn ar-btn-primary ar-btn-block">
                  ورود به داشبورد پکیج
                </Link>
              </div>
            ) : (
              <div className="cs-form" id="checkout-form">
                <p className="cs-form-title">{CHECKOUT_PAGE_COPY.title}</p>
                <p className="cs-form-sub">{CHECKOUT_PAGE_COPY.subtitle}</p>

                {auth.status === "authed" && (
                  <div className="cs-banner cs-banner--info" style={{ marginBottom: 16 }}>
                    خرید با حساب فعلی تو — موبایل از حساب AI خوانده می‌شود.
                  </div>
                )}

                {auth.status === "guest" && (
                  <div className="cs-field">
                    <label htmlFor="cs-name">{CHECKOUT_PAGE_COPY.fields.name}</label>
                    <input
                      id="cs-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                )}

                {auth.status === "authed" ? (
                  <div className="cs-field">
                    <label>موبایل (حساب AI)</label>
                    <div className="cs-phone-locked">
                      <code>{auth.phoneMasked}</code>
                      <span>تأیید‌شده</span>
                    </div>
                  </div>
                ) : auth.status === "guest" ? (
                  <div className="cs-field">
                    <label htmlFor="cs-phone">{CHECKOUT_PAGE_COPY.fields.phone}</label>
                    <input
                      id="cs-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>
                ) : null}

                {auth.status === "authed" && (
                  <div className="cs-field">
                    <label htmlFor="cs-name-opt">نام (اختیاری)</label>
                    <input
                      id="cs-name-opt"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="برای فاکتور"
                      autoComplete="name"
                    />
                  </div>
                )}

                <div className="cs-field">
                  <label htmlFor="cs-email">{CHECKOUT_PAGE_COPY.fields.email}</label>
                  <input
                    id="cs-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    autoComplete="email"
                  />
                </div>

                {error && (
                  <div className="cs-error">
                    {error}
                    {error.includes("قبلاً") && (
                      <>
                        {" "}
                        <Link href="/ai/content-sales/app">ورود به پکیج</Link>
                      </>
                    )}
                  </div>
                )}

                {auth.status !== "loading" && (
                  <>
                    <button
                      type="button"
                      className="ar-btn ar-btn-primary ar-btn-block"
                      disabled={loading}
                      onClick={checkout}
                    >
                      {loading ? "در حال انتقال..." : CHECKOUT_PAGE_COPY.button}
                    </button>
                    <p style={{ fontSize: "0.75rem", color: "var(--cs-muted2)", marginTop: 12 }}>
                      {CHECKOUT_PAGE_COPY.note}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="cs-section cs-faq" id="faq">
        <h2 className="cs-h2">سؤالات</h2>
        {CONTENT_SALES_FAQ.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>

      {!hasBundle && (
        <div className="cs-sticky">
          <div className="cs-sticky-inner">
            <span style={{ fontSize: "0.85rem" }}>
              <strong>{formatToman(CONTENT_SALES_LAUNCH_PRICE_TOMAN)}</strong> تومان
            </span>
            <a href="#pricing" className="ar-btn ar-btn-primary ar-btn-sm">
              خرید
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
