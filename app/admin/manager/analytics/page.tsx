'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Eye,
  Filter,
  Flag,
  Link2,
  LineChart as LineChartIcon,
  MousePointerClick,
  RefreshCw,
  Route,
  ShoppingCart,
  Target,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { StatCard } from '@/components/admin/ui/StatCard';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';
import {
  fetchAnalyticsEvents,
  type AnalyticsReportResponse,
} from '@/lib/adminApi';
import { normalizeUtmValue } from '@/lib/utm';

type Tab = 'overview' | 'funnel' | 'acquisition' | 'behavior' | 'retention' | 'quality';
type MetricRow = AnalyticsReportResponse['acquisition']['sources'][number];

const TABS: Array<{ key: Tab; label: string; icon: typeof Activity }> = [
  { key: 'overview', label: 'نمای کلی', icon: BarChart3 },
  { key: 'funnel', label: 'قیف تبدیل', icon: Target },
  { key: 'acquisition', label: 'کمپین و UTM', icon: Flag },
  { key: 'behavior', label: 'رفتار محصول', icon: Route },
  { key: 'retention', label: 'بازگشت کاربران', icon: Users },
  { key: 'quality', label: 'کیفیت و رویدادها', icon: CheckCircle2 },
];

const SELECT_CLASS =
  'h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-teal-500';

function fa(value: number) {
  return value.toLocaleString('fa-IR');
}

