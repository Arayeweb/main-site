'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Kanban, Phone, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import {
  fetchInvoices,
  fetchSalesLeads,
  fetchSalesTeam,
  patchSalesLead,
} from '@/lib/adminApi';
import {
  CRM_STATUS_LABELS,
  isOverdue,
  mapLeadRow,
  resolveOwnerLabel,
} from '@/lib/adminMappers';
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

type MappedLead = ReturnType<typeof mapLeadRow> & { assignedTo: string };

function parseBudgetAmount(budget: string): number | null {
  if (!budget || budget === '—') return null;
  const n = Number(String(budget).replace(/[^\d]/g, ''));
  return n > 0 ? n : null;
}

export default function PipelinePage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'me'>('all');
  const [allLeads, setAllLeads] = useState<MappedLead[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const dragMoved = useRef(false);

  const { data: teamData } = useAdminFetch(() => fetchSalesTeam(), []);
  const { data: invoicesData } = useAdminFetch(() => fetchInvoices({ kind: 'proforma' }), []);

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchSalesLeads({
        page_num: page,
        page_size: 100,
        owner: ownerFilter === 'me' ? 'me' : undefined,
      }),
    [page, ownerFilter]
  );

  const teamById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of teamData?.team ?? []) {
      map.set(m.id, m.name?.trim() || m.email || m.id.slice(0, 8));
    }
    return map;
  }, [teamData]);

  const amountByLeadId = useMemo(() => {
    const map = new Map<string, number>();
    const invoices = invoicesData?.invoices ?? [];
    // newest first assumption from API; keep first seen per lead_id
    for (const inv of invoices) {
      const leadId = inv.lead_id;
      if (!leadId || map.has(leadId)) continue;
      const total = Number(inv.grand_total) || 0;
      if (total > 0) map.set(leadId, total);
    }
    return map;
  }, [invoicesData]);

  useEffect(() => {
    setPage(0);
  }, [ownerFilter]);

  useEffect(() => {
    if (!data?.leads) return;
    const mapped = data.leads.map((raw) => {
      const row = mapLeadRow(raw);
      return { ...row, assignedTo: resolveOwnerLabel(row.ownerId, teamById) };
    });
    setAllLeads((prev) => {
      if (page === 0) return mapped;
      const ids = new Set(prev.map((l) => l.id));
      return [...prev, ...mapped.filter((l) => !ids.has(l.id))];
    });
  }, [data, page, teamById]);

  function dealAmount(lead: MappedLead): number | null {
    return amountByLeadId.get(lead.id) ?? parseBudgetAmount(lead.budget);
  }

  async function moveLead(leadId: string, nextStatus: string) {
    const prev = allLeads;
    const current = prev.find((l) => l.id === leadId);
    if (!current || current.status === nextStatus) return;

    setAllLeads((list) => list.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l)));
    const res = await patchSalesLead(leadId, { crm_status: nextStatus });
    if (!res.ok) {
      setAllLeads(prev);
      window.alert(`خطا در تغییر وضعیت: ${res.error}`);
      return;
    }
    refetch();
  }

  if (loading && page === 0) return <AdminLoadingState />;
  if (error && !data) return <AdminErrorState error={error} />;

  if (allLeads.length === 0 && !loading) {
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
        description={`${allLeads.length} لید — کارت را بکشید تا وضعیت عوض شود`}
        icon={Kanban}
        breadcrumb={[{ label: 'فروش' }, { label: 'پایپ‌لاین' }]}
        actions={
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setOwnerFilter('all')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md',
                ownerFilter === 'all' ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-600'
              )}
            >
              همه
            </button>
            <button
              type="button"
              onClick={() => setOwnerFilter('me')}
              className={cn(
                'px-3 py-1.5 text-sm rounded-md',
                ownerFilter === 'me' ? 'bg-white shadow-sm font-medium text-slate-900' : 'text-slate-600'
              )}
            >
              لیدهای من
            </button>
          </div>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_COLUMNS.map((status) => {
          const columnLeads = allLeads.filter((l) => l.status === status);
          return (
            <div key={status} className="flex-shrink-0 w-64">
              <div
                className={cn(
                  'bg-white border border-slate-200 rounded-xl overflow-hidden border-t-2 min-h-[200px]',
                  COLUMN_ACCENT[status],
                  dropTarget === status && 'ring-2 ring-blue-400 ring-offset-1'
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDropTarget(status);
                }}
                onDragLeave={() => setDropTarget((t) => (t === status ? null : t))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDropTarget(null);
                  const leadId = e.dataTransfer.getData('text/lead-id') || draggingId;
                  setDraggingId(null);
                  if (leadId) void moveLead(leadId, status);
                }}
              >
                <div className="px-3 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700">{CRM_STATUS_LABELS[status]}</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5 font-medium">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="p-2 flex flex-col gap-2 min-h-[120px]">
                  {columnLeads.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-6">خالی — اینجا رها کنید</p>
                  )}
                  {columnLeads.map((lead) => {
                    const amount = dealAmount(lead);
                    const overdue = isOverdue(lead.nextFollowUpRaw);
                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => {
                          dragMoved.current = false;
                          setDraggingId(lead.id);
                          e.dataTransfer.setData('text/lead-id', lead.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDrag={(e) => {
                          if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) {
                            dragMoved.current = true;
                          }
                        }}
                        onDragEnd={() => {
                          setDraggingId(null);
                          setDropTarget(null);
                        }}
                        onClick={() => {
                          if (dragMoved.current) return;
                          router.push(`/admin/sales/leads/${lead.id}`);
                        }}
                        className={cn(
                          'bg-slate-50 border border-slate-200 rounded-lg p-3 hover:shadow-sm hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing text-right',
                          draggingId === lead.id && 'opacity-50'
                        )}
                      >
                        <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
                        {amount != null && (
                          <p className="text-xs font-medium text-emerald-700 mt-1 tabular-nums">
                            {formatCurrency(amount)}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{lead.need}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400" dir="ltr">
                            {lead.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={cn('text-xs', overdue ? 'text-red-600 font-medium' : 'text-slate-400')}>
                            {lead.nextFollowUp}
                            {overdue ? ' · سررسید گذشته' : ''}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400 truncate">{lead.sourceLabel}</span>
                          <span className="text-[10px] text-slate-500 shrink-0">{lead.assignedTo}</span>
                        </div>
                        <Link
                          href={`/admin/sales/leads/${lead.id}`}
                          className="sr-only"
                          onClick={(e) => e.stopPropagation()}
                        >
                          جزئیات
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data?.has_more && (
        <div className="text-center">
          <button type="button" onClick={() => setPage((p) => p + 1)} className="text-sm text-blue-600 hover:underline">
            بارگذاری بیشتر
          </button>
        </div>
      )}
    </div>
  );
}
