'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { fetchWebsiteBrief, patchWebsiteBrief } from '@/lib/adminApi';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import {
  acquisitionChannelOptions,
  briefStatusLabels,
  confirmationBranchLabels,
  contentReadinessOptions,
  currentAssetOptions,
  customerScopeOptions,
  primaryBusinessProblemOptions,
  primaryConversionGoalOptions,
  recommendedServiceLabels,
  requiredSectionOptions,
} from '@/lib/websiteBrief/constants';
import type { ConfirmationBranch, RecommendedService } from '@/lib/websiteBrief/types';

function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label ?? value ?? '—';
}

function labelsForMulti(options: { value: string; label: string }[], values: unknown) {
  if (!Array.isArray(values)) return '—';
  return values.map((v) => labelFor(options, String(v))).join('، ') || '—';
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-3 border-b border-slate-100 last:border-0">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="sm:col-span-2 text-sm text-slate-800 leading-7">{value}</dd>
    </div>
  );
}

export default function WebsiteBriefDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error, refetch } = useAdminFetch(() => fetchWebsiteBrief(id), [id]);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const brief = data?.brief;

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;
  if (!brief) return <AdminErrorState error="not_found" />;

  const phone = String(brief.contact_phone ?? '');

  async function handleSave() {
    setSaving(true);
    setSaveMsg('');
    const res = await patchWebsiteBrief({
      id,
      ...(status ? { status } : {}),
      internal_notes: notes,
    });
    setSaving(false);
    if (!res.ok) {
      setSaveMsg('خطا در ذخیره');
      return;
    }
    setSaveMsg('ذخیره شد');
    refetch();
  }

  const rec = String(brief.recommended_service ?? 'none') as RecommendedService;
  const branch = brief.confirmation_branch
    ? confirmationBranchLabels[brief.confirmation_branch as ConfirmationBranch]
    : null;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title={String(brief.business_name ?? 'بریف طراحی سایت')}
        description={`ثبت: ${brief.created_at ? new Date(String(brief.created_at)).toLocaleString('fa-IR') : '—'}`}
        icon={ClipboardList}
        breadcrumb={[
          { label: 'فروش' },
          { label: 'بریف طراحی سایت', href: '/admin/sales/website-briefs' },
          { label: String(brief.contact_name ?? '') },
        ]}
        actions={
          <Link
            href="/admin/sales/website-briefs"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به لیست
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">پاسخ‌های فرم</h2>
          <dl>
            <DetailRow label="نام کسب‌وکار" value={String(brief.business_name ?? '—')} />
            <DetailRow label="خلاصه فعالیت" value={String(brief.business_summary ?? '—')} />
            <DetailRow
              label="محدوده مشتریان"
              value={labelFor(customerScopeOptions, String(brief.customer_scope ?? ''))}
            />
            {brief.primary_location ? (
              <DetailRow label="محدوده اصلی" value={String(brief.primary_location)} />
            ) : null}
            <DetailRow
              label="هدف اصلی سایت"
              value={labelFor(primaryConversionGoalOptions, String(brief.primary_conversion_goal ?? ''))}
            />
            <DetailRow
              label="بخش‌های ضروری"
              value={labelsForMulti(requiredSectionOptions, brief.required_sections)}
            />
            {brief.booking_type ? <DetailRow label="نوع رزرو" value={String(brief.booking_type)} /> : null}
            {brief.estimated_product_count ? (
              <DetailRow label="تعداد محصولات" value={String(brief.estimated_product_count)} />
            ) : null}
            {brief.required_languages ? (
              <DetailRow label="زبان‌ها" value={String(brief.required_languages)} />
            ) : null}
            <DetailRow
              label="مسیر جذب مشتری"
              value={labelsForMulti(acquisitionChannelOptions, brief.acquisition_channels)}
            />
            <DetailRow label="دارایی‌های فعلی" value={labelsForMulti(currentAssetOptions, brief.current_assets)} />
            {brief.current_website_url ? (
              <DetailRow
                label="سایت فعلی"
                value={
                  <a href={String(brief.current_website_url)} target="_blank" rel="noreferrer" className="text-teal-700">
                    {String(brief.current_website_url)}
                  </a>
                }
              />
            ) : null}
            <DetailRow
              label="مشکل اصلی"
              value={labelFor(primaryBusinessProblemOptions, String(brief.primary_business_problem ?? ''))}
            />
            {branch ? <DetailRow label="سؤال تأییدی" value={branch} /> : null}
            {brief.google_maps_status ? (
              <DetailRow label="وضعیت Google Maps" value={String(brief.google_maps_status)} />
            ) : null}
            {brief.google_lead_status ? (
              <DetailRow label="ورودی گوگل" value={String(brief.google_lead_status)} />
            ) : null}
            {brief.advertising_status ? (
              <DetailRow label="وضعیت تبلیغات" value={String(brief.advertising_status)} />
            ) : null}
            {brief.customer_guidance_need ? (
              <DetailRow label="نیاز راهنمایی" value={String(brief.customer_guidance_need)} />
            ) : null}
            {brief.lead_followup_status ? (
              <DetailRow label="پیگیری درخواست‌ها" value={String(brief.lead_followup_status)} />
            ) : null}
            <DetailRow
              label="آمادگی محتوا"
              value={labelFor(contentReadinessOptions, String(brief.content_readiness ?? ''))}
            />
            {brief.additional_notes ? (
              <DetailRow label="توضیحات اضافه" value={String(brief.additional_notes)} />
            ) : null}
          </dl>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-4">تماس</h2>
            <p className="text-sm font-medium text-slate-800">{String(brief.contact_name)}</p>
            <p className="mt-2 text-sm tabular-nums" dir="ltr">
              <a href={`tel:${phone}`} className="text-teal-700 hover:underline">
                {phone}
              </a>
            </p>
            <a
              href={`https://wa.me/${phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex text-sm text-teal-700 hover:underline"
            >
              باز کردن واتساپ
            </a>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h2 className="text-base font-semibold text-slate-800 mb-4">پیشنهاد مکمل</h2>
            <p className="text-sm text-slate-800">{recommendedServiceLabels[rec]}</p>
            <p className="mt-2 text-xs text-slate-500">کد: {String(brief.recommendation_reason_code ?? '—')}</p>
            <p className="mt-2 text-xs text-slate-500">
              علاقه مشتری:{' '}
              {brief.recommendation_interest === true
                ? 'بله — بررسی در پیشنهاد'
                : brief.recommendation_interest === false
                  ? 'خیر — فقط طراحی سایت'
                  : 'انتخاب نشده'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
            <h2 className="text-base font-semibold text-slate-800">پیگیری داخلی</h2>
            <div>
              <label className="text-xs font-semibold text-slate-500">وضعیت</label>
              <select
                value={status || String(brief.status ?? 'new')}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              >
                {Object.entries(briefStatusLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">یادداشت داخلی</label>
              <textarea
                value={notes || String(brief.internal_notes ?? '')}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="mt-1 w-full text-sm border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleSave()}
              className="w-full rounded-lg bg-slate-900 text-white text-sm py-2.5 disabled:opacity-60"
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
            {saveMsg ? <p className="text-xs text-slate-600">{saveMsg}</p> : null}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 text-xs text-slate-500 space-y-1">
            <p>UTM: {String(brief.utm_source ?? '—')} / {String(brief.utm_medium ?? '—')}</p>
            <p>کمپین: {String(brief.utm_campaign ?? '—')}</p>
            <p>منبع: {String(brief.source_page ?? '—')}</p>
            <p className="truncate">Referrer: {String(brief.referrer ?? '—')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
