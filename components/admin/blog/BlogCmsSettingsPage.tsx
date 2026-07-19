'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Settings } from 'lucide-react';
import type { CmsAiSettings } from '@/lib/cms/ai/types';

export function BlogCmsSettingsPage() {
  const [settings, setSettings] = useState<CmsAiSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/blog/settings', { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setSettings(j.settings);
      });
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    const res = await fetch('/api/admin/blog/settings', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ settings }),
    });
    const json = await res.json();
    setSaving(false);
    setMsg(json.ok ? 'ذخیره شد' : json.error);
  }

  if (!settings) return <p className="p-6 text-sm text-slate-500">بارگذاری…</p>;

  return (
    <div dir="rtl">
      <AdminPageHeader
        title="تنظیمات CMS"
        description="AI، بودجه و rate limit"
        icon={Settings}
        actions={
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg disabled:opacity-50"
          >
            {saving ? 'ذخیره…' : 'ذخیره'}
          </button>
        }
      />
      {msg && <p className="text-sm text-slate-600 mb-4">{msg}</p>}
      <div className="bg-white border rounded-xl p-6 space-y-4 max-w-lg text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.ai_enabled}
            onChange={(e) => setSettings({ ...settings, ai_enabled: e.target.checked })}
          />
          فعال‌سازی AI
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.research_mode}
            onChange={(e) => setSettings({ ...settings, research_mode: e.target.checked })}
          />
          حالت تحقیق (نیاز به منبع)
        </label>
        <Field label="بودجه روزانه (USD)">
          <input
            type="number"
            step="0.5"
            value={settings.daily_budget_usd}
            onChange={(e) => setSettings({ ...settings, daily_budget_usd: Number(e.target.value) })}
            className="w-full border rounded-lg px-2 py-1.5"
          />
        </Field>
        <Field label="Rate limit (در دقیقه)">
          <input
            type="number"
            value={settings.rate_limit_per_minute}
            onChange={(e) => setSettings({ ...settings, rate_limit_per_minute: Number(e.target.value) })}
            className="w-full border rounded-lg px-2 py-1.5"
          />
        </Field>
        <Field label="حداکثر توکن">
          <input
            type="number"
            value={settings.max_tokens_per_action}
            onChange={(e) => setSettings({ ...settings, max_tokens_per_action: Number(e.target.value) })}
            className="w-full border rounded-lg px-2 py-1.5"
          />
        </Field>
        <Field label="مدل کوتاه">
          <input
            value={settings.models.short}
            onChange={(e) => setSettings({ ...settings, models: { ...settings.models, short: e.target.value } })}
            className="w-full border rounded-lg px-2 py-1.5"
          />
        </Field>
        <Field label="مدل تحلیل">
          <input
            value={settings.models.analysis}
            onChange={(e) => setSettings({ ...settings, models: { ...settings.models, analysis: e.target.value } })}
            className="w-full border rounded-lg px-2 py-1.5"
          />
        </Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500 mb-1 block">{label}</span>
      {children}
    </label>
  );
}
