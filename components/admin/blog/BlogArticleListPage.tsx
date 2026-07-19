'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { EmptyState } from '@/components/admin/ui/EmptyState';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import { createCmsArticle, fetchCmsArticles } from '@/lib/cmsAdminApi';
import { BlogDashboardWidgets } from '@/components/admin/blog/BlogDashboardWidgets';
import { STATUS_LABELS } from '@/lib/cms/articleStatus';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  IN_REVIEW: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  SCHEDULED: 'bg-purple-100 text-purple-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-red-100 text-red-700',
};

const SEO_COLORS: Record<string, string> = {
  ok: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  critical: 'bg-red-50 text-red-700',
};

import type { CmsArticleStatus } from '@/lib/cms/types';

export function BlogArticleListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creating, setCreating] = useState(false);

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (search) p.q = search;
    if (statusFilter !== 'all') p.status = statusFilter;
    return p;
  }, [search, statusFilter]);

  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchCmsArticles(params),
    [search, statusFilter]
  );

  async function handleCreate() {
    setCreating(true);
    const res = await createCmsArticle({ title: 'پیش‌نویس جدید' });
    setCreating(false);
    if (res.ok) {
      router.push(`/admin/manager/blog/${res.data.article.id}`);
    }
  }

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  const articles = data?.articles ?? [];
  const migrationRequired = data?.migration_required;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="مدیریت بلاگ"
        description="ایجاد، ویرایش و انتشار مقالات"
        icon={FileText}
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/manager/blog/media"
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              رسانه
            </Link>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              مقاله جدید
            </button>
          </div>
        }
      />

      <BlogDashboardWidgets />

      {migrationRequired && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          جداول CMS هنوز migrate نشده‌اند. فایل{' '}
          <code className="text-xs">supabase/migrations/20260719_cms_blog_core.sql</code>{' '}
          را اجرا کنید.
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="جستجو عنوان یا اسلاگ…"
        filters={[
          {
            label: 'وضعیت',
            value: statusFilter,
            options: [
              { value: 'all', label: 'همه' },
              ...Object.entries(STATUS_LABELS).map(([k, v]) => ({ value: k, label: v })),
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="مقاله‌ای نیست"
          description="اولین مقاله بلاگ را بسازید"
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-right p-3 font-medium">عنوان</th>
                <th className="text-right p-3 font-medium">دسته</th>
                <th className="text-right p-3 font-medium">وضعیت</th>
                <th className="text-right p-3 font-medium">SEO</th>
                <th className="text-right p-3 font-medium">به‌روزرسانی</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/admin/manager/blog/${a.id}`)}
                >
                  <td className="p-3">
                    <div className="font-medium text-slate-900">{a.title || 'بدون عنوان'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">/{a.slug}</div>
                  </td>
                  <td className="p-3 text-slate-600">{a.cms_categories?.name ?? '—'}</td>
                  <td className="p-3">
                    <StatusBadge
                      label={STATUS_LABELS[a.status as CmsArticleStatus] ?? a.status}
                      colorClass={STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-700'}
                    />
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${SEO_COLORS[a.seo_health ?? 'ok']}`}>
                      {a.seo_health === 'critical' ? 'بحرانی' : a.seo_health === 'warning' ? 'هشدار' : 'خوب'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 text-xs">
                    {new Date(a.updated_at).toLocaleDateString('fa-IR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
