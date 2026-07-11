"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { looksLikeWebsite } from "@/lib/seoBusinessInput";

export default function SeoHeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const value = query.trim();
    if (!value) return;

    const param = looksLikeWebsite(value)
      ? `website=${encodeURIComponent(value)}`
      : `name=${encodeURIComponent(value)}`;

    router.push(`/free-seo-audit?${param}#lead-form`);
  };

  return (
    <div className="seo-hero-search-wrap">
      <form onSubmit={handleSubmit} className="seo-hero-search">
        <label htmlFor="seo-hero-query" className="sr-only">
          نام کسب‌وکار یا آدرس سایت
        </label>
        <input
          id="seo-hero-query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="نام کسب‌وکار یا آدرس سایت"
          className="seo-hero-search-input"
          autoComplete="organization"
        />
        <button type="submit" className="seo-hero-search-btn">
          بررسی وضعیت
        </button>
      </form>
    </div>
  );
}
