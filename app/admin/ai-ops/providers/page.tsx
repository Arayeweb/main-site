'use client';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiProviders, updateAiProvider, type AiProviderRow } from '@/lib/aiAdminApi';
import { AI_PROVIDER_STATUS_LABELS, AI_PROVIDER_STATUS_COLORS, formatUsd, formatFaDateTime } from '@/lib/aiAdminTypes';
import { Server } from 'lucide-react';

export default function AiOpsProvidersPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiProviders(), []);

  return (
    <div>
      <AdminPageHeader
        title="ارائه‌دهنده‌های API"
        description="سلامت، نرخ خطا، آپتایم و هزینه هر ارائه‌دهنده مدل هوش مصنوعی."
        icon={Server}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiProviderRow>
            data={data.providers}
            keyExtractor={(p) => p.id}
            columns={[
              { key: 'name', header: 'ارائه‌دهنده', render: (p) => <span className="font-medium dark:text-white">{p.name}</span> },
              {
                key: 'status',
                header: 'وضعیت',
                render: (p) => <StatusBadge label={AI_PROVIDER_STATUS_LABELS[p.status] ?? p.status} colorClass={AI_PROVIDER_STATUS_COLORS[p.status] ?? ''} />,
              },
              { key: 'error_rate', header: 'نرخ خطا', render: (p) => `${(p.error_rate * 100).toFixed(1)}%` },
              { key: 'uptime', header: 'آپتایم', render: (p) => `${p.uptime_percent}%` },
              { key: 'latency', header: 'تأخیر میانگین', render: (p) => (p.avg_latency_ms ? `${p.avg_latency_ms}ms` : '—') },
              { key: 'cost', header: 'هزینه ۳۰ روز', render: (p) => formatUsd(p.cost_usd_30d) },
              { key: 'checked', header: 'آخرین بررسی', render: (p) => formatFaDateTime(p.last_checked_at) },
              {
                key: 'enabled',
                header: 'فعال',
                render: (p) => (
                  <button
                    onClick={async () => {
                      await updateAiProvider(p.id, { enabled: !p.enabled });
                      refetch();
                    }}
                    className={`text-xs px-3 py-1 rounded-full ring-1 ${
                      p.enabled ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-500 ring-slate-200'
                    }`}
                  >
                    {p.enabled ? 'فعال' : 'غیرفعال'}
                  </button>
                ),
              },
            ]}
          />
        )}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        توجه: مقدار «آپتایم/نرخ خطا/تأخیر» فعلاً از رکورد پیکربندی ارائه‌دهنده خوانده می‌شود — اتصال به یک health-check
        زمان‌بندی‌شده واقعی (cron) برای به‌روزرسانی خودکار این مقادیر در فاز بعد پیاده‌سازی می‌شود.
      </p>
    </div>
  );
}
