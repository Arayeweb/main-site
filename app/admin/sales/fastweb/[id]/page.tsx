'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, ExternalLink, Zap } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { PromoteToCrmButton } from '@/components/admin/ui/PromoteToCrmButton';
import { StatusBadge } from '@/components/admin/ui/StatusBadge';
import { fetchFastWebOrder, patchFastWebOrder } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import {
  FULFILLMENT_LABELS,
  FULFILLMENT_PIPELINE,
  type FastWebFulfillmentStatus,
} from '@/lib/fastweb';
import { formatPriceToman } from '@/lib/aiPricingConfig';

const PUBLISH_CHECKLIST = [
  'موبایل و دسکتاپ بررسی شد',
  'فرم درخواست کار می‌کند',
  'لینک واتساپ / اینستا / تماس درست است',
  'title و description سئو پر شده',
  'اسلاگ /s/[slug] زنده است',
] as const;

export default function FastWebAdminDetailPage() {
  const params = useParams();
  const id = String(params.id || '');
  const { data, loading, error, refetch } = useAdminFetch(
    () => fetchFastWebOrder(id),
    [id]
  );

  const order = data?.order as
    | {
        id: string;
        businessName?: string | null;
        phone?: string | null;
        amountToman?: number;
        fulfillmentStatus?: string;
        adminNotes?: string | null;
        slug?: string;
        publicPath?: string;
        brief?: Record<string, unknown>;
        templateKey?: string | null;
        styleKey?: string | null;
        brandColor?: string | null;
        domainRequest?: string | null;
        revisionNotes?: string | null;
        previewContent?: Record<string, unknown>;
      }
    | undefined;

  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [slug, setSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!order) return;
    setStatus(order.fulfillmentStatus || 'received');
    setAdminNotes(order.adminNotes || '');
    setSlug(order.slug || '');
  }, [order]);

  if (loading) return <AdminLoadingState />;
  if (error || !order) return <AdminErrorState error={error || 'not_found'} />;

  const brief = (order.brief || {}) as Record<string, unknown>;
  const currentStatus = status || order.fulfillmentStatus || 'received';

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await patchFastWebOrder({
        id: order!.id,
        fulfillmentStatus: currentStatus,
        adminNotes,
        slug: slug || undefined,
        publishedContent:
          currentStatus === 'published' ||
          currentStatus === 'first_version' ||
          currentStatus === 'awaiting_approval'
            ? order!.previewContent
            : undefined,
      });
      if (!res.ok) {
        setMsg('ذخیره ناموفق بود.');
        return;
      }
      setMsg('ذخیره شد.');
      refetch();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={order.businessName || 'سفارش سایت فوری'}
        description={`${order.phone || '—'} · ${formatPriceToman(Number(order.amountToman) || 0)} تومان`}
        icon={Zap}
        breadcrumb={[
          { label: 'فروش' },
          { label: 'سایت فوری', href: '/admin/sales/fastweb' },
          { label: 'جزئیات' },
        ]}
      />

      <div className="flex flex-wrap gap-3 items-center">
        <PromoteToCrmButton sourceType="fastweb" sourceId={order.id} />
        <Link
          href="/admin/sales/fastweb"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به صف
        </Link>
        <a
          href={order.publicPath || `/s/${order.slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[#0F4C5C]"
        >
          مشاهده /s/{order.slug}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <Link
          href={`/dashboard/fastweb/${order.id}`}
          className="text-sm text-slate-600 underline"
        >
          داشبورد مشتری
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
          <h2 className="font-bold">خلاصه brief</h2>
          <dl className="text-sm space-y-2">
            <Row label="هدف" value={String(brief.goal || '—')} />
            <Row label="حوزه" value={String(brief.industry || '—')} />
            <Row label="شهر" value={String(brief.city || '—')} />
            <Row label="مخاطب" value={String(brief.audience || '—')} />
            <Row label="مزیت" value={String(brief.mainAdvantage || '—')} />
            <Row label="توضیح" value={String(brief.shortDescription || '—')} />
            <Row label="خدمات" value={String(brief.offerings || '—')} />
            <Row
              label="بخش‌ها"
              value={
                Array.isArray(brief.sections)
                  ? brief.sections.join('، ')
                  : '—'
              }
            />
            <Row label="قالب" value={order.templateKey || '—'} />
            <Row label="سبک" value={order.styleKey || '—'} />
            <Row label="رنگ" value={order.brandColor || '—'} />
            <Row
              label="دامنه"
              value={
                order.domainRequest ||
                String(brief.customDomain || '—')
              }
            />
            <Row label="اصلاحات مشتری" value={order.revisionNotes || '—'} />
          </dl>
        </section>

        <form onSubmit={save} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold">وضعیت fulfillment</h2>
            <StatusBadge
              label={
                FULFILLMENT_LABELS[
                  (order.fulfillmentStatus ||
                    'received') as FastWebFulfillmentStatus
                ] ?? String(order.fulfillmentStatus)
              }
              colorClass="bg-teal-50 text-teal-800 ring-teal-200"
            />
          </div>
          <select
            value={currentStatus}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {FULFILLMENT_PIPELINE.map((s) => (
              <option key={s} value={s}>
                {FULFILLMENT_LABELS[s]}
              </option>
            ))}
          </select>

          <label className="block text-sm">
            <span className="font-medium">اسلاگ عمومی</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm">
            <span className="font-medium">یادداشت داخلی</span>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>

          <div>
            <p className="text-sm font-medium mb-2">چک‌لیست انتشار</p>
            <ul className="space-y-2">
              {PUBLISH_CHECKLIST.map((item) => (
                <li key={item}>
                  <label className="flex items-start gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[item])}
                      onChange={(e) =>
                        setChecked((prev) => ({ ...prev, [item]: e.target.checked }))
                      }
                    />
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'در حال ذخیره…' : 'ذخیره وضعیت'}
          </button>
          {msg ? <p className="text-sm text-teal-700">{msg}</p> : null}
        </form>
      </div>

      {order.previewContent?.headline ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-bold mb-3">پیش‌نمایش محتوا</h2>
          <p className="text-lg font-semibold">
            {String(order.previewContent.headline)}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {String(order.previewContent.subheadline || '')}
          </p>
          <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {JSON.stringify(order.previewContent, null, 2)}
          </pre>
        </section>
      ) : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
