'use client';

import { useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Link2 } from 'lucide-react';
import { fetchSalesLeads, fetchSalesStats } from '@/lib/adminApi';
import { CRM_SOURCE_LABELS } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

interface LeadSourcesPageProps {
  panelLabel: string;
}

export function LeadSourcesPage({ panelLabel }: LeadSourcesPageProps) {
  const { data: statsData, loading: sLoading, error: sError } = useAdminFetch(() => fetchSalesStats(), []);
  const { data: leadsData, loading: lLoading, error: lError } = useAdminFetch(() => fetchSalesLeads(), []);

  const sources = useMemo(() => {
    const leads = leadsData?.leads ?? [];
    const map = new Map<string, { leads: number; qualified: number; proposal: number; won: number }>();

    for (const l of leads) {
      const key = l.source || 'unknown';
      const row = map.get(key) ?? { leads: 0, qualified: 0, proposal: 0, won: 0 };
      row.leads += 1;
      const status = l.crm_status ?? 'new';
      if (status === 'qualified' || status === 'contacted') row.qualified += 1;
      if (status === 'proposal') row.proposal += 1;
      if (status === 'won') row.won += 1;
      map.set(key, row);
    }

    const fromStats = statsData?.by_source ?? [];
    if (fromStats.length > 0) {
      return fromStats.map((s) => {
        const agg = map.get(s.key) ?? { leads: s.count, qualified: 0, proposal: 0, won: 0 };
        return {
          source: s.key,
          label: CRM_SOURCE_LABELS[s.key] ?? s.key,
          leads: s.count,
          qualified: agg.qualified,
          proposal: agg.proposal,
          won: agg.won,
          conversion: s.count > 0 ? Math.round((agg.won / s.count) * 100) : 0,
        };
      });
    }

    return Array.from(map.entries()).map(([source, agg]) => ({
      source,
      label: CRM_SOURCE_LABELS[source] ?? source,
      leads: agg.leads,
      qualified: agg.qualified,
      proposal: agg.proposal,
      won: agg.won,
      conversion: agg.leads > 0 ? Math.round((agg.won / agg.leads) * 100) : 0,
    }));
  }, [statsData, leadsData]);

  if (sLoading || lLoading) return <AdminLoadingState />;
  if (sError) return <AdminErrorState error={sError} />;
  if (lError) return <AdminErrorState error={lError} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="منابع لید"
        description="تحلیل عملکرد منابع جذب مشتری"
        icon={Link2}
        breadcrumb={[{ label: panelLabel }, { label: 'منابع لید' }]}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {sources.length === 0 ? (
          <EmptyState title="داده‌ای یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['منبع', 'تعداد لید', 'واجد شرایط', 'پیشنهاد', 'فروش', 'نرخ تبدیل'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sources.map((source) => (
                  <tr key={source.source} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{source.label}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{source.leads}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{source.qualified}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{source.proposal}</td>
                    <td className="px-4 py-3.5 text-center tabular-nums">{source.won}</td>
                    <td className="px-4 py-3.5 tabular-nums font-medium text-green-700">{source.conversion}٪</td>
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
