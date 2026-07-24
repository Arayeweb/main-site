'use client';

import { useState } from 'react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { DataTable } from '@/components/admin/ui/DataTable';
import { StatCard } from '@/components/admin/ui/StatCard';
import { useAiOpsFetch, AiOpsLoadingState, AiOpsErrorState } from '@/components/admin/ai-ops/useAiOpsFetch';
import { fetchAiCampaignAttribution, fetchAiCoupons, upsertAiCoupon, type AiCampaignGroupRow, type AiCouponRow } from '@/lib/aiAdminApi';
import { INFLUENCER_SLOTS, buildInfluencerLinks, STARTER_FINAL_PRICE_TOMAN } from '@/lib/aiInfluencerCampaign';
import { formatToman } from '@/lib/aiAdminTypes';
import { Megaphone, Copy, Check, ShoppingCart, Wallet, Users, Plus } from 'lucide-react';
import { SimpleFormModal } from '@/components/admin/ui/SimpleFormModal';
import { ShamsiDateInput } from '@/components/admin/ui/ShamsiDateInput';

export default function AiOpsCampaignsPage() {
  const [groupBy, setGroupBy] = useState<'promo' | 'utm'>('promo');
  const [copied, setCopied] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AiCouponRow | null>(null);
  const [couponForm, setCouponForm] = useState({ code: '', value: '20', max_uses: '50', expires_at: '' });
  const [couponError, setCouponError] = useState('');
  const { data, loading, error } = useAiOpsFetch(
    () => fetchAiCampaignAttribution(groupBy),
    [groupBy]
  );
  const { data: couponsData, refetch: refetchCoupons } = useAiOpsFetch(() => fetchAiCoupons(), []);

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="کمپین‌های اینفلوئنسر"
        description="ردیابی فروش و ثبت‌نام به‌ازای کد تخفیف و utm_source — قبل از اسکیل بودجه، اینجا را روزانه چک کن."
        icon={Megaphone}
        actions={
          <button type="button" onClick={() => { setEditing(null); setCouponForm({ code: '', value: '20', max_uses: '50', expires_at: '' }); setCreating(true); }} className="flex items-center gap-1.5 text-sm bg-violet-600 text-white px-3 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> کمپین/کد جدید
          </button>
        }
      />

      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="سفارش‌ها" value={String(data.totals.orders)} icon={ShoppingCart} iconColor="text-blue-600" />
          <StatCard title="پرداخت موفق" value={String(data.totals.paid_orders)} icon={Wallet} iconColor="text-green-600" />
          <StatCard title="درآمد" value={formatToman(data.totals.revenue_toman)} icon={Wallet} iconColor="text-emerald-600" />
          <StatCard title="ثبت‌نام با UTM" value={String(data.totals.signups_with_utm)} icon={Users} iconColor="text-violet-600" />
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">لینک‌ساز پیج‌ها</h2>
        <p className="text-sm text-slate-500">
          هر پیج یک کد و utm_source جدا — قیمت نهایی Starter با ۲۰٪: {formatToman(STARTER_FINAL_PRICE_TOMAN)}
        </p>
        <div className="space-y-3">
          {INFLUENCER_SLOTS.map((slot) => {
            const links = buildInfluencerLinks(slot);
            return (
              <div
                key={slot.id}
                className="border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-sm space-y-2"
              >
                <div className="font-medium">
                  {slot.label} — کد <span dir="ltr" className="font-mono">{slot.code}</span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-slate-500">نبرد رایگان:</span>
                  <code dir="ltr" className="text-xs bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                    {links.battleUrl}
                  </code>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600"
                    onClick={() => copyText(`${slot.id}-battle`, links.battleUrl)}
                  >
                    {copied === `${slot.id}-battle` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-slate-500">خرید مستقیم:</span>
                  <code dir="ltr" className="text-xs bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded">
                    {links.pricingUrl}
                  </code>
                  <button
                    type="button"
                    className="p-1 text-slate-400 hover:text-slate-600"
                    onClick={() => copyText(`${slot.id}-pricing`, links.pricingUrl)}
                  >
                    {copied === `${slot.id}-pricing` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg text-sm ${groupBy === 'promo' ? 'bg-violet-100 text-violet-800' : 'text-slate-500'}`}
            onClick={() => setGroupBy('promo')}
          >
            گروه‌بندی کد تخفیف
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 rounded-lg text-sm ${groupBy === 'utm' ? 'bg-violet-100 text-violet-800' : 'text-slate-500'}`}
            onClick={() => setGroupBy('utm')}
          >
            گروه‌بندی utm_source
          </button>
        </div>
        {loading && <AiOpsLoadingState />}
        {error && <AiOpsErrorState error={error} />}
        {data && (
          <DataTable<AiCampaignGroupRow>
            data={data.groups}
            keyExtractor={(g) => g.key}
            columns={[
              { key: 'key', header: groupBy === 'promo' ? 'کد / کانال' : 'utm_source', render: (g) => <span dir="ltr">{g.key}</span> },
              { key: 'signups', header: 'ثبت‌نام', render: (g) => g.signups },
              { key: 'orders', header: 'سفارش', render: (g) => g.orders },
              { key: 'paid', header: 'پرداخت', render: (g) => g.paid_orders },
              { key: 'rev', header: 'درآمد', render: (g) => formatToman(g.revenue_toman) },
            ]}
          />
        )}
      </div>

      {couponsData && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">کدهای تخفیف اینفلوئنسر</h2>
          <div className="space-y-2">
            {couponsData.coupons.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 border border-slate-100 dark:border-slate-800 rounded-lg p-3 text-sm">
                <div>
                  <span dir="ltr" className="font-mono font-medium">{c.code}</span>
                  <span className="text-slate-500 mr-2">· {c.value}% · {c.used_count}/{c.max_uses} استفاده</span>
                </div>
                <button
                  type="button"
                  className="text-violet-600 text-xs"
                  onClick={() => {
                    setEditing(c);
                    setCouponForm({
                      code: c.code,
                      value: String(c.value),
                      max_uses: String(c.max_uses),
                      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : '',
                    });
                    setCreating(true);
                  }}
                >
                  ویرایش
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <SimpleFormModal
        title={editing ? 'ویرایش کد کمپین' : 'کد کمپین جدید'}
        open={creating}
        onClose={() => setCreating(false)}
        error={couponError}
        onSubmit={async () => {
          setCouponError('');
          const res = await upsertAiCoupon({
            id: editing?.id,
            code: couponForm.code,
            kind: 'percent',
            value: Number(couponForm.value) || 0,
            max_uses: Number(couponForm.max_uses) || 50,
            expires_at: couponForm.expires_at || null,
            active: true,
          });
          if (!res.ok) {
            setCouponError(res.error);
            return;
          }
          setCreating(false);
          refetchCoupons();
        }}
      >
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="کد" dir="ltr" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="درصد تخفیف" dir="ltr" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} />
        <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="حداکثر استفاده" dir="ltr" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} />
        <ShamsiDateInput
          value={couponForm.expires_at}
          onChange={(expires_at) => setCouponForm({ ...couponForm, expires_at })}
        />
      </SimpleFormModal>
    </div>
  );
}
