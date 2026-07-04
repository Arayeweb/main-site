'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Megaphone, Plus } from 'lucide-react';
import { fetchAds } from '@/lib/adminApi';
import { mapAdCampaign } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface CampaignsListProps {
  panelLabel?: string;
}

export function CampaignsListPage({ panelLabel = 'مدیریت' }: CampaignsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, loading, error } = useAdminFetch(() => fetchAds(), []);
  const campaigns = useMemo(() => (data?.ads ?? []).map(mapAdCampaign), [data]);

  const filtered = campaigns.filter((c) => !search || c.name.includes(search));

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="کمپین‌ها"
        description="مدیریت کمپین‌های بازاریابی و تبلیغات"
        icon={Megaphone}
        breadcrumb={[{ label: panelLabel }, { label: 'کمپین‌ها' }]}
        actions={
          <button className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            رکورد تبلیغات
          </button>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی کمپین..."
          count={filtered.length}
          countLabel="رکورد"
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['نام کمپین', 'پلتفرم', 'تاریخ', 'هزینه', 'لید', ''].map((h) => (
                    <th key={h} className="text-right px-3 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/manager/campaigns/${campaign.id}`)}
                  >
                    <td className="px-3 py-3.5 font-medium text-slate-800">{campaign.name}</td>
                    <td className="px-3 py-3.5 text-slate-600">{campaign.channel}</td>
                    <td className="px-3 py-3.5 text-slate-500 tabular-nums">{campaign.startDate}</td>
                    <td className="px-3 py-3.5 tabular-nums">{formatCurrency(campaign.spend)}</td>
                    <td className="px-3 py-3.5 text-center tabular-nums">{campaign.leads}</td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`/admin/manager/campaigns/${campaign.id}`) }]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
