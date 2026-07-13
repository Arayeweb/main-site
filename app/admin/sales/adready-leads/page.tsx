'use client';

import { useEffect, useMemo, useState } from 'react';
import { Target } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { PromoteToCrmButton } from '@/components/admin/ui/PromoteToCrmButton';
import { fetchAdreadyLeads, type ApiAdreadyLead } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { formatFaDateTime } from '@/lib/adminMappers';

export default function AdreadyLeadsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [allLeads, setAllLeads] = useState<ApiAdreadyLead[]>([]);

  const { data, loading, error } = useAdminFetch(
    () => fetchAdreadyLeads({ q: search || undefined, page_num: page }),
    [search, page]
  );

  useEffect(() => setPage(0), [search]);

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
        title="لیدهای AdReady"
        description="لیدهای دریافتی از صفحات کمپین AdReady"
        icon={Target}
        breadcrumb={[{ label: 'فروش' }, { label: 'لیدهای AdReady' }]}
      />

      {data?.migration_required ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          جدول campaign_leads هنوز migrate نشده.
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="جستجو: نام، موبایل..." />
          </div>
          <span className="text-xs text-slate-500 ms-auto">{leads.length} لید</span>
        </div>

        {leads.length === 0 ? (
          <EmptyState title="لیدی یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {['تاریخ', 'نام', 'موبایل', 'کمپین', 'پیام', 'وضعیت', ''].map((h) => (
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
                    <td className="px-4 py-3.5 font-medium text-slate-800">{row.full_name}</td>
                    <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">
                      <a href={`tel:${row.phone}`} className="hover:text-teal-700">{row.phone}</a>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">
                      {row.campaign_title ?? '—'}
                      {row.campaign_slug ? (
                        <span className="block text-slate-400">/c/{row.campaign_slug}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs max-w-[200px] truncate">{row.message ?? '—'}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{row.status}</td>
                    <td className="px-4 py-3.5">
                      <PromoteToCrmButton sourceType="adready" sourceId={row.id} />
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
