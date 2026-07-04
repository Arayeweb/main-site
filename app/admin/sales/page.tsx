'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/admin/ui/StatCard';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  UserPlus, Bell, FileText, Send, Award, TrendingUp, Megaphone, Link2, BarChart2,
} from 'lucide-react';
import { fetchAds, fetchInvoices, fetchSalesLeads, fetchSalesStats } from '@/lib/adminApi';
import {
  CRM_SOURCE_LABELS,
  mapAdCampaign,
  mapLeadRow,
  mapProposalFromInvoice,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function SalesDashboard() {
  const { data: statsData, loading: statsLoading, error: statsError } = useAdminFetch(() => fetchSalesStats(), []);
  const { data: leadsData, loading: leadsLoading } = useAdminFetch(() => fetchSalesLeads({ followup: 'due' }), []);
  const { data: proposalsData } = useAdminFetch(() => fetchInvoices({ kind: 'proforma', status: 'sent' }), []);
  const { data: adsData } = useAdminFetch(() => fetchAds(), []);

  const todayFollowUps = useMemo(() => (leadsData?.leads ?? []).map(mapLeadRow), [leadsData]);
  const openProposals = useMemo(
    () => (proposalsData?.invoices ?? []).map(mapProposalFromInvoice),
    [proposalsData]
  );
  const activeCampaigns = useMemo(() => (adsData?.ads ?? []).map(mapAdCampaign).slice(0, 4), [adsData]);

  if (statsLoading || leadsLoading) return <AdminLoadingState />;
  if (statsError) return <AdminErrorState error={statsError} />;

  const stats = statsData!;
  const bestSource = stats.by_source?.[0]?.key ?? '—';

  const KPI = [
    { title: 'لیدهای جدید', value: String(stats.pipeline.new ?? 0), subtitle: 'در پایپ‌لاین', icon: UserPlus, iconColor: 'text-blue-600' },
    { title: 'پیگیری‌های سررسید', value: String(stats.followups_due), subtitle: 'نیاز به اقدام', icon: Bell, iconColor: 'text-amber-600' },
    { title: 'پیشنهادهای باز', value: String(stats.pipeline.proposal ?? 0), subtitle: 'در انتظار پاسخ', icon: FileText, iconColor: 'text-violet-600' },
    { title: 'پیش‌فاکتورهای ارسال‌شده', value: String(openProposals.length), subtitle: 'فعال', icon: Send, iconColor: 'text-sky-600' },
    { title: 'فروش بسته‌شده', value: String(stats.won_this_month), subtitle: 'این ماه', icon: Award, iconColor: 'text-green-600' },
    { title: 'نرخ تبدیل', value: `${stats.win_rate}٪`, subtitle: 'لید به فروش', icon: TrendingUp, iconColor: 'text-teal-600' },
    { title: 'بهترین منبع لید', value: CRM_SOURCE_LABELS[bestSource] ?? bestSource, subtitle: 'بیشترین تعداد', icon: Link2, iconColor: 'text-indigo-600' },
    { title: 'رکوردهای تبلیغات', value: String(adsData?.ads?.length ?? 0), subtitle: 'ثبت‌شده', icon: Megaphone, iconColor: 'text-orange-600' },
  ];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="داشبورد فروش"
        description="مدیریت لیدها، پیشنهادها و کمپین‌ها"
        icon={BarChart2}
        breadcrumb={[{ label: 'آرایه' }, { label: 'فروش' }, { label: 'داشبورد' }]}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {KPI.map((k) => (
          <StatCard key={k.title} {...k} />
        ))}
      </div>

      {todayFollowUps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="text-sm font-bold text-amber-900 mb-3">پیگیری‌های سررسید ({todayFollowUps.length})</h2>
          <div className="flex flex-wrap gap-2">
            {todayFollowUps.map((lead) => (
              <Link
                key={lead.id}
                href="/admin/sales/followups"
                className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm hover:border-amber-400 transition-colors"
              >
                <span className="font-medium text-slate-800">{lead.name}</span>
                <span className="text-slate-500 mr-2">· {lead.need}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">پیش‌فاکتورهای ارسال‌شده</h2>
            <Link href="/admin/sales/proposals" className="text-xs text-blue-600 hover:underline">همه</Link>
          </div>
          <div className="space-y-3">
            {openProposals.length === 0 && <p className="text-sm text-slate-400">پیش‌فاکتور فعالی نیست</p>}
            {openProposals.slice(0, 4).map((p) => (
              <Link key={p.id} href={`/admin/sales/proposals/${p.id}`} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.client}</p>
                  <p className="text-xs text-slate-400">{p.service}</p>
                </div>
                <span className="text-xs text-slate-500">{p.sentDate}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900">تبلیغات اخیر</h2>
            <Link href="/admin/sales/campaigns" className="text-xs text-blue-600 hover:underline">همه</Link>
          </div>
          <div className="space-y-3">
            {activeCampaigns.length === 0 && <p className="text-sm text-slate-400">رکورد تبلیغاتی ثبت نشده</p>}
            {activeCampaigns.map((c) => (
              <Link key={c.id} href={`/admin/manager/campaigns/${c.id}`} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 -mx-2 px-2 rounded">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.channel} · {c.leads} لید</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <QuickLink href="/admin/sales/leads" label="مدیریت لیدها" />
        <QuickLink href="/admin/sales/proposals/new" label="پیشنهاد جدید" />
        <QuickLink href="/admin/sales/lead-sources" label="منابع لید" />
        <QuickLink href="/admin/sales/pipeline" label="پایپ‌لاین" />
      </div>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm text-slate-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors">
      {label}
    </Link>
  );
}
