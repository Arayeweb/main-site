'use client';

import { useMemo, useState, useEffect } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { CreditCard, Plus } from 'lucide-react';
import { createInvoice, fetchInvoices, fetchInvoiceSummary, type ApiInvoice } from '@/lib/adminApi';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, mapInvoiceRow } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { invoicePrintHref } from '@/lib/invoicePrint';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';

export default function PaymentsPage() {
  const [page, setPage] = useState(0);
  const [allInvoices, setAllInvoices] = useState<ApiInvoice[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchInvoices({ kind: 'invoice', page }),
    [page]
  );
  const { data: summaryData } = useAdminFetch(() => fetchInvoiceSummary('invoice'), []);

  useEffect(() => {
    if (!data?.invoices) return;
    setAllInvoices((prev) => {
      if (page === 0) return data.invoices;
      const ids = new Set(prev.map((i) => i.id));
      const next = data.invoices.filter((i) => !ids.has(i.id));
      return [...prev, ...next];
    });
  }, [data, page]);

  const payments = useMemo(
    () => allInvoices.map(mapInvoiceRow),
    [allInvoices]
  );

  const total = summaryData?.summary?.paid?.IRR ?? payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = summaryData?.summary?.outstanding?.IRR ?? payments.filter((p) => p.status === 'sent' || p.status === 'draft').reduce((s, p) => s + p.amount, 0);
  const hasMore = (data?.invoices?.length ?? 0) >= 30;

  if (loading && page === 0) return <AdminLoadingState />;
  if (error && !data) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="پرداخت‌ها"
        description="مدیریت صورت‌حساب‌ها و پرداخت‌های پروژه"
        icon={CreditCard}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'پرداخت‌ها' }]}
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            صورت‌حساب جدید
          </button>
        }
      />

      {showForm && (
        <form
          className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-3 max-w-xl"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const unitPrice = Number(String(amount).replace(/[^\d]/g, '')) || 0;
            const res = await createInvoice({
              kind: 'invoice',
              status: 'draft',
              customer_name: customerName,
              items: [{ title: description || 'خدمت', qty: 1, unit_price: unitPrice }],
            });
            setBusy(false);
            if (!res.ok) {
              alert(res.error);
              return;
            }
            setShowForm(false);
            setCustomerName('');
            setDescription('');
            setAmount('');
            setPage(0);
            refetch();
          }}
        >
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="نام مشتری" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="شرح خدمت" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="مبلغ (تومان)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <button type="submit" disabled={busy} className="bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60">
            {busy ? 'در حال ذخیره...' : 'ایجاد صورت‌حساب'}
          </button>
        </form>
      )}

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
                      <ActionMenu actions={[
                        { label: 'مشاهده', href: `/admin/manager/invoices/${p.id}` },
                        { label: 'چاپ / PDF', href: invoicePrintHref('/admin/manager/invoices', p.id) },
                      ]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && (
          <div className="p-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="text-sm text-blue-600 hover:underline"
            >
              بارگذاری بیشتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
