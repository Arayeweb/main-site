'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { PromoteToCrmButton } from '@/components/admin/ui/PromoteToCrmButton';
import { fetchContentSalesOrders, type ApiContentSalesOrder } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatFaDateTime } from '@/lib/adminMappers';
import { formatPriceToman } from '@/lib/aiPricingConfig';

const STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار پرداخت',
  paid: 'پرداخت‌شده',
  paid_needs_setup: 'پرداخت — نیاز به راه‌اندازی',
  failed: 'ناموفق',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  paid: 'bg-green-50 text-green-700 ring-green-200',
  paid_needs_setup: 'bg-orange-50 text-orange-700 ring-orange-200',
  failed: 'bg-red-50 text-red-700 ring-red-200',
};

export default function ContentSalesOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [allOrders, setAllOrders] = useState<ApiContentSalesOrder[]>([]);

  const { data, loading, error } = useAdminFetch(
    () =>
      fetchContentSalesOrders({
        q: search || undefined,
        status: status || undefined,
        page_num: page,
      }),
    [search, status, page]
  );

  useEffect(() => setPage(0), [search, status]);

  useEffect(() => {
    if (!data?.orders) return;
    setAllOrders((prev) => {
      if (page === 0) return data.orders;
      const ids = new Set(prev.map((o) => o.id));
      return [...prev, ...data.orders.filter((o) => !ids.has(o.id))];
    });
  }, [data, page]);

  const orders = useMemo(() => allOrders, [allOrders]);

  if (loading && page === 0) return <AdminLoadingState />;
  if (error && !data) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="سفارش‌های فروش محتوا"
        description="خریدهای باندل محتوا و فروش آرایه AI"
        icon={ShoppingBag}
        breadcrumb={[{ label: 'فروش' }, { label: 'فروش محتوا' }]}
      />

      {data?.migration_required ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          جدول هنوز migrate نشده. فایل{' '}
          <code className="text-xs">supabase/migrations/20260708_content_sales_bundle.sql</code> را اجرا کنید.
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="جستجو: نام، موبایل..." />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ms-auto">{orders.length} سفارش</span>
        </div>

        {orders.length === 0 ? (
          <EmptyState title="سفارشی یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['تاریخ', 'خریدار', 'موبایل', 'مبلغ', 'وضعیت', 'پرداخت', 'تراکنش', 'CRM'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatFaDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{row.buyer_name}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">
                      <a href={`tel:${row.buyer_phone}`} className="hover:text-teal-700">{row.buyer_phone}</a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 tabular-nums">{formatPriceToman(row.amount_toman)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={STATUS_LABELS[row.status] ?? row.status}
                        colorClass={STATUS_COLORS[row.status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">
                      {row.paid_at ? formatFaDateTime(row.paid_at) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400" dir="ltr">
                      {row.zibal_track_id ? row.zibal_track_id.slice(0, 12) + '…' : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <PromoteToCrmButton sourceType="content_sales" sourceId={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {data?.has_more && (
          <div className="p-4 border-t border-slate-100 text-center">
            <button type="button" onClick={() => setPage((p) => p + 1)} className="text-sm text-blue-600 hover:underline">
              بارگذاری بیشتر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