function Empty({ children = 'داده‌ای برای این فیلتر وجود ندارد.' }: { children?: string }) {
  return <p className="py-10 text-center text-sm text-slate-400">{children}</p>;
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function MetricTable({ rows, label }: { rows: MetricRow[]; label: string }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-xs">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-3 py-2 text-right">{label}</th>
            <th className="px-3 py-2 text-left">بازدیدکننده</th>
            <th className="px-3 py-2 text-left">نشست</th>
            <th className="px-3 py-2 text-left">لید</th>
            <th className="px-3 py-2 text-left">فعال‌سازی</th>
            <th className="px-3 py-2 text-left">خرید</th>
            <th className="px-3 py-2 text-left">نرخ تبدیل</th>
            <th className="px-3 py-2 text-left">درآمد</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50/70">
              <td className="max-w-[240px] truncate px-3 py-2.5 font-medium text-slate-800" dir="ltr">
                {row.key}
              </td>
              <td className="px-3 py-2.5 text-left tabular-nums">{fa(row.visitors)}</td>
              <td className="px-3 py-2.5 text-left tabular-nums">{fa(row.sessions)}</td>
              <td className="px-3 py-2.5 text-left tabular-nums">{fa(row.leads)}</td>
              <td className="px-3 py-2.5 text-left tabular-nums">{fa(row.activations)}</td>
              <td className="px-3 py-2.5 text-left tabular-nums">{fa(row.purchases)}</td>
              <td className="px-3 py-2.5 text-left tabular-nums">{row.conversion_rate}٪</td>
              <td className="px-3 py-2.5 text-left tabular-nums">{fa(row.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Funnel({
  rows,
}: {
  rows: AnalyticsReportResponse['funnel'];
}) {
  if (!rows.length) return <Empty />;
  const max = Math.max(rows[0]?.count || 0, ...rows.map((row) => row.count), 1);
  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={row.key}>
          <div className="mb-1 flex items-center justify-between gap-4 text-xs">
            <span className="font-medium text-slate-700">{row.label}</span>
            <span className="flex items-center gap-3 tabular-nums">
              <span className="font-bold text-slate-900">{fa(row.count)}</span>
              {index > 0 && (
                <span className={row.from_previous_rate >= 30 ? 'text-emerald-600' : 'text-amber-600'}>
                  {row.from_previous_rate}٪ از مرحله قبل
                </span>
              )}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-l from-teal-500 to-emerald-400"
              style={{ width: `${Math.max(1, (row.count / max) * 100)}%` }}
            />
          </div>
          {index > 0 && row.drop_off > 0 && (
            <p className="mt-1 text-[10px] text-slate-400">
              ریزش نسبت به مرحله قبل: {fa(row.drop_off)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function QualityMetric({
  label,
  value,
  good = 95,
}: {
  label: string;
  value: number;
  good?: number;
}) {
  const color = value >= good ? 'bg-emerald-500' : value >= 70 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-slate-600">{label}</span>
        <span className="font-bold tabular-nums text-slate-900">{value}٪</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://araaye.com/');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [content, setContent] = useState('');
  const [term, setTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const generated = useMemo(() => {
    try {
      const url = new URL(baseUrl);
      const values = {
        utm_source: source,
        utm_medium: medium,
        utm_campaign: campaign,
        utm_content: content,
        utm_term: term,
      };
      for (const [key, value] of Object.entries(values)) {
        const normalized = normalizeUtmValue(value);
        if (normalized) url.searchParams.set(key, normalized);
      }
      return url.toString();
    } catch {
      return '';
    }
  }, [baseUrl, source, medium, campaign, content, term]);

  return (
    <SectionCard
      title="UTM Builder استاندارد"
      description="نام‌ها خودکار lowercase و با underscore یکدست می‌شوند؛ source، medium و campaign برای کمپین‌های پولی الزامی‌اند."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <label className="text-xs text-slate-600">
          URL مقصد
          <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" dir="ltr" />
        </label>
        <label className="text-xs text-slate-600">
          utm_source *
          <input value={source} onChange={(event) => setSource(event.target.value)} placeholder="google" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" dir="ltr" />
        </label>
        <label className="text-xs text-slate-600">
          utm_medium *
          <select value={medium} onChange={(event) => setMedium(event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" dir="ltr">
            <option value="">انتخاب کنید</option>
            <option value="cpc">cpc</option>
            <option value="paid_social">paid_social</option>
            <option value="email">email</option>
            <option value="social">social</option>
            <option value="referral">referral</option>
            <option value="affiliate">affiliate</option>
          </select>
        </label>
        <label className="text-xs text-slate-600">
          utm_campaign *
          <input value={campaign} onChange={(event) => setCampaign(event.target.value)} placeholder="summer_sale_2026" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" dir="ltr" />
        </label>
        <label className="text-xs text-slate-600">
          utm_content
          <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="hero_cta_a" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" dir="ltr" />
        </label>
        <label className="text-xs text-slate-600">
          utm_term
          <input value={term} onChange={(event) => setTerm(event.target.value)} placeholder="design_website" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" dir="ltr" />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-lg bg-slate-950 p-3 text-xs text-slate-200 md:flex-row md:items-center">
        <code className="min-w-0 flex-1 break-all" dir="ltr">{generated || 'URL نامعتبر است'}</code>
        <button
          type="button"
          disabled={!generated || !source || !medium || !campaign}
          onClick={async () => {
            await navigator.clipboard.writeText(generated);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          }}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-white px-3 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Link2 className="h-4 w-4" />
          {copied ? 'کپی شد' : 'کپی لینک'}
        </button>
      </div>
    </SectionCard>
  );
}

export default function ManagerAnalyticsPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [period, setPeriod] = useState('30d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [product, setProduct] = useState('all');
  const [source, setSource] = useState('all');
  const [medium, setMedium] = useState('all');
  const [campaign, setCampaign] = useState('all');
  const [page, setPage] = useState('all');
  const [eventName, setEventName] = useState('all');
  const [attribution, setAttribution] = useState('session');
  const [refreshKey, setRefreshKey] = useState(0);

  const query = useMemo(() => {
    const params = new URLSearchParams({ period, attribution });
    if (period === 'custom' && from) params.set('from', from);
    if (period === 'custom' && to) params.set('to', to);
    if (product !== 'all') params.set('product', product);
    if (source !== 'all') params.set('source', source);
    if (medium !== 'all') params.set('medium', medium);
    if (campaign !== 'all') params.set('campaign', campaign);
    if (page !== 'all') params.set('page', page);
    if (eventName !== 'all') params.set('event', eventName);
    return params;
  }, [period, from, to, product, source, medium, campaign, page, eventName, attribution]);
  const queryString = query.toString();

  const { data, loading, error } = useAdminFetch(
    () => fetchAnalyticsEvents(new URLSearchParams(queryString)),
    [queryString, refreshKey],
  );

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;
  if (!data) return null;

  const { summary, quality } = data;
  const utmIssues =
    quality.utm.campaign_without_source +
    quality.utm.medium_without_source +
    quality.utm.source_without_medium +
    quality.utm.paid_without_campaign +
    quality.utm.non_normalized;

  return (
    <div className="flex flex-col gap-5" dir="rtl">
      <AdminPageHeader
        title="تحلیل رشد و رفتار مشتری"
        description="قیف تبدیل، کمپین‌ها، UTM، رفتار محصول، retention و کیفیت داده"
        icon={LineChartIcon}
        breadcrumb={[{ label: 'آرایه' }, { label: 'مدیریت' }, { label: 'تحلیل' }]}
        actions={
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            به‌روزرسانی
          </button>
        }
      />

      <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <div className="ml-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <Filter className="h-4 w-4" />
            فیلتر
          </div>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className={SELECT_CLASS}>
            <option value="7d">۷ روز اخیر</option>
            <option value="30d">۳۰ روز اخیر</option>
            <option value="90d">۹۰ روز اخیر</option>
            <option value="custom">بازه دلخواه</option>
          </select>
          {period === 'custom' && (
            <>
              <input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className={SELECT_CLASS} aria-label="از تاریخ" />
              <input type="date" value={to} onChange={(event) => setTo(event.target.value)} className={SELECT_CLASS} aria-label="تا تاریخ" />
            </>
          )}
          <select value={product} onChange={(event) => setProduct(event.target.value)} className={SELECT_CLASS}>
            <option value="all">همه محصولات</option>
            {data.options.products.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={source} onChange={(event) => setSource(event.target.value)} className={SELECT_CLASS}>
            <option value="all">همه sourceها</option>
            {data.options.sources.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={medium} onChange={(event) => setMedium(event.target.value)} className={SELECT_CLASS}>
            <option value="all">همه mediumها</option>
            {data.options.mediums.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={campaign} onChange={(event) => setCampaign(event.target.value)} className={SELECT_CLASS}>
            <option value="all">همه کمپین‌ها</option>
            {data.options.campaigns.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={page} onChange={(event) => setPage(event.target.value)} className={SELECT_CLASS}>
            <option value="all">همه صفحات</option>
            {data.options.pages.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={eventName} onChange={(event) => setEventName(event.target.value)} className={SELECT_CLASS}>
            <option value="all">همه eventها</option>
            {data.options.events.map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
          <select value={attribution} onChange={(event) => setAttribution(event.target.value)} className={SELECT_CLASS}>
            <option value="session">Attribution نشست</option>
            <option value="first">First-touch</option>
            <option value="last">Last-touch</option>
          </select>
          {(product !== 'all' || source !== 'all' || medium !== 'all' || campaign !== 'all' || page !== 'all' || eventName !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setProduct('all');
                setSource('all');
                setMedium('all');
                setCampaign('all');
                setPage('all');
                setEventName('all');
              }}
              className="h-10 rounded-lg px-3 text-xs text-rose-600 hover:bg-rose-50"
            >
              حذف فیلترها
            </button>
          )}
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                tab === item.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <StatCard title="بازدیدکننده" value={fa(summary.visitors)} subtitle={`${fa(summary.sessions)} نشست`} icon={Eye} iconColor="text-blue-600" />
            <StatCard title="Engagement" value={`${summary.engagement_rate}٪`} subtitle={`${fa(summary.engaged_sessions)} نشست`} icon={MousePointerClick} iconColor="text-cyan-600" />
            <StatCard title="لید" value={fa(summary.leads)} subtitle={`${summary.lead_conversion_rate}٪ تبدیل`} icon={Users} iconColor="text-violet-600" />
            <StatCard title="فعال‌سازی" value={fa(summary.activations)} subtitle={`${summary.activation_rate}٪`} icon={Activity} iconColor="text-teal-600" />
            <StatCard title="Checkout" value={fa(summary.checkouts)} subtitle="شروع پرداخت" icon={ShoppingCart} iconColor="text-amber-600" />
            <StatCard title="خرید" value={fa(summary.purchases)} subtitle={`${summary.checkout_conversion_rate}٪ checkout`} icon={CircleDollarSign} iconColor="text-emerald-600" />
            <StatCard title="درآمد" value={fa(summary.revenue)} subtitle="ریال" icon={CircleDollarSign} iconColor="text-green-700" />
            <StatCard title="نشست بدون خطا" value={`${summary.error_free_session_rate}٪`} subtitle={`${fa(summary.events)} event`} icon={CheckCircle2} iconColor="text-emerald-600" />
          </div>

          <SectionCard title="روند عملکرد" description="نشست، لید، فعال‌سازی و خرید در بازه انتخاب‌شده">
            {!data.trend.length ? <Empty /> : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} reversed />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sessions" name="نشست" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="leads" name="لید" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="activations" name="فعال‌سازی" stroke="#14b8a6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="purchases" name="خرید" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="قیف کل">
              <Funnel rows={data.funnel} />
            </SectionCard>
            <SectionCard title="عملکرد محصولات" description="با انتخاب محصول از فیلتر بالا جزئیات همان محصول را ببینید">
              <MetricTable rows={data.products} label="محصول" />
            </SectionCard>
          </div>
        </>
      )}

      {tab === 'funnel' && (
        <>
          <SectionCard title="قیف اصلی" description="هر مرحله بر اساس session یکتا محاسبه می‌شود">
            <Funnel rows={data.funnel} />
          </SectionCard>
          <div className="grid gap-5 xl:grid-cols-2">
            {data.funnels_by_product.map(({ product: productName, funnel }) => (
              <SectionCard key={productName} title={`قیف ${productName}`}>
                <Funnel rows={funnel} />
              </SectionCard>
            ))}
          </div>
        </>
      )}

      {tab === 'acquisition' && (
        <>
          <UtmBuilder />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard title="Attribution" value={attribution === 'first' ? 'First-touch' : attribution === 'last' ? 'Last-touch' : 'Session'} subtitle="قابل تغییر از فیلتر" icon={Flag} iconColor="text-blue-600" />
            <StatCard title="داده دارای UTM" value={`${quality.utm.attributed_event_pct}٪`} subtitle={`${fa(quality.utm.unattributed_events)} بدون attribution`} icon={Target} iconColor="text-teal-600" />
            <StatCard title="اشکال UTM" value={fa(utmIssues)} subtitle="نیازمند اصلاح کمپین" icon={AlertTriangle} iconColor={utmIssues ? 'text-amber-600' : 'text-emerald-600'} />
            <StatCard title="درآمد/بازدیدکننده" value={fa(summary.revenue_per_visitor)} subtitle="ریال" icon={CircleDollarSign} iconColor="text-green-600" />
          </div>
          <SectionCard title="منابع ورودی">
            <MetricTable rows={data.acquisition.sources} label="utm_source" />
          </SectionCard>
          <SectionCard title="کمپین‌ها">
            <MetricTable rows={data.acquisition.campaigns} label="utm_campaign" />
          </SectionCard>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="Mediumها">
              <MetricTable rows={data.acquisition.mediums} label="utm_medium" />
            </SectionCard>
            <SectionCard title="Landing pageها">
              <MetricTable rows={data.acquisition.landing_pages} label="صفحه ورود" />
            </SectionCard>
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="Creative / Content">
              <MetricTable rows={data.acquisition.contents} label="utm_content" />
            </SectionCard>
            <SectionCard title="Keyword / Term">
              <MetricTable rows={data.acquisition.terms} label="utm_term" />
            </SectionCard>
          </div>
        </>
      )}

      {tab === 'behavior' && (
        <>
          <SectionCard title="مسیرهای پرتکرار کاربران" description="صفحات متوالی هر session و نرخ تبدیل همان مسیر">
            {!data.behavior.journeys.length ? <Empty /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-right">مسیر</th>
                      <th className="px-3 py-2 text-left">نشست</th>
                      <th className="px-3 py-2 text-left">تبدیل</th>
                      <th className="px-3 py-2 text-left">نرخ تبدیل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.behavior.journeys.map((row) => (
                      <tr key={row.path}>
                        <td className="px-3 py-3 text-slate-700" dir="ltr">{row.path}</td>
                        <td className="px-3 py-3 text-left">{fa(row.sessions)}</td>
                        <td className="px-3 py-3 text-left">{fa(row.conversions)}</td>
                        <td className="px-3 py-3 text-left">{row.conversion_rate}٪</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="عملکرد صفحات">
            {!data.behavior.pages.length ? <Empty /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2 text-right">صفحه</th>
                      <th className="px-3 py-2 text-left">نشست</th>
                      <th className="px-3 py-2 text-left">CTA</th>
                      <th className="px-3 py-2 text-left">لید</th>
                      <th className="px-3 py-2 text-left">نرخ لید</th>
                      <th className="px-3 py-2 text-left">زمان درگیری</th>
                      <th className="px-3 py-2 text-left">خروج</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.behavior.pages.map((row) => (
                      <tr key={row.page}>
                        <td className="px-3 py-2.5 text-slate-800" dir="ltr">{row.page}</td>
                        <td className="px-3 py-2.5 text-left">{fa(row.sessions)}</td>
                        <td className="px-3 py-2.5 text-left">{fa(row.ctas)}</td>
                        <td className="px-3 py-2.5 text-left">{fa(row.leads)}</td>
                        <td className="px-3 py-2.5 text-left">{row.lead_rate}٪</td>
                        <td className="px-3 py-2.5 text-left">{fa(row.avg_engagement_seconds)} ثانیه</td>
                        <td className="px-3 py-2.5 text-left">{fa(row.exits)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="استفاده از قابلیت‌ها">
              <MetricTable rows={data.behavior.features} label="قابلیت" />
            </SectionCard>
            <SectionCard title="دستگاه‌ها">
              <MetricTable rows={data.behavior.devices} label="Device" />
            </SectionCard>
            <SectionCard title="رویدادهای پرتکرار">
              <MetricTable rows={data.behavior.events} label="Event" />
            </SectionCard>
            <SectionCard title="خطاهای محصول">
              <MetricTable rows={data.behavior.errors} label="خطا" />
            </SectionCard>
          </div>
        </>
      )}

      {tab === 'retention' && (
        <SectionCard title="Retention cohort" description="درصد کاربرانی که در هفته‌های بعد از اولین بازدید برگشته‌اند">
          {!data.retention.length ? <Empty /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-right">هفته شروع</th>
                    <th className="px-3 py-2 text-left">کاربر</th>
                    <th className="px-3 py-2 text-left">هفته ۰</th>
                    <th className="px-3 py-2 text-left">هفته ۱</th>
                    <th className="px-3 py-2 text-left">هفته ۲</th>
                    <th className="px-3 py-2 text-left">هفته ۳</th>
                    <th className="px-3 py-2 text-left">هفته ۴</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.retention.map((row) => (
                    <tr key={row.cohort}>
                      <td className="px-3 py-3 font-medium text-slate-800">{row.cohort}</td>
                      <td className="px-3 py-3 text-left">{fa(row.visitors)}</td>
                      {(['week_0', 'week_1', 'week_2', 'week_3', 'week_4'] as const).map((key) => (
                        <td key={key} className="px-3 py-3 text-left">
                          <span
                            className="inline-block min-w-12 rounded px-2 py-1 text-center font-semibold"
                            style={{ backgroundColor: `rgba(20,184,166,${Math.max(0.06, row[key] / 100)})` }}
                          >
                            {row[key]}٪
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {tab === 'quality' && (
        <>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionCard title="کامل‌بودن داده">
              <div className="space-y-4">
                <QualityMetric label="Event ID" value={quality.event_id_pct} />
                <QualityMetric label="Visitor ID" value={quality.visitor_id_pct} />
                <QualityMetric label="Session ID" value={quality.session_id_pct} />
                <QualityMetric label="Product Area" value={quality.product_area_pct} />
                <QualityMetric label="Page" value={quality.page_pct} />
                <QualityMetric label="Canonical Event" value={quality.canonical_event_pct} />
                <QualityMetric label="رویدادهای غیرتکراری" value={100 - quality.duplicate_event_pct} />
                <QualityMetric label="خرید تأییدشده سمت سرور" value={quality.server_verified_purchase_pct} />
              </div>
            </SectionCard>
            <SectionCard title="سلامت UTM" description="این خطاها باید در لینک‌سازی کمپین اصلاح شوند">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {[
                  ['کمپین بدون source', quality.utm.campaign_without_source],
                  ['medium بدون source', quality.utm.medium_without_source],
                  ['source بدون medium', quality.utm.source_without_medium],
                  ['کمپین paid بدون campaign', quality.utm.paid_without_campaign],
                  ['نام‌گذاری غیراستاندارد', quality.utm.non_normalized],
                  ['Event بدون attribution', quality.utm.unattributed_events],
                  ['Event تکراری', quality.duplicate_events],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="text-slate-500">{label}</p>
                    <p className={`mt-1 text-xl font-bold ${Number(value) ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {fa(Number(value))}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="آخرین رویدادها" description="بدون اطلاعات شخصی؛ برای debug کردن tracking">
            {!data.recent_events.length ? <Empty /> : (
              <div className="max-h-[620px] overflow-auto">
                <table className="w-full min-w-[1100px] text-[11px]">
                  <thead className="sticky top-0 bg-slate-100 text-slate-500">
                    <tr>
                      <th className="px-2 py-2 text-right">زمان</th>
                      <th className="px-2 py-2 text-right">Event</th>
                      <th className="px-2 py-2 text-right">محصول</th>
                      <th className="px-2 py-2 text-right">صفحه</th>
                      <th className="px-2 py-2 text-right">Source</th>
                      <th className="px-2 py-2 text-right">Medium</th>
                      <th className="px-2 py-2 text-right">Campaign</th>
                      <th className="px-2 py-2 text-right">Origin</th>
                      <th className="px-2 py-2 text-right">Session</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recent_events.map((row, index) => (
                      <tr key={`${row.created_at}-${index}`} className="font-mono hover:bg-slate-50">
                        <td className="whitespace-nowrap px-2 py-2">{new Date(row.created_at).toLocaleString('fa-IR')}</td>
                        <td className="px-2 py-2 text-teal-700">{row.event}</td>
                        <td className="px-2 py-2">{row.product}</td>
                        <td className="max-w-52 truncate px-2 py-2" dir="ltr">{row.page}</td>
                        <td className="px-2 py-2">{row.source}</td>
                        <td className="px-2 py-2">{row.medium}</td>
                        <td className="px-2 py-2">{row.campaign}</td>
                        <td className="px-2 py-2">{row.origin}</td>
                        <td className="max-w-32 truncate px-2 py-2" title={row.session_id}>{row.session_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
