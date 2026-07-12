'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActivityTimeline } from '@/components/admin/ui/ActivityTimeline';
import { Megaphone, ArrowRight, Users, DollarSign } from 'lucide-react';
import { fetchAds, fetchSalesLeads, fetchTickets } from '@/lib/adminApi';
import {
  buildRecentActivities,
  formatFaDate,
  mapAdCampaign,
} from '@/lib/adminMappers';
import { CAMPAIGN_CHANNEL_LABELS, CAMPAIGN_STATUS_COLORS, CAMPAIGN_STATUS_LABELS } from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface CampaignDetailPageProps {
  id: string;
  backHref: string;
  panelLabel: string;
}

export function CampaignDetailPage({ id, backHref, panelLabel }: CampaignDetailPageProps) {
  const { data: adsData, loading, error } = useAdminFetch(() => fetchAds(), [id]);
  const { data: leadsData } = useAdminFetch(() => fetchSalesLeads(), []);
  const { data: ticketsData } = useAdminFetch(() => fetchTickets(), []);

  const ad = useMemo(() => (adsData?.ads ?? []).find((a) => a.id === id), [adsData, id]);
  const campaign = useMemo(() => (ad ? mapAdCampaign(ad) : null), [ad]);

  const activities = useMemo(() => {
    if (!leadsData || !ticketsData) return [];
    return buildRecentActivities(leadsData.leads ?? [], ticketsData.tickets ?? [], []);
  }, [leadsData, ticketsData]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (!campaign || !ad) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>کمپین یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  const channelLabel = CAMPAIGN_CHANNEL_LABELS[campaign.channel] ?? campaign.channel;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={campaign.name}
        description={channelLabel}
        icon={Megaphone}
        breadcrumb={[{ label: panelLabel }, { label: 'کمپین‌ها', href: backHref }, { label: campaign.name }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <StatusBadge label={CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status} colorClass={CAMPAIGN_STATUS_COLORS[campaign.status] ?? 'bg-green-50 text-green-700 ring-green-200'} />
        <span className="text-sm text-slate-500">تاریخ: <strong className="text-slate-700">{formatFaDate(ad.date)}</strong></span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="هزینه" value={formatCurrency(campaign.spend)} icon={DollarSign} iconColor="text-amber-600" />
        <StatCard title="لید" value={String(campaign.leads)} icon={Users} iconColor="text-blue-600" />
        <StatCard title="نمایش" value={String(ad.impressions)} icon={Users} iconColor="text-sky-600" />
        <StatCard title="کلیک" value={String(ad.clicks)} icon={Users} iconColor="text-violet-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {ad.note && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2">یادداشت‌ها</h3>
            <p className="text-sm text-slate-600">{ad.note}</p>
          </div>
        )}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-3">فعالیت‌های اخیر</h3>
          <ActivityTimeline activities={activities.slice(0, 4)} />
        </div>
      </div>
    </div>
  );
}
