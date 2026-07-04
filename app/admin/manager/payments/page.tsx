'use client';

import { useMemo } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { CreditCard, MoreHorizontal, Plus } from 'lucide-react';
import { fetchInvoices, fetchInvoiceSummary } from '@/lib/adminApi';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, mapInvoiceRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

export default function PaymentsPage() {
  const { data, loading, error } = useAdminFetch(
    () => fetchInvoices({ kind: 'invoice' }),
    []
  );
  const { data: summaryData } = useAdminFetch(() => fetchInvoiceSummary(), []);

  const payments = useMemo(
    () => (data?.invoices ?? []).map(mapInvoiceRow),
    [data]
  );

  const total = summaryData?.summary?.paid?.IRR ?? payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = summaryData?.summary?.outstanding?.IRR ?? payments.filter((p) => p.status === 'sent' || p.status === 'draft').reduce((s, p) => s + p.amount, 0);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پرداخت‌ها"
        description="مدیریت صورت‌حساب‌ها و پرداخت‌های پروژه"
        icon={CreditCard}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'پرداخت‌ها' }]}
        actions={
          <button className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Plus className="w-4 h-4" />
            صورت‌حساب جدید
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">مجموع دریافتی</p>
          <p className="text-2xl font-bold text-green-700 tabular-nums">
            {new Intl.NumberFormat('fa-IR').format(total)} تومان
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">در انتظار دریافت</p>
          <p className="text-2xl font-bold text-amber-700 tabular-nums">
            {new Intl.NumberFormat('fa-IR').format(pending)} تومان
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">تعداد صورت‌حساب</p>
          <p className="text-2xl font-bold text-slate-900">{payments.length}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {payments.length === 0 ? (
          <EmptyState title="صورت‌حسابی یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['شماره', 'مشتری', 'توضیح', 'مبلغ', 'وضعیت', 'سررسید', 'تاریخ پرداخت', ''].map((h) => (
                    <th key={h} className="text-right px-5 py-3 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-slate-400 font-mono">{p.invoice}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{p.client}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.description}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900 tabular-nums">
                      {new Intl.NumberFormat('fa-IR').format(p.amount)} تومان
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge
                        label={p.isOverdue ? 'معوقه' : (INVOICE_STATUS_LABELS[p.status] ?? p.status)}
                        colorClass={p.isOverdue ? 'bg-red-50 text-red-700 ring-red-200' : (INVOICE_STATUS_COLORS[p.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200')}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 tabular-nums">{p.dueDate}</td>
                    <td className="px-5 py-3.5 text-slate-500 tabular-nums">{p.paidDate ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <button className="p-1 rounded hover:bg-slate-100 text-slate-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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
