"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import SeoHeroMockup from "./SeoHeroMockup";

const isValidIranianMobile = (value: string): boolean => {
  const digits = value.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits);
};

export default function SeoHero() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isValidIranianMobile(phone)) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const digits = phone.replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0)).replace(/\D/g, "");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "seo_hero",
          page: "/seo",
          contact: digits,
          goal: "seo_consultation",
          plan: "consultation",
          channel: "seo_landing",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
          ...getUtmParams(),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "ثبت درخواست ناموفق بود. دوباره تلاش کنید."
        );
        return;
      }
      pushGtmEvent("generate_lead", { source: "seo_hero", goal: "seo_consultation", page: "seo" });
      setSuccess(true);
      setPhone("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="seo-hero">
      <div className="container-mx container-px">
        <div className="seo-hero-grid">
          <div className="seo-hero-copy">
            <span className="seo-hero-badge">سیستم سرچ تا لید — آرایه</span>

            <h1>
              سئویی که از گوگل{" "}
              <em>مشتری</em> می‌آورد، نه فقط بازدید.
            </h1>

            <p className="seo-hero-lead">
              آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند.
            </p>

            <p className="seo-hero-sub">
              برای کلینیک، مطب، وکالت، رستوران و هر کسب‌وکاری که مشتری در گوگل جستجو
              می‌کند و باید تماس یا فرم بگیرد.
            </p>

            <div className="seo-hero-form-wrap">
              {success ? (
                <div className="seo-hero-success" role="status">
                  <strong>درخواست ثبت شد.</strong>
                  <span>کارشناس آرایه تا ۲۴ ساعت آینده تماس می‌گیرد.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="seo-hero-form" noValidate>
                  <label htmlFor="seo-hero-phone" className="sr-only">
                    شماره موبایل
                  </label>
                  <input
                    id="seo-hero-phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    dir="ltr"
                    placeholder="09xxxxxxxxx"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError(null);
                    }}
                    className="seo-hero-input"
                  />
                  <button type="submit" disabled={loading} className="seo-btn-primary seo-hero-submit">
                    {loading ? "در حال ثبت..." : "مشاوره رایگان سرچ تا لید"}
                  </button>
                </form>
              )}
              {error ? (
                <p className="seo-hero-error" role="alert">
                  {error}
                </p>
              ) : null}
              <p className="seo-hero-form-note">بدون تعهد — فقط بررسی مسیر لید از گوگل</p>
            </div>

            <a href="#flow" className="seo-hero-link">
              ببینید چطور کار می‌کند ←
            </a>
          </div>

          <SeoHeroMockup />
        </div>
      </div>
    </section>
  );
}
