'use client';

import { useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { PaymentStatusBadge } from '@/components/admin/ui/PriorityBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { Wrench } from 'lucide-react';
import { fetchMaintenancePlans } from '@/lib/adminApi';
import { mapMaintenancePlanRow } from '@/lib/adminMappers';
import {
  PLAN_TYPE_LABELS,
  PLAN_STATUS_LABELS,
  PLAN_STATUS_COLORS,
  MAINTENANCE_PAYMENT_STATUS_LABELS,
  MAINTENANCE_PAYMENT_STATUS_COLORS,
} from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatCurrency } from '@/lib/utils';

interface MaintenanceListProps {
  panelLabel: string;
}

export function MaintenanceListPage({ panelLabel }: MaintenanceListProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, loading, error } = useAdminFetch(() => fetchMaintenancePlans(), []);
  const plans = useMemo(() => (data?.plans ?? []).map(mapMaintenancePlanRow), [data]);

  const filtered = plans.filter((p) => {
    const matchSearch = !search || p.client.includes(search);
    const matchStatus = statusFilter === 'all' || p.supportStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پلن‌های پشتیبانی"
        description="مدیریت قراردادهای پشتیبانی و نگهداری"
        icon={Wrench}
        breadcrumb={[{ label: panelLabel }, { label: 'پلن‌های پشتیبانی' }]}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی مشتری..."
          count={filtered.length}
          filters={[{
            value: statusFilter,
            onChange: setStatusFilter,
            options: [{ value: 'all', label: 'همه وضعیت‌ها' }, ...Object.entries(PLAN_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v }))],
          }]}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['مشتری', 'پلن فعال', 'مبلغ ماهانه', 'شروع', 'تمدید', 'وضعیت پرداخت', 'وضعیت پشتیبانی', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-800">{plan.client}</td>
                    <td className="px-4 py-3.5 text-slate-600">{PLAN_TYPE_LABELS[plan.planType] ?? plan.planType}</td>
                    <td className="px-4 py-3.5 tabular-nums">{formatCurrency(plan.monthlyFee)}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{plan.startDate}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{plan.renewalDate}</td>
                    <td className="px-4 py-3.5">
                      <PaymentStatusBadge label={MAINTENANCE_PAYMENT_STATUS_LABELS[plan.paymentStatus] ?? plan.paymentStatus} colorClass={MAINTENANCE_PAYMENT_STATUS_COLORS[plan.paymentStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge label={PLAN_STATUS_LABELS[plan.supportStatus] ?? plan.supportStatus} colorClass={PLAN_STATUS_COLORS[plan.supportStatus] ?? 'bg-slate-50 text-slate-600 ring-slate-200'} />
                    </td>
                    <td className="px-4 py-3.5" />
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
