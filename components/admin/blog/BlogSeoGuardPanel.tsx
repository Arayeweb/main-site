'use client';

import { useCallback, useEffect, useState } from 'react';
import { canonicalUrl } from '@/lib/siteUrl';

type SeoIssue = { level: string; code: string; message: string };
type CannibalizationHit = {
  url: string;
  title: string;
  reason: string;
  similarity: number;
  suggestedAction: string;
};
type InternalLink = {
  destinationUrl: string;
  suggestedAnchor: string;
  reason: string;
  confidence: number;
};

type Props = {
  articleId: string;
  title: string;
  slug: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  robotsIndex: boolean;
  onApplySeoTitle: (v: string) => void;
  onApplySeoDescription: (v: string) => void;
};

export function BlogSeoGuardPanel({
  articleId,
  title,
  slug,
  seoTitle,
  seoDescription,
  excerpt,
  robotsIndex,
  onApplySeoTitle,
  onApplySeoDescription,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [critical, setCritical] = useState<SeoIssue[]>([]);
  const [warnings, setWarnings] = useState<SeoIssue[]>([]);
  const [opportunities, setOpportunities] = useState<SeoIssue[]>([]);
  const [canPublish, setCanPublish] = useState(true);
  const [cannibalization, setCannibalization] = useState<CannibalizationHit[]>([]);
  const [internalLinks, setInternalLinks] = useState<InternalLink[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/blog/seo/analyze?article_id=${articleId}`, { credentials: 'include' });
    const json = await res.json();
    if (json.ok) {
      const issues = json.issues as SeoIssue[];
      setCritical(issues.filter((i) => i.level === 'critical'));
      setWarnings(issues.filter((i) => i.level === 'warning'));
      setOpportunities(issues.filter((i) => i.level === 'opportunity'));
      setCanPublish(json.readiness?.canPublish ?? true);
      setCannibalization(json.cannibalization ?? []);
      setInternalLinks(json.internal_links ?? []);
    }
    setLoading(false);
  }, [articleId]);

  useEffect(() => {
    load();
  }, [load, title, slug, seoTitle, seoDescription]);

  const displayTitle = seoTitle || title;
  const displayDesc = seoDescription || excerpt;
  const url = canonicalUrl(`/blog/${slug}`);

  return (
    <div className="space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">SEO Guard</span>
        <button type="button" onClick={load} className="text-xs text-slate-400 hover:text-slate-600">
          بروزرسانی
        </button>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400">در حال بررسی…</p>
      ) : (
        <>
          <div
            className={`text-xs px-2 py-1 rounded-lg ${
              canPublish ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {canPublish ? 'آماده انتشار (بدون خطای بحرانی)' : 'انتشار مسدود — خطای بحرانی'}
          </div>

          <IssueGroup title="بحرانی" items={critical} color="text-red-700" />
          <IssueGroup title="هشدار" items={warnings} color="text-amber-700" />
          <IssueGroup title="فرصت" items={opportunities} color="text-blue-700" />

          <div className="border rounded-lg p-3 bg-white">
            <div className="text-xs text-slate-400 mb-2">پیش‌نمایش گوگل (دسکتاپ)</div>
            <div className="text-blue-700 text-sm truncate">{displayTitle}</div>
            <div className="text-green-700 text-xs truncate">{url}</div>
            <div className="text-slate-600 text-xs line-clamp-2 mt-0.5">{displayDesc}</div>
            <p className="text-[10px] text-slate-400 mt-2">گوگل ممکن است عنوان و توضیح را بازنویسی کند.</p>
          </div>

          <div className="border rounded-lg p-3 bg-slate-900 text-white">
            <div className="text-xs text-slate-400 mb-2">کارت شبکه اجتماعی</div>
            <div className="font-medium text-sm">{displayTitle}</div>
            <div className="text-xs text-slate-300 mt-1 line-clamp-2">{displayDesc}</div>
            {!robotsIndex && <div className="text-xs text-amber-400 mt-2">noindex</div>}
          </div>

          {cannibalization.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">ریسک Cannibalization</div>
              <ul className="space-y-1">
                {cannibalization.map((c) => (
                  <li key={c.url} className="text-xs border rounded p-2">
                    <div className="font-medium">{c.title}</div>
                    <div className="text-slate-500">{c.reason} — {Math.round(c.similarity * 100)}%</div>
                    <div className="text-slate-400">{c.suggestedAction}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {internalLinks.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1">لینک داخلی پیشنهادی</div>
              <ul className="space-y-1">
                {internalLinks.map((l) => (
                  <li key={`${l.destinationUrl}-${l.suggestedAnchor}`} className="text-xs border rounded p-2 flex justify-between gap-2">
                    <span>
                      <strong>{l.suggestedAnchor}</strong> → {l.destinationUrl}
                    </span>
                    <span className="text-slate-400 shrink-0">{Math.round(l.confidence * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IssueGroup({ title, items, color }: { title: string; items: SeoIssue[]; color: string }) {
  if (!items.length) return null;
  return (
    <div>
      <div className={`text-xs font-semibold mb-1 ${color}`}>{title} ({items.length})</div>
      <ul className="space-y-0.5">
        {items.map((i) => (
          <li key={i.code} className="text-xs text-slate-600">• {i.message}</li>
        ))}
      </ul>
    </div>
  );
}
