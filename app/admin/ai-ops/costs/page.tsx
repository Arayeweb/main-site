'use client';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiCosts } from '@/lib/aiAdminApi';
import { formatToman, formatUsd, AI_PLAN_LABELS } from '@/lib/aiAdminTypes';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AiOpsCostsPage() {
  const { data, loading, error } = useAiOpsFetch(() => fetchAiCosts(), []);

  return (
    <div>
      <AdminPageHeader title="هزینه API و حاشیه سود" description="تفکیک هزینه بر اساس مدل، پلن و روز — به‌همراه تشخیص ناهنجاری مصرف." icon={TrendingUp} />

      {loading && <AiOpsLoadingState />}
      {error && <AiOpsErrorState error={error} />}

      {data && (
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">هزینه روزانه (۳۰ روز اخیر)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.by_day}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} reversed />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => formatUsd(Number(v))} />
                <Bar dataKey="cost_usd" fill="#7c5cfc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">پرهزینه‌ترین مدل‌ها</h3>
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-right py-2">مدل</th>
                    <th className="text-right py-2">درخواست</th>
                    <th className="text-right py-2">هزینه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {data.by_model.map((m) => (
                    <tr key={m.model}>
                      <td className="py-2 dark:text-slate-200">{m.model}</td>
                      <td className="py-2 dark:text-slate-200">{m.requests}</td>
                      <td className="py-2 dark:text-slate-200">{formatUsd(m.cost_usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">سودآوری هر پلن</h3>
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-right py-2">پلن</th>
                    <th className="text-right py-2">درآمد</th>
                    <th className="text-right py-2">هزینه</th>
                    <th className="text-right py-2">حاشیه</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {data.by_plan.map((p) => (
                    <tr key={p.plan}>
                      <td className="py-2 dark:text-slate-200">{AI_PLAN_LABELS[p.plan] ?? p.plan}</td>
                      <td className="py-2 dark:text-slate-200">{formatToman(p.revenue_toman)}</td>
                      <td className="py-2 dark:text-slate-200">{formatUsd(p.cost_usd)}</td>
                      <td className={`py-2 font-semibold ${p.margin_percent >= 0 ? 'text-green-600' : 'text-red-600'}`}>{p.margin_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> ناهنجاری مصرف (Z-Score &gt; ۲ در ۷ روز اخیر)
            </h3>
            {data.anomalies.length === 0 ? (
              <p className="text-sm text-slate-400">ناهنجاری قابل‌توجهی شناسایی نشد.</p>
            ) : (
              <table className="w-full text-sm" dir="rtl">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <th className="text-right py-2">کاربر</th>
                    <th className="text-right py-2">Z-Score</th>
                    <th className="text-right py-2">هزینه ۷ روز</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {data.anomalies.map((a) => (
                    <tr key={a.user_id}>
                      <td className="py-2 dark:text-slate-200" dir="ltr">{a.phone}</td>
                      <td className="py-2 text-red-600 font-semibold">{a.z_score}</td>
                      <td className="py-2 dark:text-slate-200">{formatUsd(a.cost_usd_7d)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
