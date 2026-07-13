'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { ActionMenu } from '@/components/admin/ui/ActionMenu';
import { PromoteToCrmButton } from '@/components/admin/ui/PromoteToCrmButton';
import { fetchBizcardLeads, patchBizcardLead, type ApiBizcardLead } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatFaDateTime } from '@/lib/adminMappers';

const STATUS_LABELS: Record<string, string> = {
  new: 'جدید',
  auto_followed: 'پیگیری خودکار',
  contacted: 'تماس گرفته شد',
  interested: 'علاقه‌مند',
  proposal_sent: 'پیشنهاد ارسال شد',
  won: 'برنده',
  lost: 'از دست رفته',
  not_answered: 'پاسخ نداد',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200',
  contacted: 'bg-sky-50 text-sky-700 ring-sky-200',
  interested: 'bg-violet-50 text-violet-700 ring-violet-200',
  proposal_sent: 'bg-amber-50 text-amber-700 ring-amber-200',
  won: 'bg-green-50 text-green-700 ring-green-200',
  lost: 'bg-red-50 text-red-700 ring-red-200',
  not_answered: 'bg-slate-50 text-slate-600 ring-slate-200',
  auto_followed: 'bg-teal-50 text-teal-700 ring-teal-200',
};

export default function BizcardLeadsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [hotOnly, setHotOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [allLeads, setAllLeads] = useState<ApiBizcardLead[]>([]);

  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchBizcardLeads({
        q: search || undefined,
        status: status || undefined,
        hot: hotOnly || undefined,
        page_num: page,
      }),
    [search, status, hotOnly, page]
  );

  useEffect(() => setPage(0), [search, status, hotOnly]);

  useEffect(() => {
    if (!data?.leads) return;
    setAllLeads((prev) => {
      if (page === 0) return data.leads;
      const ids = new Set(prev.map((l) => l.id));
      return [...prev, ...data.leads.filter((l) => !ids.has(l.id))];
    });
  }, [data, page]);

  const leads = useMemo(() => allLeads, [allLeads]);

  if (loading && page === 0) return <AdminLoadingState />;
  if (error && !data) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="لیدهای کارت ویزیت"
        description="درخواست‌های ساخته‌شده از سازنده کارت ویزیت دیجیتال"
        icon={CreditCard}
        breadcrumb={[{ label: 'فروش' }, { label: 'کارت ویزیت' }]}
      />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="جستجو: کسب‌وکار، موبایل..." />
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
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={hotOnly} onChange={(e) => setHotOnly(e.target.checked)} />
            فقط لیدهای داغ (۷۰+)
          </label>
          <span className="text-xs text-slate-500 ms-auto">{leads.length} لید</span>
        </div>

        {leads.length === 0 ? (
          <EmptyState title="لیدی یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['تاریخ', 'کسب‌وکار', 'موبایل', 'صنف', 'شهر', 'امتیاز', 'خدمت', 'وضعیت', 'CRM', ''].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                      {formatFaDateTime(row.created_at)}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {row.business_name ?? '—'}
                      {row.slug ? (
                        <Link href={`/b/${row.slug}`} target="_blank" className="block text-xs text-blue-600 hover:underline mt-0.5">
                          /b/{row.slug}
                        </Link>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">
                      <a href={`tel:${row.phone ?? ''}`} className="hover:text-teal-700">{row.phone ?? '—'}</a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{row.category ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-600">{row.city ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-bold tabular-nums ${(row.lead_score ?? 0) >= 70 ? 'text-red-600' : 'text-slate-600'}`}>
                        {row.lead_score ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{row.requested_service ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge
                        label={STATUS_LABELS[row.sales_status] ?? row.sales_status}
                        colorClass={STATUS_COLORS[row.sales_status] ?? 'bg-slate-50 text-slate-600 ring-slate-200'}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <PromoteToCrmButton sourceType="bizcard" sourceId={row.id} />
                    </td>
                    <td className="px-4 py-3.5">
                      <ActionMenu
                        actions={[
                          { label: 'تماس شد', onClick: () => void patchBizcardLead(row.id, { sales_status: 'contacted', mark_followup: true }).then(() => refetch()) },
                          { label: 'علاقه‌مند', onClick: () => void patchBizcardLead(row.id, { sales_status: 'interested' }).then(() => refetch()) },
                          { label: 'برنده', onClick: () => void patchBizcardLead(row.id, { sales_status: 'won' }).then(() => refetch()) },
                          { label: 'از دست رفته', variant: 'danger', onClick: () => void patchBizcardLead(row.id, { sales_status: 'lost' }).then(() => refetch()) },
                        ]}
                      />
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
