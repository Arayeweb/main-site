'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { FilterBar } from '@/components/admin/ui/FilterBar';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiPayments, type AiPaymentRow } from '@/lib/aiAdminApi';
import { AI_ORDER_STATUS_LABELS, AI_ORDER_STATUS_COLORS, formatToman, formatFaDateTime } from '@/lib/aiAdminTypes';
import { CreditCard } from 'lucide-react';

export default function AiOpsPaymentsPage() {
  const [status, setStatus] = useState('');
  const { data, loading, error } = useAiOpsFetch(() => fetchAiPayments({ status: status || undefined }), [status]);

  return (
    <div>
      <AdminPageHeader title="پرداخت‌ها" description="سفارش‌های خرید پکیج اعتباری از درگاه زیبال — شامل صف پرداخت‌های ناموفق." icon={CreditCard} />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <FilterBar
          search=""
          onSearchChange={() => {}}
          filters={[
            {
              value: status,
              onChange: setStatus,
              options: [
                { value: '', label: 'همه وضعیت‌ها' },
                ...Object.entries(AI_ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })),
              ],
            },
          ]}
          count={data?.total}
          countLabel="پرداخت"
        />
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiPaymentRow>
            data={data.payments}
            keyExtractor={(p) => p.id}
            columns={[
              { key: 'date', header: 'تاریخ', render: (p) => formatFaDateTime(p.created_at) },
              { key: 'phone', header: 'کاربر', render: (p) => <span dir="ltr">{p.user_phone}</span> },
              { key: 'package', header: 'پکیج', render: (p) => p.package_id },
              { key: 'amount', header: 'مبلغ نهایی', render: (p) => formatToman(p.amount_toman) },
              { key: 'discount', header: 'تخفیف', render: (p) => (p.discount_toman > 0 ? formatToman(p.discount_toman) : '—') },
              { key: 'promo', header: 'کد', render: (p) => p.promo_code ?? '—' },
              { key: 'utm', header: 'منبع', render: (p) => <span dir="ltr">{p.utm_source ?? '—'}</span> },
              { key: 'status', header: 'وضعیت', render: (p) => <StatusBadge label={AI_ORDER_STATUS_LABELS[p.status] ?? p.status} colorClass={AI_ORDER_STATUS_COLORS[p.status] ?? ''} /> },
            ]}
          />
        )}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        TODO: استرداد وجه (refund) از طریق API زیبال هنوز پیاده‌سازی نشده — درگاه فعلی صرفاً verify/request را پشتیبانی می‌کند؛
        استردادها فعلاً باید دستی از پنل زیبال انجام شوند.
      </p>
    </div>
  );
}
