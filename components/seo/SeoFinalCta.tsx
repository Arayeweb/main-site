"use client";

import { useState } from "react";
import { scrollToSeoAuditForm } from "@/lib/seoPlanSelection";
import { SEO_AUDIT_PREFILL_EVENT } from "@/lib/seoPlanSelection";

export default function SeoFinalCta() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    scrollToSeoAuditForm();
    window.dispatchEvent(
      new CustomEvent(SEO_AUDIT_PREFILL_EVENT, { detail: { value } })
    );
  };

  return (
    <section id="seo-final-cta" className="seo-final">
      <div className="container-mx container-px">
        <div className="seo-final-cta">
          <h2>اول مشخص کنیم سایت شما امروز کجا ایستاده است</h2>
          <p>
            نام کسب‌وکار یا آدرس سایت را وارد کنید تا وضعیت فنی، صفحات هدف، حضور محلی و
            فرصت‌های اصلی رشد بررسی شوند.
          </p>

          <form onSubmit={handleSubmit} className="seo-final-search">
            <label htmlFor="seo-final-query" className="sr-only">
              نام کسب‌وکار یا آدرس سایت
            </label>
            <input
              id="seo-final-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="نام کسب‌وکار یا آدرس سایت"
              className="seo-final-search-input"
              autoComplete="organization"
            />
            <button type="submit" className="seo-final-search-btn">
              دریافت بررسی اولیه
            </button>
          </form>

          <p className="seo-final-search-note">
            بدون وعده رتبه غیرواقعی؛ با برنامه و اقدامات مشخص.
          </p>
        </div>
      </div>
    </section>
  );
}
