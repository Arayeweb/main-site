'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiCoupons, upsertAiCoupon, type AiCouponRow } from '@/lib/aiAdminApi';
import { formatToman, formatFaDate, AI_PROMO_KIND_LABELS } from '@/lib/aiAdminTypes';
import { Ticket, Plus } from 'lucide-react';

const EMPTY: Partial<AiCouponRow> = { code: '', kind: 'percent', value: 10, max_uses: 1000, active: true };

export default function AiOpsCouponsPage() {
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiCoupons(), []);
  const [editing, setEditing] = useState<Partial<AiCouponRow> | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <AdminPageHeader
        title="کدهای تخفیف و معرفی"
        description="کدهای تخفیف، سقف استفاده و آمار استفاده/تخفیف اعطاشده."
        icon={Ticket}
        actions={
          <button onClick={() => setEditing(EMPTY)} className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> کد جدید
          </button>
        }
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiCouponRow>
            data={data.coupons}
            keyExtractor={(c) => c.id}
            onRowClick={(c) => setEditing(c)}
            columns={[
              { key: 'code', header: 'کد', render: (c) => <span dir="ltr" className="font-mono font-medium">{c.code}</span> },
              { key: 'kind', header: 'نوع', render: (c) => AI_PROMO_KIND_LABELS[c.kind] ?? c.kind },
              { key: 'value', header: 'مقدار', render: (c) => (c.kind === 'percent' ? `${c.value}%` : formatToman(c.value)) },
              { key: 'used', header: 'استفاده‌شده', render: (c) => `${c.used_count} / ${c.max_uses}` },
              { key: 'redeemed', header: 'سفارش‌های واقعی', render: (c) => c.redeemed_orders },
              { key: 'discount', header: 'مجموع تخفیف', render: (c) => formatToman(c.discount_given_toman) },
              { key: 'expires', header: 'انقضا', render: (c) => formatFaDate(c.expires_at) },
              { key: 'active', header: 'وضعیت', render: (c) => <StatusBadge label={c.active ? 'فعال' : 'غیرفعال'} colorClass={c.active ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-slate-50 text-slate-500 ring-slate-200'} /> },
            ]}
          />
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md flex flex-col gap-3">
            <h3 className="font-bold text-slate-900 dark:text-white">{editing.id ? 'ویرایش کد' : 'کد جدید'}</h3>
            <input
              placeholder="کد (مثلا SUMMER30)"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.code}
              onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })}
            />
            <select
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.kind}
              onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
            >
              <option value="percent">درصدی</option>
              <option value="fixed">مبلغ ثابت (تومان)</option>
            </select>
            <input
              type="number"
              placeholder="مقدار"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })}
            />
            <input
              type="number"
              placeholder="سقف استفاده"
              className="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg px-3 py-2 text-sm"
              value={editing.max_uses}
              onChange={(e) => setEditing({ ...editing, max_uses: Number(e.target.value) })}
            />
            <label className="flex items-center gap-2 text-sm dark:text-slate-200">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} />
              فعال
            </label>
            <div className="flex gap-2">
              <button
                disabled={busy || !editing.code}
                onClick={async () => {
                  setBusy(true);
                  await upsertAiCoupon(editing);
                  setBusy(false);
                  setEditing(null);
                  refetch();
                }}
                className="flex-1 bg-violet-600 text-white rounded-lg py-2 text-sm disabled:opacity-50"
              >
                ذخیره
              </button>
              <button onClick={() => setEditing(null)} className="flex-1 border border-slate-200 dark:border-slate-700 rounded-lg py-2 text-sm dark:text-slate-200">
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
