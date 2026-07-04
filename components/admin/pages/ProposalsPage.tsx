'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { FileText, Plus, ArrowRight } from 'lucide-react';
import { fetchInvoices, fetchInvoiceById, fetchSalesLeads } from '@/lib/adminApi';
import {
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
  mapLeadRow,
  mapProposalFromInvoice,
} from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface ProposalsListProps {
  panelLabel: string;
  detailBasePath: string;
  newHref?: string;
}

export function ProposalsListPage({ panelLabel, detailBasePath, newHref }: ProposalsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, loading, error } = useAdminFetch(() => fetchInvoices({ kind: 'proforma' }), []);
  const { data: leadsData } = useAdminFetch(
    () => fetchSalesLeads({ status: 'qualified' }),
    []
  );

  const proposals = useMemo(
    () => (data?.invoices ?? []).map(mapProposalFromInvoice),
    [data]
  );

  const filtered = proposals.filter((p) => {
    const matchSearch = !search || p.client.includes(search) || p.service.includes(search) || p.number.includes(search);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const interestedLeads = useMemo(() => {
    if (panelLabel !== 'فروش') return [];
    return (leadsData?.leads ?? []).map(mapLeadRow);
  }, [leadsData, panelLabel]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پیشنهادهای قیمت"
        description="مدیریت پیشنهادها و پیش‌فاکتورها"
        icon={FileText}
        breadcrumb={[{ label: panelLabel }, { label: 'پیشنهاد قیمت‌ها' }]}
        actions={newHref ? (
          <Link href={newHref} className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            پیشنهاد جدید
          </Link>
        ) : undefined}
      />

      {interestedLeads.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
          <h3 className="text-sm font-bold text-violet-900 mb-2">لیدهای واجد شرایط — تبدیل به پیشنهاد</h3>
          <div className="flex flex-wrap gap-2">
            {interestedLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/sales/proposals/new?leadId=${lead.id}`}
                className="bg-white border border-violet-200 rounded-lg px-3 py-2 text-sm hover:border-violet-400 transition-colors"
              >
                <span className="font-medium text-slate-800">{lead.name}</span>
                <span className="text-slate-500 mr-2">· {lead.need}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی پیشنهاد..."
          count={filtered.length}
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [{ value: 'all', label: 'همه وضعیت‌ها' }, ...Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))],
          }]}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['شماره پیشنهاد', 'مشتری', 'خدمت', 'مبلغ', 'وضعیت', 'ارسال', 'اعتبار', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((proposal) => (
                  <tr
                    key={proposal.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`${detailBasePath}/${proposal.id}`)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{proposal.number}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{proposal.client}</td>
                    <td className="px-4 py-3.5 text-slate-600">{proposal.service}</td>
                    <td className="px-4 py-3.5 tabular-nums font-medium">{formatCurrency(proposal.amount)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={INVOICE_STATUS_LABELS[proposal.status] ?? proposal.status} colorClass={INVOICE_STATUS_COLORS[proposal.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{proposal.sentDate}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{proposal.expiryDate}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`${detailBasePath}/${proposal.id}`) }]} />
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

export function ProposalDetailPage({ id, backHref, panelLabel }: { id: string; backHref: string; panelLabel: string }) {
  const { data, loading, error } = useAdminFetch(() => fetchInvoiceById(id), [id]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  const proposal = data?.invoice ? mapProposalFromInvoice(data.invoice) : null;

  if (!proposal) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>پیشنهاد یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">بازگشت</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={proposal.number}
        description={`${proposal.client} · ${proposal.service}`}
        icon={FileText}
        breadcrumb={[{ label: panelLabel }, { label: 'پیشنهادها', href: backHref }, { label: proposal.number }]}
        actions={
          <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
            <ArrowRight className="w-4 h-4" />
            بازگشت
          </Link>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge label={INVOICE_STATUS_LABELS[proposal.status] ?? proposal.status} colorClass={INVOICE_STATUS_COLORS[proposal.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
          <span className="text-lg font-bold text-slate-900">{formatCurrency(proposal.amount)}</span>
        </div>
        <InfoRow label="مشتری" value={proposal.client} />
        <InfoRow label="خدمت پیشنهادی" value={proposal.service} />
        <InfoRow label="تاریخ ارسال" value={proposal.sentDate} />
        <InfoRow label="اعتبار تا" value={proposal.expiryDate} />
        {proposal.notes && <InfoRow label="یادداشت" value={proposal.notes} />}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <span className="text-slate-400">{label}: </span>
      <span className="text-slate-800">{value}</span>
    </div>
  );
}
