'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Bell, Phone, Calendar, User } from 'lucide-react';
import { fetchSalesLeads } from '@/lib/adminApi';
import { CRM_STATUS_COLORS, CRM_STATUS_LABELS, mapLeadRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function FollowupsPage() {
  const { data, loading, error } = useAdminFetch(
    () => fetchSalesLeads({ followup: 'due' }),
    []
  );

  const leads = useMemo(() => (data?.leads ?? []).map(mapLeadRow), [data]);

  const { todayItems, upcomingItems } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const todaySet = new Set([today, tomorrow]);

    const withFollowup = leads.filter((l) => l.nextFollowUpRaw);
    const todayItems = withFollowup.filter((l) => todaySet.has(l.nextFollowUpRaw!.slice(0, 10)));
    const upcomingItems = withFollowup.filter((l) => !todaySet.has(l.nextFollowUpRaw!.slice(0, 10)));
    return { todayItems, upcomingItems };
  }, [leads]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پیگیری‌ها"
        description="لیدهایی که نیاز به پیگیری دارند"
        icon={Bell}
        breadcrumb={[{ label: 'فروش' }, { label: 'پیگیری‌های امروز' }]}
      />

      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full inline-block" />
          پیگیری امروز و فردا ({todayItems.length})
        </h2>
        {todayItems.length === 0 ? (
          <EmptyState title="پیگیری امروز ندارید" description="همه چیز به‌روز است." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {todayItems.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/sales/leads/${lead.id}`}
                className="bg-white border border-red-200 rounded-xl p-4 shadow-sm hover:border-red-300 transition-colors block"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                  <StatusBadge
                    label={CRM_STATUS_LABELS[lead.status] ?? lead.status}
                    colorClass={CRM_STATUS_COLORS[lead.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                  />
                </div>
                <p className="text-xs text-slate-600 mb-3">{lead.need} — {lead.business}</p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3 h-3" />
                    <span dir="ltr">{lead.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>پیگیری: {lead.nextFollowUp}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="w-3 h-3" />
                    <span>{lead.assignedTo}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {upcomingItems.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full inline-block" />
            پیگیری‌های آینده ({upcomingItems.length})
          </h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {upcomingItems.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/sales/leads/${lead.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{lead.name}</p>
                      <p className="text-xs text-slate-500">{lead.need} · {lead.business}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge
                      label={CRM_STATUS_LABELS[lead.status] ?? lead.status}
                      colorClass={CRM_STATUS_COLORS[lead.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                    />
                    <span className="text-xs text-slate-500 tabular-nums">{lead.nextFollowUp}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
