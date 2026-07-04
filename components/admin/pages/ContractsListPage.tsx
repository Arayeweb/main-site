'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { DocumentStatusBadge } from '@/components/admin/ui/PriorityBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { FileCheck, Plus } from 'lucide-react';
import { fetchContracts } from '@/lib/adminApi';
import { mapContractRow } from '@/lib/adminMappers';
import {
  CONTRACT_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  CONTRACT_PAYMENT_STATUS_LABELS,
  CONTRACT_PAYMENT_STATUS_COLORS,
} from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface ContractsListProps {
  panelLabel?: string;
  showCreate?: boolean;
}

export function ContractsListPage({ panelLabel = 'مدیریت', showCreate = true }: ContractsListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, loading, error } = useAdminFetch(() => fetchContracts(), []);
  const contracts = useMemo(() => (data?.contracts ?? []).map(mapContractRow), [data]);

  const filtered = contracts.filter((c) => {
    const matchSearch = !search || c.client.includes(search) || c.number.includes(search);
    const matchStatus = statusFilter === 'all' || c.signatureStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="قراردادها"
        description="مدیریت قراردادهای مشتریان"
        icon={FileCheck}
        breadcrumb={[{ label: panelLabel }, { label: 'قراردادها' }]}
        actions={showCreate ? (
          <Link href="/admin/manager/contracts/new" className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            قرارداد جدید
          </Link>
        ) : undefined}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی قرارداد..."
          count={filtered.length}
          countLabel="قرارداد"
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [{ value: 'all', label: 'همه وضعیت‌ها' }, ...Object.entries(CONTRACT_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))],
          }]}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['شماره قرارداد', 'مشتری', 'نوع', 'مبلغ', 'شروع', 'پایان', 'وضعیت امضا', 'وضعیت پرداخت', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/admin/manager/contracts/${contract.id}`)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-600">{contract.number}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{contract.client}</td>
                    <td className="px-4 py-3.5 text-slate-600">{CONTRACT_TYPE_LABELS[contract.type] ?? contract.type}</td>
                    <td className="px-4 py-3.5 font-medium tabular-nums">{formatCurrency(contract.amount)}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{contract.startDate}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{contract.endDate}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={CONTRACT_STATUS_LABELS[contract.signatureStatus] ?? contract.signatureStatus} colorClass={CONTRACT_STATUS_COLORS[contract.signatureStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5">
                      <DocumentStatusBadge label={CONTRACT_PAYMENT_STATUS_LABELS[contract.paymentStatus] ?? contract.paymentStatus} colorClass={CONTRACT_PAYMENT_STATUS_COLORS[contract.paymentStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu actions={[{ label: 'مشاهده', onClick: () => router.push(`/admin/manager/contracts/${contract.id}`) }]} />
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
