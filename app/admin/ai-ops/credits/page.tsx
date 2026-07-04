'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiCreditLedger, type AiCreditLedgerRow } from '@/lib/aiAdminApi';
import { formatFaDateTime } from '@/lib/aiAdminTypes';
import { Coins } from 'lucide-react';

export default function AiOpsCreditsPage() {
  const [page, setPage] = useState(0);
  const { data, loading, error } = useAiOpsFetch(() => fetchAiCreditLedger({ page }), [page]);

  return (
    <div>
      <AdminPageHeader
        title="دفتر کل کردیت"
        description="تمام تراکنش‌های کردیت — اعطای دستی ادمین، خرید پکیج، پاداش معرفی و مصرف."
        icon={Coins}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <>
            <DataTable<AiCreditLedgerRow>
              data={data.entries}
              keyExtractor={(e) => e.id}
              columns={[
                { key: 'date', header: 'تاریخ', render: (e) => formatFaDateTime(e.created_at) },
                { key: 'phone', header: 'کاربر', render: (e) => <span dir="ltr">{e.user_phone}</span> },
                {
                  key: 'delta',
                  header: 'تغییر',
                  render: (e) => (
                    <span className={e.delta >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {e.delta > 0 ? `+${e.delta}` : e.delta}
                    </span>
                  ),
                },
                { key: 'balance', header: 'مانده بعد', render: (e) => e.balance_after ?? '—' },
                { key: 'reason', header: 'دلیل', render: (e) => e.reason },
                { key: 'note', header: 'یادداشت', render: (e) => e.note ?? '—' },
                { key: 'admin', header: 'ثبت‌شده توسط', render: (e) => e.admin_name ?? 'سیستم' },
              ]}
            />
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-sm">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 dark:text-slate-200"
              >
                قبلی
              </button>
              <span className="text-slate-400">صفحه {page + 1}</span>
              <button
                disabled={data.entries.length < 50}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg disabled:opacity-40 dark:text-slate-200"
              >
                بعدی
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
