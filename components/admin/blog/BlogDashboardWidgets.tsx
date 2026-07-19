'use client';

import { useEffect, useState } from 'react';

type Widgets = {
  drafts: number;
  in_review: number;
  scheduled: number;
  published_this_month: number;
  seo_critical: { id: string; title: string; slug: string }[];
  missing_internal_links: { id: string; title: string }[];
  stale_articles: { id: string; title: string }[];
  ai_usage_today_usd: number;
  ai_cost_month_usd: number;
  ai_acceptance_rate: number;
};

export function BlogDashboardWidgets() {
  const [data, setData] = useState<Widgets | null>(null);

  useEffect(() => {
    fetch('/api/admin/blog/dashboard', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setData(j.widgets);
      })
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6" dir="rtl">
      <Widget label="پیش‌نویس" value={data.drafts} />
      <Widget label="در بررسی" value={data.in_review} />
      <Widget label="زمان‌بندی" value={data.scheduled} />
      <Widget label="منتشر این ماه" value={data.published_this_month} />
      <Widget label="هزینه AI امروز ($)" value={data.ai_usage_today_usd.toFixed(3)} />
      <Widget label="هزینه AI ماه ($)" value={data.ai_cost_month_usd.toFixed(2)} />
      <Widget label="نرخ پذیرش AI" value={`${data.ai_acceptance_rate}%`} />
      <Widget label="SEO بحرانی" value={data.seo_critical.length} />
    </div>
  );
}

function Widget({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-xl font-bold text-slate-900 mt-1">{value}</div>
    </div>
  );
}
