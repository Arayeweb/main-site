'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiPlans, upsertAiPlan, type AiPlanRow } from '@/lib/aiAdminApi';
import { formatToman, formatUsd } from '@/lib/aiAdminTypes';
import { Layers } from 'lucide-react';

export default function AiOpsPlansPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiPlans(), []);
  const [editing, setEditing] = useState<AiPlanRow | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <AdminPageHeader title="اشتراک‌ها و پلن‌ها" description="کاتالوگ پلن، تعداد مشترکین و گزارش سودآوری هر پلن." icon={Layers} />

      {loading && <AiOpsLoadingState />}
      {error && <AiOpsErrorState error={error} />}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {data.plans.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">{p.name}</h3>
                {p.is_featured && <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">محبوب</span>}
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{p.price_toman > 0 ? formatToman(p.price_toman) : 'رایگان'}</p>
              <p className="text-xs text-slate-400">{p.credits} کردیت</p>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <div>
                  <p className="text-slate-400">مشترکین</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{p.active_subscribers}</p>
                </div>
                <div>
                  <p className="text-slate-400">درآمد</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{formatToman(p.revenue_toman)}</p>
                </div>
                <div>
                  <p className="text-slate-400">هزینه API</p>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{formatUsd(p.cost_usd)}</p>
                </div>
                <div>
                  <p className="text-slate-400">حاشیه سود</p>
                  <p className={`font-semibold ${p.margin_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{p.margin_percent}%</p>
                </div>
              </div>
              <button
                onClick={() => setEditing(p)}
                className="mt-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
              >
                ویرایش پلن
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white">ویرایش {editing.name}</h3>
            <label className="text-xs text-slate-500">نام پلن</label>
            <input
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <label className="text-xs text-slate-500">قیمت (تومان)</label>
            <input
              type="number"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.price_toman}
              onChange={(e) => setEditing({ ...editing, price_toman: Number(e.target.value) })}
            />
            <label className="text-xs text-slate-500">کردیت</label>
            <input
              type="number"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.credits}
              onChange={(e) => setEditing({ ...editing, credits: Number(e.target.value) })}
            />
            <label className="flex items-center gap-2 text-sm dark:text-slate-200">
              <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
              فعال
            </label>
            <div className="flex gap-2 mt-2">
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  await upsertAiPlan(editing);
                  setBusy(false);
                  setEditing(null);
                  refetch();
                }}
                className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
              >
                ذخیره
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2 text-sm dark:text-slate-200">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
