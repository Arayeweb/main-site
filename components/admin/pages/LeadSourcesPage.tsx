'use client';

import { useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Link2 } from 'lucide-react';
import { fetchLeadSources } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

interface LeadSourcesPageProps {
  panelLabel: string;
}

export function LeadSourcesPage({ panelLabel }: LeadSourcesPageProps) {
  const { data, loading, error } = useAdminFetch(() => fetchLeadSources(), []);

  const sources = useMemo(() => {
    return (data?.sources ?? []).map((s) => ({
      source: s.source,
      label: s.label,
      leads: s.leads,
      qualified: s.qualifiedLeads,
      proposal: s.proposals,
      won: s.sales,
      conversion: s.conversionRate,
    }));
  }, [data]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="منابع لید"
        description="تحلیل عملکرد منابع جذب مشتری (از کل دیتابیس)"
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
