'use client';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiOverview } from '@/lib/aiAdminApi';
import { formatToman, formatUsd, formatNum, formatFaDate, AI_PLAN_LABELS } from '@/lib/aiAdminTypes';
import {
  LayoutDashboard, Users, TrendingUp, Wallet, Percent, Coins, UserMinus, AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import Link from 'next/link';

export default function AiOpsOverviewPage() {
  const { data, loading, error } = useAiOpsFetch(() => fetchAiOverview(), []);

  return (
    <div>
      <AdminPageHeader
        title="داشبورد عملیات Araaye AI"
        description="تصویر کلی درآمد، هزینه، حاشیه سود و هشدارهای کسب‌وکار."
        icon={LayoutDashboard}
      />

      {loading && <AiOpsLoadingState />}
      {error && <AiOpsErrorState error={error} />}

      {data && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="کاربران کل" value={formatNum(data.kpis.total_users)} icon={Users} iconColor="text-blue-600" />
            <StatCard title="کاربران فعال (۳۰ روز)" value={formatNum(data.kpis.active_users_30d)} icon={Users} iconColor="text-teal-600" />
            <StatCard title="MRR تخمینی" value={formatToman(data.kpis.mrr_toman)} icon={Wallet} iconColor="text-green-600" />
            <StatCard title="درآمد ۳۰ روز" value={formatToman(data.kpis.revenue_30d_toman)} icon={TrendingUp} iconColor="text-green-600" />
            <StatCard title="هزینه API (۳۰ روز)" value={formatUsd(data.kpis.cost_30d_usd)} icon={Coins} iconColor="text-amber-600" />
            <StatCard
              title="حاشیه سود ناخالص"
              value={`${data.kpis.gross_margin_percent}%`}
              icon={Percent}
              iconColor={data.kpis.gross_margin_percent >= 0 ? 'text-green-600' : 'text-red-600'}
            />
            <StatCard title="کردیت مصرف‌شده (۳۰ روز)" value={formatNum(data.kpis.credits_consumed_30d)} icon={Coins} iconColor="text-violet-600" />
            <StatCard title="نرخ ریزش تقریبی" value={`${data.kpis.churn_percent}%`} icon={UserMinus} iconColor="text-red-600" />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">درآمد در برابر هزینه API — ۳۰ روز اخیر</h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.revenue_vs_cost}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} reversed />
                <YAxis yAxisId="rev" orientation="right" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="cost" orientation="left" tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value, name) =>
                    name === 'revenue_toman' ? [formatToman(Number(value)), 'درآمد'] : [formatUsd(Number(value)), 'هزینه']
                  }
                />
                <Area yAxisId="rev" type="monotone" dataKey="revenue_toman" stroke="#16a34a" fill="url(#rev)" strokeWidth={2} />
                <Area yAxisId="cost" type="monotone" dataKey="cost_usd" stroke="#f59e0b" fill="url(#cost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">توزیع پلن‌ها</h3>
              <div className="flex flex-col gap-2">
                {data.plan_distribution.map((p) => (
                  <div key={p.plan} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{AI_PLAN_LABELS[p.plan] ?? p.plan}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{formatNum(p.count)}</span>
                  </div>
                ))}
              </div>
            </div>

            <AlertCard
              title="ارائه‌دهنده‌های دارای اختلال"
              icon={AlertTriangle}
              empty="همه ارائه‌دهنده‌ها سالم هستند."
              items={data.alerts.failing_providers.map((p) => ({
                key: p.id,
                primary: p.name,
                secondary: `وضعیت: ${p.status} — خطا: ${(p.error_rate * 100).toFixed(1)}%`,
              }))}
              href="/admin/ai-ops/providers"
            />

            <AlertCard
              title="تیکت‌های فوری"
              icon={AlertTriangle}
              empty="تیکت فوری بازی وجود ندارد."
              items={data.alerts.urgent_tickets.map((t) => ({
                key: t.id,
                primary: t.subject,
                secondary: formatFaDate(t.created_at),
              }))}
              href="/admin/ai-ops/tickets"
            />

            <AlertCard
              title="پرداخت‌های ناموفق اخیر"
              icon={AlertTriangle}
              empty="پرداخت ناموفقی ثبت نشده."
              items={data.alerts.failed_payments.map((p) => ({
                key: p.id,
                primary: p.user_phone,
                secondary: `${formatToman(p.amount_toman)} — ${formatFaDate(p.created_at)}`,
              }))}
              href="/admin/ai-ops/payments?status=failed"
            />

            <AlertCard
              title="کاربران با حاشیه سود منفی"
              icon={AlertTriangle}
              empty="کاربر پرهزینه‌ای شناسایی نشد."
              items={data.alerts.negative_margin_users.map((u) => ({
                key: u.id,
                primary: u.phone,
                secondary: `هزینه: ${formatUsd(u.cost_usd)} — درآمد پلن: ${formatToman(u.revenue_toman)}`,
              }))}
              href="/admin/ai-ops/users"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function AlertCard({
  title,
  icon: Icon,
  items,
  empty,
  href,
}: {
  title: string;
  icon: React.ElementType;
  items: { key: string; primary: string; secondary: string }[];
  empty: string;
  href: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon className="w-4 h-4 text-amber-500" />
          {title}
        </h3>
        <Link href={href} className="text-xs text-violet-600 hover:underline">
          مشاهده
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 dark:text-slate-500">{empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.slice(0, 5).map((it) => (
            <div key={it.key} className="text-xs border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0 last:pb-0">
              <p className="font-medium text-slate-800 dark:text-slate-200">{it.primary}</p>
              <p className="text-slate-400 dark:text-slate-500 mt-0.5">{it.secondary}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
