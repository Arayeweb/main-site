'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Megaphone, Plus } from 'lucide-react';
import { createAd, fetchAds } from '@/lib/adminApi';
import { mapAdCampaign } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface CampaignsListProps {
  panelLabel?: string;
  detailBasePath?: string;
}

export function CampaignsListPage({ panelLabel = 'مدیریت', detailBasePath = '/admin/manager/campaigns' }: CampaignsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('instagram');
  const [campaignName, setCampaignName] = useState('');
  const [spend, setSpend] = useState('');
  const [leads, setLeads] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useAdminFetch(() => fetchAds(), []);
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
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            رکورد تبلیغات
          </button>
        }
      />

      {showForm && (
        <form
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3 max-w-xl"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const res = await createAd({
              date: new Date().toISOString().slice(0, 10),
              platform,
              campaign_name: campaignName || undefined,
              spend: Number(String(spend).replace(/[^\d]/g, '')) || 0,
              leads: Number(String(leads).replace(/[^\d]/g, '')) || 0,
            });
            setBusy(false);
            if (!res.ok) {
              alert(res.error);
              return;
            }
            setShowForm(false);
            setCampaignName('');
            setSpend('');
            setLeads('');
            refetch();
          }}
        >
          <select className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option value="instagram">اینستاگرام</option>
            <option value="google">گوگل</option>
            <option value="linkedin">لینکدین</option>
            <option value="other">سایر</option>
          </select>
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="نام کمپین" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="هزینه (تومان)" value={spend} onChange={(e) => setSpend(e.target.value)} />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="تعداد لید" value={leads} onChange={(e) => setLeads(e.target.value)} />
          <button type="submit" disabled={busy} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60">
            {busy ? 'در حال ذخیره...' : 'ثبت رکورد'}
          </button>
        </form>
      )}

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
                    onClick={() => router.push(`${detailBasePath}/${campaign.id}`)}
                  >
                    <td className="px-3 py-3.5 font-medium text-slate-800">{campaign.name}</td>
                    <td className="px-3 py-3.5 text-slate-600">{campaign.channel}</td>
                    <td className="px-3 py-3.5 text-slate-500 tabular-nums">{campaign.startDate}</td>
                    <td className="px-3 py-3.5 tabular-nums">{formatCurrency(campaign.spend)}</td>
                    <td className="px-3 py-3.5 text-center tabular-nums">{campaign.leads}</td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`${detailBasePath}/${campaign.id}`) }]} />
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
