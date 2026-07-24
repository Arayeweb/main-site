'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { SearchInput } from '@/components/admin/ui/SearchInput';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { fetchWebsiteBriefs } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import {
  briefStatusLabels,
  primaryConversionGoalOptions,
  primaryBusinessProblemOptions,
  recommendedServiceLabels,
} from '@/lib/websiteBrief/constants';
import type { RecommendedService } from '@/lib/websiteBrief/types';
import { formatFaDate } from '@/lib/adminMappers';

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value;
}

function interestLabel(v: boolean | null | undefined) {
  if (v === true) return 'علاقه‌مند';
  if (v === false) return 'فقط طراحی سایت';
  return 'انتخاب نشده';
}

export default function WebsiteBriefsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [recommended, setRecommended] = useState('');
  const { data, loading, error, refetch } = useAdminFetch(
    () =>
      fetchWebsiteBriefs({
        q: search || undefined,
        status: status || undefined,
        recommended_service: recommended || undefined,
      }),
    [search, status, recommended]
  );

  const briefs = useMemo(() => data?.briefs ?? [], [data]);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="بریف طراحی سایت"
        description="فرم‌های کوتاه شروع پروژه طراحی سایت"
        icon={ClipboardList}
        breadcrumb={[{ label: 'فروش' }, { label: 'بریف طراحی سایت' }]}
      />

      {data?.migration_required ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          جدول دیتابیس هنوز migrate نشده است. فایل{' '}
          <code className="text-xs">supabase/migrations/20260711_website_project_briefs.sql</code>{' '}
          را اجرا کنید.
        </div>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <SearchInput value={search} onChange={setSearch} placeholder="جستجو: نام، موبایل، کسب‌وکار..." />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">همه وضعیت‌ها</option>
            {Object.entries(briefStatusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            value={recommended}
            onChange={(e) => setRecommended(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="">همه پیشنهادها</option>
            {Object.entries(recommendedServiceLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm text-slate-600 hover:text-slate-900 ms-auto"
          >
            بروزرسانی
          </button>
        </div>

        {briefs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]" dir="rtl">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100">
                  {[
                    'تاریخ',
                    'نام',
                    'موبایل',
                    'کسب‌وکار',
                    'هدف سایت',
                    'مشکل اصلی',
                    'پیشنهاد',
                    'علاقه مشتری',
                    'وضعیت',
                    '',
                  ].map((h) => (
                    <th key={h} className="text-right px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {briefs.map((row) => {
                  const id = String(row.id);
                  const created = row.created_at ? formatFaDate(String(row.created_at)) : '—';
                  const rec = String(row.recommended_service ?? 'none') as RecommendedService;
                  return (
                    <tr
                      key={id}
                      className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      onClick={() => router.push(`/admin/sales/website-briefs/${id}`)}
                    >
                      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{created}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">{String(row.contact_name ?? '—')}</td>
                      <td className="px-4 py-3.5 text-slate-500 tabular-nums" dir="ltr">
                        <a
                          href={`tel:${String(row.contact_phone ?? '')}`}
                          className="hover:text-teal-700"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {String(row.contact_phone ?? '—')}
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{String(row.business_name ?? '—')}</td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[180px] truncate">
                        {labelFor(primaryConversionGoalOptions, String(row.primary_conversion_goal ?? ''))}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-[180px] truncate">
                        {labelFor(primaryBusinessProblemOptions, String(row.primary_business_problem ?? ''))}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{recommendedServiceLabels[rec] ?? rec}</td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {interestLabel(row.recommendation_interest as boolean | null | undefined)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge
                          label={briefStatusLabels[String(row.status ?? 'new')] ?? String(row.status)}
                          colorClass="bg-slate-50 text-slate-600 ring-slate-200"
                        />
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/sales/website-briefs/${id}`}
                          className="text-xs text-teal-700 hover:underline"
                          onClick={(e) => e.stopPropagation()}
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
