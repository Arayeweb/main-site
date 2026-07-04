'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DetailTabs } from '@/components/admin/ui/DetailTabs';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiUserDetail, updateAiUser } from '@/lib/aiAdminApi';
import {
  AI_PLAN_LABELS, AI_USER_STATUS_LABELS, AI_USER_STATUS_COLORS, AI_ORDER_STATUS_LABELS,
  AI_ORDER_STATUS_COLORS, formatToman, formatUsd, formatFaDate, formatFaDateTime,
} from '@/lib/aiAdminTypes';
import { User } from 'lucide-react';

export default function AiOpsUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [tab, setTab] = useState('profile');
  const { data, loading, error, refetch } = useAiOpsFetch(() => fetchAiUserDetail(params.id), [params.id]);
  const [busy, setBusy] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');

  async function doUpdate(body: Parameters<typeof updateAiUser>[1]) {
    setBusy(true);
    await updateAiUser(params.id, body);
    setBusy(false);
    refetch();
  }

  if (loading) return <AiOpsLoadingState />;
  if (error || !data) return <AiOpsErrorState error={error || 'not_found'} />;

  const u = data.user;

  return (
    <div>
      <AdminPageHeader
        title={u.phone}
        description={`عضویت از ${formatFaDate(u.created_at)} — پلن ${AI_PLAN_LABELS[u.plan] ?? u.plan}`}
        icon={User}
        breadcrumb={[{ label: 'کاربران', href: '/admin/ai-ops/users' }, { label: u.phone }]}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge label={AI_USER_STATUS_LABELS[u.status] ?? u.status} colorClass={AI_USER_STATUS_COLORS[u.status] ?? ''} size="md" />
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat label="کردیت فعلی" value={String(u.credits)} />
        <MiniStat label="مجموع پرداخت" value={formatToman(u.total_spend_toman)} />
        <MiniStat label="مجموع هزینه API" value={formatUsd(u.total_cost_usd)} />
        <MiniStat label="امتیاز سوءاستفاده" value={String(u.abuse_score)} highlight={u.abuse_score > 5} />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <DetailTabs
          tabs={[
            { id: 'profile', label: 'مدیریت' },
            { id: 'ledger', label: 'دفتر کردیت', count: data.ledger.length },
            { id: 'battles', label: 'گفتگوها', count: data.battles.length },
            { id: 'orders', label: 'پرداخت‌ها', count: data.orders.length },
            { id: 'tickets', label: 'تیکت‌ها', count: data.tickets.length },
          ]}
          activeTab={tab}
          onTabChange={setTab}
        />

        <div className="p-5">
          {tab === 'profile' && (
            <div className="flex flex-col gap-6 max-w-xl">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">تغییر پلن</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(AI_PLAN_LABELS).map(([id, label]) => (
                    <button
                      key={id}
                      disabled={busy || id === u.plan}
                      onClick={() => doUpdate({ plan: id })}
                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">وضعیت حساب</p>
                <div className="flex gap-2">
                  {Object.entries(AI_USER_STATUS_LABELS).map(([id, label]) => (
                    <button
                      key={id}
                      disabled={busy || id === u.status}
                      onClick={() => doUpdate({ status: id })}
                      className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-200"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">اصلاح کردیت</p>
                <div className="flex gap-2 flex-wrap items-center">
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="مثلا 20 یا -10"
                    className="w-32 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
                  />
                  <input
                    type="text"
                    value={creditNote}
                    onChange={(e) => setCreditNote(e.target.value)}
                    placeholder="یادداشت (اختیاری)"
                    className="flex-1 min-w-[160px] px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white rounded-lg"
                  />
                  <button
                    disabled={busy || !creditAmount}
                    onClick={async () => {
                      await doUpdate({ credit_delta: Number(creditAmount), credit_reason: creditNote || undefined });
                      setCreditAmount('');
                      setCreditNote('');
                    }}
                    className="px-4 py-2 text-sm bg-violet-600 text-white rounded-lg disabled:opacity-40"
                  >
                    اعمال
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'ledger' && (
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="text-right text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2">تاریخ</th>
                  <th className="py-2">تغییر</th>
                  <th className="py-2">مانده بعد</th>
                  <th className="py-2">دلیل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.ledger.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{formatFaDateTime(l.created_at)}</td>
                    <td className={`py-2 font-semibold ${l.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</td>
                    <td className="py-2 dark:text-slate-200">{l.balance_after ?? '—'}</td>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{l.reason}{l.note ? ` — ${l.note}` : ''}</td>
                  </tr>
                ))}
                {data.ledger.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">تراکنشی ثبت نشده</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === 'battles' && (
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="text-right text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2">تاریخ</th>
                  <th className="py-2">پرامپت</th>
                  <th className="py-2">سطح</th>
                  <th className="py-2">هزینه</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.battles.map((b) => (
                  <tr key={b.id}>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{formatFaDateTime(b.created_at)}</td>
                    <td className="py-2 dark:text-slate-200 max-w-md truncate">{b.prompt}</td>
                    <td className="py-2 dark:text-slate-200">{b.tier}</td>
                    <td className="py-2 dark:text-slate-200">{formatUsd(b.cost_usd)}</td>
                  </tr>
                ))}
                {data.battles.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">گفتگویی ثبت نشده</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === 'orders' && (
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="text-right text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2">تاریخ</th>
                  <th className="py-2">پکیج</th>
                  <th className="py-2">مبلغ</th>
                  <th className="py-2">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{formatFaDateTime(o.created_at)}</td>
                    <td className="py-2 dark:text-slate-200">{o.package_id}</td>
                    <td className="py-2 dark:text-slate-200">{formatToman(o.amount_toman)}</td>
                    <td className="py-2">
                      <StatusBadge label={AI_ORDER_STATUS_LABELS[o.status] ?? o.status} colorClass={AI_ORDER_STATUS_COLORS[o.status] ?? ''} />
                    </td>
                  </tr>
                ))}
                {data.orders.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">سفارشی ثبت نشده</td></tr>
                )}
              </tbody>
            </table>
          )}

          {tab === 'tickets' && (
            <table className="w-full text-sm" dir="rtl">
              <thead>
                <tr className="text-right text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2">تاریخ</th>
                  <th className="py-2">موضوع</th>
                  <th className="py-2">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {data.tickets.map((t) => (
                  <tr key={t.id}>
                    <td className="py-2 text-slate-500 dark:text-slate-400">{formatFaDate(t.created_at)}</td>
                    <td className="py-2 dark:text-slate-200">{t.subject}</td>
                    <td className="py-2 dark:text-slate-200">{t.status}</td>
                  </tr>
                ))}
                {data.tickets.length === 0 && (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-400">تیکتی ثبت نشده</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{value}</p>
    </div>
  );
}
