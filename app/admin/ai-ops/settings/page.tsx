'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiSettings, saveAiSettings } from '@/lib/aiAdminApi';
import { Settings } from 'lucide-react';

interface SettingsShape {
  default_plan?: string;
  free_signup_credits?: number;
  rate_limit_per_minute?: number;
  max_battle_cost_usd?: number;
  feature_flags?: Record<string, boolean>;
}

export default function AiOpsSettingsPage() {
  const { data, loading, error } = useAiOpsFetch(() => fetchAiSettings(), []);
  const [form, setForm] = useState<SettingsShape>({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm(data.settings as SettingsShape);
  }, [data]);

  return (
    <div>
      <AdminPageHeader title="تنظیمات" description="تنظیمات عمومی محصول Araaye AI — پلن پیش‌فرض، محدودیت نرخ و feature flag ها." icon={Settings} />

      {loading && <AiOpsLoadingState />}
      {error && <AiOpsErrorState error={error} />}

      {data && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-xl flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1">کردیت هدیه ثبت‌نام رایگان</label>
            <input
              type="number"
              value={form.free_signup_credits ?? 10}
              onChange={(e) => setForm({ ...form, free_signup_credits: Number(e.target.value) })}
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1">محدودیت نرخ (درخواست در دقیقه)</label>
            <input
              type="number"
              value={form.rate_limit_per_minute ?? 12}
              onChange={(e) => setForm({ ...form, rate_limit_per_minute: Number(e.target.value) })}
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200 block mb-1">سقف هشدار هزینه هر نبرد (USD)</label>
            <input
              type="number"
              step="0.01"
              value={form.max_battle_cost_usd ?? 0.25}
              onChange={(e) => setForm({ ...form, max_battle_cost_usd: Number(e.target.value) })}
              className="w-full border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Feature Flags</p>
            <div className="flex flex-col gap-2">
              {Object.entries(form.feature_flags ?? {}).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 text-sm dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) =>
                      setForm({ ...form, feature_flags: { ...(form.feature_flags ?? {}), [key]: e.target.checked } })
                    }
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>

          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await saveAiSettings(form as Record<string, unknown>);
              setBusy(false);
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="bg-violet-600 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 w-fit"
          >
            {busy ? 'در حال ذخیره...' : saved ? 'ذخیره شد ✓' : 'ذخیره تنظیمات'}
          </button>
        </div>
      )}
    </div>
  );
}
