'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, ArrowRight, Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { fetchInvoiceById, fetchInvoices } from '@/lib/adminApi';
import { InvoicePdfButton } from '@/components/admin/invoices/InvoicePdfButton';
import { formatCurrency } from '@/lib/utils';
import { INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS, mapInvoiceRow } from '@/lib/adminMappers';
import { invoicePrintHref } from '@/lib/invoicePrint';

interface InvoicesListProps {
  panelLabel: string;
  detailBasePath: string;
  newHref?: string;
}

export function InvoicesListPage({ panelLabel, detailBasePath, newHref }: InvoicesListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data, loading, error } = useAdminFetch(() => fetchInvoices({ kind: 'invoice' }), []);

  const invoices = useMemo(() => (data?.invoices ?? []).map(mapInvoiceRow), [data]);

  const filtered = invoices.filter((inv) => {
    const q = search.trim();
    const matchSearch =
      !q ||
      inv.client.includes(q) ||
      inv.service.includes(q) ||
      inv.invoice.includes(q);
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="فاکتورها"
        description="مدیریت و دانلود فاکتورهای صادر شده"
        icon={FileText}
        breadcrumb={[{ label: panelLabel }, { label: 'فاکتورها' }]}
        actions={
          newHref ? (
            <Link
              href={newHref}
              className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              فاکتور جدید
            </Link>
          ) : undefined
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="جستجوی فاکتور..."
          count={filtered.length}
          filters={[
            {
              value: statusFilter,
              onChange: setStatusFilter,
              options: [
                { value: 'all', label: 'همه وضعیت‌ها' },
                ...Object.entries(INVOICE_STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
              ],
            },
          ]}
        />

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1050px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['شماره فاکتور', 'مشتری', 'شرح', 'مبلغ', 'وضعیت', 'تاریخ صدور', 'سررسید', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`${detailBasePath}/${inv.id}`)}
                  >
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{inv.invoice}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{inv.client}</td>
                    <td className="px-4 py-3.5 text-slate-600">{inv.service}</td>
                    <td className="px-4 py-3.5 tabular-nums font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={INVOICE_STATUS_LABELS[inv.status] ?? inv.status}
                        colorClass={INVOICE_STATUS_COLORS[inv.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{inv.sentDate}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums">{inv.dueDate}</td>
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <ActionMenu
                        actions={[
                          { label: 'مشاهده', href: `${detailBasePath}/${inv.id}` },
                          { label: 'چاپ / PDF', href: invoicePrintHref(detailBasePath, inv.id) },
                        ]}
                      />
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

export function InvoiceDetailPage({
  id,
  backHref,
  panelLabel,
}: {
  id: string;
  backHref: string;
  panelLabel: string;
}) {
  const { data, loading, error } = useAdminFetch(() => fetchInvoiceById(id), [id]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  const invoice = data?.invoice ?? null;
  const items = invoice && Array.isArray(invoice.items) ? invoice.items : [];
  if (!invoice) {
    return (
      <div className="text-center py-20 text-slate-500" dir="rtl">
        <p>فاکتور یافت نشد</p>
        <Link href={backHref} className="text-blue-600 text-sm mt-2 inline-block">
          بازگشت
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={invoice.invoice_number}
        description={invoice.customer_name}
        icon={FileText}
        breadcrumb={[{ label: panelLabel }, { label: 'فاکتورها', href: backHref }, { label: invoice.invoice_number }]}
        actions={
          <div className="flex items-center gap-2">
            <InvoicePdfButton printHref={invoicePrintHref(backHref, id)} variant="primary" />
            <Link href={backHref} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <ArrowRight className="w-4 h-4" />
              بازگشت
            </Link>
          </div>
        }
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge
            label={INVOICE_STATUS_LABELS[invoice.status] ?? invoice.status}
            colorClass={INVOICE_STATUS_COLORS[invoice.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
          />
          <span className="text-lg font-bold text-slate-900">{formatCurrency(invoice.grand_total ?? 0)}</span>
        </div>

        <InfoRow label="مشتری" value={invoice.customer_name} />
        {invoice.customer_contact && <InfoRow label="تماس" value={invoice.customer_contact} />}
        {invoice.customer_address && <InfoRow label="آدرس" value={invoice.customer_address} />}
        <InfoRow label="تاریخ صدور" value={invoice.issue_date ?? invoice.created_at} />
        {invoice.due_date && <InfoRow label="سررسید" value={invoice.due_date} />}
        {invoice.paid_at && <InfoRow label="تاریخ پرداخت" value={invoice.paid_at} />}
        {invoice.note && <InfoRow label="توضیحات" value={invoice.note} />}
        {invoice.terms && <InfoRow label="شرایط پرداخت" value={invoice.terms} />}
      </div>

      {items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 text-sm font-bold text-slate-900">اقلام</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['شرح', 'تعداد', 'قیمت واحد', 'تخفیف', 'مالیات'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-slate-800">{item.title}</td>
                    <td className="px-4 py-3 tabular-nums">{item.qty}</td>
                    <td className="px-4 py-3 tabular-nums">{formatCurrency(item.unit_price)}</td>
                    <td className="px-4 py-3 tabular-nums">{item.discount ? `${item.discount}٪` : '—'}</td>
                    <td className="px-4 py-3 tabular-nums">{item.tax ? `${item.tax}٪` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
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

