'use client';

import { useState } from 'react';
import { trackCmsEvent } from '@/lib/cms/analytics';
import type { CmsAiAction } from '@/lib/cms/ai/types';

type Props = {
  articleId: string;
  title: string;
  excerpt: string;
  primaryKeyword: string;
  contentJson: Record<string, unknown>;
  selection?: string;
  onApplyText: (text: string, mode: 'replace' | 'insert') => void;
  onApplySeoTitles: (titles: string[]) => void;
  onApplySeoDescriptions: (descs: string[]) => void;
};

const ACTIONS: { id: CmsAiAction; label: string; group: string }[] = [
  { id: 'content_brief', label: 'بریف محتوا', group: 'برنامه‌ریزی' },
  { id: 'outline', label: 'Outline', group: 'برنامه‌ریزی' },
  { id: 'search_intent', label: 'نیت جستجو', group: 'برنامه‌ریزی' },
  { id: 'continue_writing', label: 'ادامه نوشتن', group: 'نوشتن' },
  { id: 'expand_text', label: 'گسترش متن', group: 'نوشتن' },
  { id: 'shorten_text', label: 'کوتاه‌سازی', group: 'نوشتن' },
  { id: 'rewrite_persian', label: 'بازنویسی فارسی', group: 'نوشتن' },
  { id: 'generate_excerpt', label: 'خلاصه', group: 'نوشتن' },
  { id: 'generate_faq', label: 'FAQ', group: 'نوشتن' },
  { id: 'generate_cta', label: 'CTA', group: 'نوشتن' },
  { id: 'seo_titles', label: 'عنوان‌های SEO', group: 'سئو' },
  { id: 'seo_descriptions', label: 'متا دیسکریپشن', group: 'سئو' },
  { id: 'seo_analysis', label: 'تحلیل SEO', group: 'سئو' },
];

export function BlogAiAssistantPanel({
  articleId,
  title,
  excerpt,
  primaryKeyword,
  contentJson,
  selection,
  onApplyText,
  onApplySeoTitles,
  onApplySeoDescriptions,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ action: string; raw: string; parsed: unknown } | null>(null);

  async function runAction(action: CmsAiAction) {
    setBusy(true);
    setError('');
    trackCmsEvent('cms_ai_action_started', { action, article_id: articleId });

    try {
      const res = await fetch(`/api/admin/blog/ai/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: articleId,
          title,
          excerpt,
          primary_keyword: primaryKeyword,
          content_json: contentJson,
          selection,
          mode: selection ? 'selection' : 'article',
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? 'خطا');
        trackCmsEvent('cms_ai_action_failed', { action, error: json.error });
        return;
      }
      setPreview({ action, raw: json.raw_text, parsed: json.result });
    } catch {
      setError('network_error');
      trackCmsEvent('cms_ai_action_failed', { action, error: 'network' });
    } finally {
      setBusy(false);
    }
  }

  function accept() {
    if (!preview) return;
    const p = preview.parsed as Record<string, unknown>;
    if (preview.action === 'seo_titles' && Array.isArray(p.variants)) {
      onApplySeoTitles(p.variants as string[]);
    } else if (preview.action === 'seo_descriptions' && Array.isArray(p.variants)) {
      onApplySeoDescriptions(p.variants as string[]);
    } else if (typeof p.text === 'string') {
      onApplyText(p.text, selection ? 'replace' : 'insert');
    }
    trackCmsEvent('cms_ai_action_accepted', { action: preview.action, article_id: articleId });
    setPreview(null);
  }

  function reject() {
    if (preview) trackCmsEvent('cms_ai_action_rejected', { action: preview.action, article_id: articleId });
    setPreview(null);
  }

  const groups = Array.from(new Set(ACTIONS.map((a) => a.group)));

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-slate-500">
        AI فقط پیشنهاد می‌دهد — تغییرات را بپذیرید یا رد کنید. انتشار خودکار ندارد.
      </p>

      {groups.map((g) => (
        <div key={g}>
          <div className="text-xs font-semibold text-slate-400 mb-1">{g}</div>
          <div className="flex flex-wrap gap-1">
            {ACTIONS.filter((a) => a.group === g).map((a) => (
              <button
                key={a.id}
                type="button"
                disabled={busy}
                onClick={() => runAction(a.id)}
                className="px-2 py-1 text-xs border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {error && <p className="text-xs text-red-600">{error}</p>}

      {preview && (
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 space-y-2">
          <div className="text-xs font-medium text-slate-600">پیش‌نمایش AI</div>
          <pre className="text-xs whitespace-pre-wrap max-h-48 overflow-auto text-slate-700">
            {typeof preview.parsed === 'object'
              ? JSON.stringify(preview.parsed, null, 2)
              : preview.raw}
          </pre>
          <div className="flex gap-2">
            <button type="button" onClick={accept} className="px-2 py-1 text-xs bg-slate-900 text-white rounded">
              پذیرفتن
            </button>
            <button type="button" onClick={reject} className="px-2 py-1 text-xs border rounded">
              رد
            </button>
            {typeof (preview.parsed as { text?: string })?.text === 'string' && (
              <button
                type="button"
                onClick={() => {
                  const t = (preview.parsed as { text: string }).text;
                  onApplyText(t, 'insert');
                  trackCmsEvent('cms_ai_action_accepted', { action: preview.action, mode: 'insert' });
                  setPreview(null);
                }}
                className="px-2 py-1 text-xs border rounded"
              >
                درج زیر
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
