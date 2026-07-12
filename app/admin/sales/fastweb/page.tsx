'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { fetchFastWebOrders } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { FULFILLMENT_LABELS, FULFILLMENT_PIPELINE } from '@/lib/fastweb';
import { formatPriceToman } from '@/lib/aiPricingConfig';

export default function FastWebAdminListPage() {
  const [search, setSearch] = useState('');
  const [fulfillment, setFulfillment] = useState('');
  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchFastWebOrders({
        q: search || undefined,
        fulfillment: fulfillment || undefined,
      }),
    [search, fulfillment]
  );

  const orders = useMemo(() => data?.orders ?? [], [data]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="سایت فوری"
        description="صف سفارش‌های پرداخت‌شده برای تحویل نیمه‌دستی"
        icon={Zap}
        breadcrumb={[{ label: 'فروش' }, { label: 'سایت فوری' }]}
      />

      {data?.migration_required ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          جدول هنوز migrate نشده. فایل{' '}
          <code className="text-xs">supabase/migrations/20260727_fastweb_orders.sql</code> را اجرا
          کنید.
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="جستجو: کسب‌وکار، موبایل، اسلاگ..."
            />
          </div>
          <select
            value={fulfillment}
            onChange={(e) => setFulfillment(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">همه وضعیت‌ها</option>
            {FULFILLMENT_PIPELINE.map((s) => (
              <option key={s} value={s}>
                {FULFILLMENT_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            تازه‌سازی
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState title="سفارشی نیست" description="هنوز سفارش پرداخت‌شده‌ای ثبت نشده." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">کسب‌وکار</th>
                  <th className="px-4 py-3 text-right font-medium">بسته</th>
                  <th className="px-4 py-3 text-right font-medium">مبلغ</th>
                  <th className="px-4 py-3 text-right font-medium">وضعیت</th>
                  <th className="px-4 py-3 text-right font-medium">اصلاح</th>
                  <th className="px-4 py-3 text-right font-medium" />
                </tr>
              </thead>
              <tbody>
                {orders.map((row) => {
                  const o = row as {
                    id: string;
                    businessName?: string | null;
                    phone?: string | null;
                    package?: string;
                    amountToman?: number;
                    fulfillmentStatus?: string;
                    revisionCount?: number;
                  };
                  const status = String(o.fulfillmentStatus || 'received');
                  return (
                    <tr key={o.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="font-medium">{o.businessName || '—'}</div>
                        <div className="text-xs text-slate-500">{o.phone}</div>
                      </td>
                      <td className="px-4 py-3">{o.package === 'plus' ? 'پلاس' : 'فوری'}</td>
                      <td className="px-4 py-3">
                        {formatPriceToman(Number(o.amountToman) || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          label={
                            FULFILLMENT_LABELS[
                              status as keyof typeof FULFILLMENT_LABELS
                            ] ?? status
                          }
                          colorClass="bg-teal-50 text-teal-800 ring-teal-200"
                        />
                      </td>
                      <td className="px-4 py-3">{o.revisionCount ?? 0}</td>
                      <td className="px-4 py-3 text-left">
                        <Link
                          href={`/admin/sales/fastweb/${o.id}`}
                          className="text-[#0F4C5C] font-medium hover:underline"
                        >
                          جزئیات
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
