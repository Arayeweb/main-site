"use client";

import { useState } from "react";
import { openSeoChat } from "@/lib/openSeoChat";

export default function SeoFinalCta() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;
    openSeoChat(value, "final_cta");
  };

  return (
    <section id="seo-final-cta" className="seo-final">
      <div className="container-mx container-px">
        <div className="seo-final-cta">
          <h2>اول ببینیم امروز در گوگل کجا ایستاده‌اید</h2>
          <p>
            نام کسب‌وکار یا آدرس سایت را وارد کنید تا مسیر مناسب برای بهتر دیده‌شدن مشخص
            شود.
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
              بررسی وضعیت در گوگل
            </button>
          </form>

          <p className="seo-final-search-note">برای شروع، همین یک اطلاعات کافی است.</p>
        </div>
      </div>
    </section>
  );
}
