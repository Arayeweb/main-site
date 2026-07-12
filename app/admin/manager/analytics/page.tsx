'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Eye,
  Users,
  LineChart,
  MousePointerClick,
  ShoppingCart,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '@/components/admin/ui/StatCard';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { fetchAdminStats, fetchAnalyticsEvents, type AdminStatsGroup } from '@/lib/adminApi';
import { CRM_SOURCE_LABELS } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

const FUNNEL_STEPS = [
  { key: 'pkg_selected', label: 'انتخاب پکیج' },
  { key: 'begin_checkout', label: 'شروع پرداخت' },
  { key: 'purchase', label: 'خرید' },
  { key: 'generate_lead', label: 'ثبت لید' },
] as const;

function RankTable({
  title,
  rows,
  labelMap,
  emptyMsg,
}: {
  title: string;
  rows: AdminStatsGroup[];
  labelMap?: Record<string, string>;
  emptyMsg: string;
}) {
  const max = rows[0]?.count ?? 1;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-3">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyMsg}</p>
      ) : (
        <table className="w-full text-sm" dir="rtl">
          <tbody className="divide-y divide-slate-50">
            {rows.map((r) => {
              const pct = Math.round((r.count / max) * 100);
              const label = labelMap?.[r.key] ?? r.key;
              return (
                <tr key={r.key}>
                  <td className="py-2 pr-2 text-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="truncate">{label}</span>
                    </div>
                  </td>
                  <td className="py-2 text-left font-semibold text-teal-700 tabular-nums w-12">{r.count.toLocaleString('fa-IR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default function ManagerAnalyticsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const {
    data: stats,
    loading: statsLoading,
    error: statsError,
  } = useAdminFetch(() => fetchAdminStats(), [refreshKey]);
  const {
    data: events,
    loading: eventsLoading,
    error: eventsError,
  } = useAdminFetch(() => fetchAnalyticsEvents(), [refreshKey]);

  const chartData = useMemo(() => {
    if (!stats?.last_7_days) return [];
    return stats.last_7_days.map((d) => ({
      date: d.date.slice(5),
      views: d.views,
      leads: d.leads,
    }));
  }, [stats]);

  const funnelMax = useMemo(() => {
    if (!events?.funnel) return 1;
    return Math.max(...FUNNEL_STEPS.map((s) => events.funnel[s.key] ?? 0), 1);
  }, [events]);

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  if (statsLoading || eventsLoading) return <AdminLoadingState />;
  if (statsError) return <AdminErrorState error={statsError} />;
  if (eventsError) return <AdminErrorState error={eventsError} />;
  if (!stats || !events) return null;

  const leadSourceRows = (stats.by_source ?? []).map((r) => ({
    key: r.key,
    count: r.count,
  }));

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="آمار و بازاریابی"
        description="بازدید صفحات، UTM، رویدادهای GTM و قیف تبدیل"
        icon={LineChart}
        breadcrumb={[{ label: 'آرایه' }, { label: 'مدیریت' }, { label: 'آمار' }]}
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600"
          >
            <RefreshCw className="w-4 h-4" />
            به‌روزرسانی
          </button>
        }
      />

      <section>
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">بازدید و لید</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="کل بازدید" value={stats.total_views.toLocaleString('fa-IR')} subtitle="صفحات سایت" icon={Eye} iconColor="text-blue-600" />
          <StatCard title="بازیدیدکنندگان یکتا" value={(stats.unique_visitors ?? 0).toLocaleString('fa-IR')} subtitle="visitor_id مجزا" icon={Users} iconColor="text-emerald-600" />
          <StatCard title="کل لیدها" value={stats.total_leads.toLocaleString('fa-IR')} subtitle="ثبت‌شده" icon={Users} iconColor="text-violet-600" />
          <StatCard title="لید این هفته" value={stats.this_week.toLocaleString('fa-IR')} subtitle="۷ روز اخیر" icon={Users} iconColor="text-indigo-600" />
        </div>
      </section>

      <section>
        <h2 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">رویدادهای GTM</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="کل رویدادها" value={events.total_events.toLocaleString('fa-IR')} subtitle="ذخیره‌شده" icon={MousePointerClick} iconColor="text-teal-600" />
          <StatCard title="رویداد این هفته" value={events.this_week.toLocaleString('fa-IR')} subtitle="۷ روز اخیر" icon={MousePointerClick} iconColor="text-cyan-600" />
          <StatCard title="خریدها" value={(events.funnel.purchase ?? 0).toLocaleString('fa-IR')} subtitle="purchase" icon={ShoppingCart} iconColor="text-green-600" />
          <StatCard
            title="نرخ تبدیل پرداخت"
            value={`${events.checkout_to_purchase_rate}٪`}
            subtitle="checkout → purchase"
            icon={LineChart}
            iconColor="text-amber-600"
          />
        </div>
      </section>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">روند ۷ روز اخیر — بازدید و لید</h3>
        {chartData.length === 0 ? (
          <p className="text-sm text-slate-400">داده‌ای موجود نیست</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} reversed />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" name="بازدید" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="leads" name="لید" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <RankTable title="منبع UTM (بازدید)" rows={stats.by_utm_source ?? []} emptyMsg="بازدید UTM‌دار ثبت نشده" />
        <RankTable title="کمپین UTM (بازدید)" rows={stats.by_utm_campaign ?? []} emptyMsg="کمپینی یافت نشد" />
        <RankTable
          title="منبع لید"
          rows={leadSourceRows}
          labelMap={CRM_SOURCE_LABELS}
          emptyMsg="لیدی ثبت نشده"
        />
        <RankTable title="صفحه (بازدید)" rows={stats.by_page ?? []} emptyMsg="بازدیدی ثبت نشده" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">قیف تبدیل GTM</h3>
          <div className="space-y-3">
            {FUNNEL_STEPS.map((step) => {
              const count = events.funnel[step.key] ?? 0;
              const pct = Math.round((count / funnelMax) * 100);
              return (
                <div key={step.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700">{step.label}</span>
                    <span className="font-semibold tabular-nums text-slate-900">{count.toLocaleString('fa-IR')}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-l from-teal-500 to-emerald-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{step.key}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <RankTable title="برترین رویدادها" rows={events.by_event} emptyMsg="رویدادی ثبت نشده — پس از deploy migration داده جمع می‌شود" />
          <RankTable title="رویداد بر اساس صفحه" rows={events.by_page} emptyMsg="داده‌ای موجود نیست" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RankTable title="رویداد بر اساس source" rows={events.by_source} emptyMsg="داده‌ای موجود نیست" />
        <RankTable title="رویداد بر اساس پکیج" rows={events.by_package} emptyMsg="داده‌ای موجود نیست" />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4">رویدادهای GTM — ۳۰ روز اخیر</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={events.last_30_days.map((d) => ({ date: d.date.slice(5), count: d.count }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} reversed interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v) => Number(v).toLocaleString('fa-IR')} />
            <Bar dataKey="count" name="رویداد" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-400 text-center pb-4">
        بازدیدها از <code className="text-slate-500">page_views</code> و رویدادها از{' '}
        <code className="text-slate-500">analytics_events</code> —{' '}
        <Link href="/admin/manager/campaigns" className="text-blue-600 hover:underline">کمپین‌های تبلیغاتی</Link>
      </p>
    </div>
  );
}
