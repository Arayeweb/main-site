'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Kanban, Phone, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchSalesLeads } from '@/lib/adminApi';
import { CRM_STATUS_LABELS, mapLeadRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

const PIPELINE_COLUMNS = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const;

const COLUMN_ACCENT: Record<string, string> = {
  new: 'border-t-blue-400',
  contacted: 'border-t-sky-400',
  qualified: 'border-t-violet-400',
  proposal: 'border-t-amber-400',
  won: 'border-t-green-400',
  lost: 'border-t-red-400',
};

export default function PipelinePage() {
  const [page, setPage] = useState(0);
  const [allLeads, setAllLeads] = useState<ReturnType<typeof mapLeadRow>[]>([]);

  const { data, loading, error } = useAdminFetch(
    () => fetchSalesLeads({ page_num: page, page_size: 100 }),
    [page]
  );

  useEffect(() => {
    if (!data?.leads) return;
    const mapped = data.leads.map(mapLeadRow);
    setAllLeads((prev) => {
      if (page === 0) return mapped;
      const ids = new Set(prev.map((l) => l.id));
      return [...prev, ...mapped.filter((l) => !ids.has(l.id))];
    });
  }, [data, page]);

  const leads = useMemo(() => allLeads, [allLeads]);

  if (loading && page === 0) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  if (leads.length === 0) {
    return (
      <div className="flex flex-col gap-6" dir="rtl">
        <AdminPageHeader
          title="پایپ‌لاین فروش"
          description="مرحله‌بندی لیدها"
          icon={Kanban}
          breadcrumb={[{ label: 'فروش' }, { label: 'پایپ‌لاین' }]}
        />
        <EmptyState title="لیدی وجود ندارد" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پایپ‌لاین فروش"
        description={`${leads.length} لید بارگذاری‌شده`}
        icon={Kanban}
        breadcrumb={[{ label: 'فروش' }, { label: 'پایپ‌لاین' }]}
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((status) => {
          const columnLeads = leads.filter((l) => l.status === status);
          return (
            <div key={status} className="flex-shrink-0 w-60">
              <div className={cn('bg-white border border-slate-200 rounded-xl overflow-hidden border-t-2', COLUMN_ACCENT[status])}>
                <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700">{CRM_STATUS_LABELS[status]}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="p-2 flex flex-col gap-2 min-h-[120px]">
                  {columnLeads.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">خالی</p>
                  )}
                  {columnLeads.map((lead) => (
                    <Link
                      key={lead.id}
                      href={`/admin/sales/leads/${lead.id}`}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-sm hover:border-slate-300 transition-all block"
                    >
                      <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{lead.need}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400" dir="ltr">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{lead.nextFollowUp}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{lead.sourceLabel}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data?.has_more && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="text-sm text-blue-600 hover:underline"
          >
            بارگذاری لیدهای بیشتر
          </button>
        </div>
      )}
    </div>
  );
}
