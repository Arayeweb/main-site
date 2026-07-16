'use client';

import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Percent,
  DollarSign,
  Repeat,
  Kanban,
  ShoppingBag,
  Target,
  FlaskConical,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { StatCard } from '@/components/admin/ui/StatCard';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import {
  createGrowthExperiment,
  fetchGrowthExperiments,
  fetchGrowthOverview,
  patchGrowthExperiment,
  type GrowthExperiment,
  type GrowthPeriod,
} from '@/lib/adminApi';
import { formatAmount } from '@/lib/adminMappers';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

const SQUAD_TABS = [
  { id: 'acquisition', label: 'Acquisition' },
  { id: 'conversion', label: 'Conversion' },
  { id: 'product', label: 'Product' },
  { id: 'customerSuccess', label: 'Customer Success' },
  { id: 'experimentation', label: 'Experimentation' },
] as const;

const SQUAD_LABELS: Record<string, string> = {
  acquisition: 'جذب',
  conversion: 'تبدیل',
  product: 'محصول',
  cs: 'موفقیت مشتری',
  experimentation: 'آزمایش',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: 'بک‌لاگ',
  running: 'در حال اجرا',
  measuring: 'اندازه‌گیری',
  shipped: 'منتشر شد',
  killed: 'متوقف شد',
};

function mondayOfWeek(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

export default function ManagerGrowthPage() {
  const [period, setPeriod] = useState<GrowthPeriod>('7d');
  const [squadTab, setSquadTab] = useState<string>('acquisition');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const sprintWeek = mondayOfWeek();

  const { data: growth, loading, error } = useAdminFetch(
    () => fetchGrowthOverview(period),
    [period, refreshKey]
  );
  const { data: expData, loading: expLoading } = useAdminFetch(
    () => fetchGrowthExperiments({ sprint_week: sprintWeek }),
    [sprintWeek, refreshKey]
  );

  const revenueChart = useMemo(
    () => growth?.northStar.revenueTrend.map((d) => ({ date: d.date.slice(5), amount: d.amount })) ?? [],
    [growth]
  );

  const qualifiedChart = useMemo(
    () => growth?.northStar.qualifiedTrend.map((d) => ({ date: d.date.slice(5), count: d.count })) ?? [],
    [growth]
  );

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;
  if (!growth) return null;

  const d = growth.daily;

  async function handleCreateExperiment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const res = await createGrowthExperiment({
      squad: fd.get('squad'),
      idea: fd.get('idea'),
      hypothesis: fd.get('hypothesis'),
      kpi_target: fd.get('kpi_target'),
      impact: Number(fd.get('impact')),
      confidence: Number(fd.get('confidence')),
      effort: Number(fd.get('effort')),
      bucket: fd.get('bucket'),
      sprint_week: sprintWeek,
      status: 'backlog',
    });
    setSaving(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    setShowForm(false);
    setRefreshKey((k) => k + 1);
    e.currentTarget.reset();
  }

  async function updateExperimentStatus(id: string, status: string) {
    await patchGrowthExperiment(id, { status });
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="Growth KPI"
        description="North Star: درآمد + لید واجد شرایط — داشبورد هفتگی رشد"
        icon={Target}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'Growth KPI' }]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as GrowthPeriod)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
            >
              <option value="7d">۷ روز</option>
              <option value="30d">۳۰ روز</option>
            </select>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"
              aria-label="بروزرسانی"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="درآمد" value={formatAmount(d.revenue)} subtitle="تومان" icon={DollarSign} iconColor="text-teal-600" />
        <StatCard title="لید واجد شرایط" value={d.qualifiedLeads} subtitle="تأیید فروش" icon={Users} iconColor="text-violet-600" />
        <StatCard title="بازدیدکننده" value={d.visitors.toLocaleString('fa-IR')} icon={Eye} iconColor="text-blue-600" />
        <StatCard title="نرخ تبدیل" value={`${d.conversion}٪`} icon={Percent} iconColor="text-amber-600" />
        <StatCard title="CAC" value={formatAmount(d.cac)} subtitle="تومان / فروش" icon={TrendingUp} iconColor="text-rose-600" />
        <StatCard title="LTV" value={formatAmount(d.ltv)} subtitle="میانگین مشتری" icon={ShoppingBag} iconColor="text-cyan-600" />
        <StatCard title="MRR" value={formatAmount(d.mrr)} subtitle="تومان" icon={Repeat} iconColor="text-indigo-600" />
        <StatCard title="پایپ‌لاین" value={d.pipeline} subtitle="فعال" icon={Kanban} iconColor="text-orange-600" />
        <StatCard title="فروش" value={d.sales} subtitle={`${period === '7d' ? '۷' : '۳۰'} روز`} icon={Target} iconColor="text-green-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">روند درآمد</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">روند لید واجد شرایط</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={qualifiedChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">چرخه رشد</h3>
        <div className="flex flex-wrap gap-2">
          {growth.funnel.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-2">
              <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 min-w-[88px] text-center">
                <p className="text-xs text-slate-500">{stage.label}</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums">{stage.count.toLocaleString('fa-IR')}</p>
                {i > 0 && (
                  <p className="text-[10px] text-teal-600">{stage.conversionFromPrev}٪</p>
                )}
              </div>
              {i < growth.funnel.length - 1 && <span className="text-slate-300">←</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {SQUAD_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSquadTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                squadTab === tab.id
                  ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50/50'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5 grid sm:grid-cols-3 gap-4">
          {squadTab === 'acquisition' && (
            <>
              <StatCard title="بازدید" value={growth.squads.acquisition.visitors} icon={Eye} />
              <StatCard title="CPL" value={formatAmount(growth.squads.acquisition.cpl)} subtitle="تومان" icon={DollarSign} />
              <StatCard title="Qualified" value={growth.squads.acquisition.qualifiedLeads} icon={Users} />
            </>
          )}
          {squadTab === 'conversion' && (
            <>
              <StatCard title="Conversion" value={`${growth.squads.conversion.conversionRate}٪`} icon={Percent} />
              <StatCard title="تماس" value={growth.squads.conversion.bookedCalls} icon={Users} />
              <StatCard title="فروش" value={growth.squads.conversion.sales} icon={ShoppingBag} />
            </>
          )}
          {squadTab === 'product' && (
            <>
              <StatCard
                title="TTD FastWeb"
                value={growth.squads.product.ttdHours != null ? `${growth.squads.product.ttdHours}h` : '—'}
                icon={TrendingUp}
              />
              <StatCard title="باگ باز" value={growth.squads.product.bugs} icon={FlaskConical} />
              <StatCard title="Activation" value={`${growth.squads.product.activation}٪`} icon={Target} />
            </>
          )}
          {squadTab === 'customerSuccess' && (
            <>
              <StatCard title="Retention" value={growth.squads.customerSuccess.retention} icon={Repeat} />
              <StatCard title="Referral" value={growth.squads.customerSuccess.referral} icon={Users} />
              <StatCard title="Review" value={growth.squads.customerSuccess.review} icon={Target} />
            </>
          )}
          {squadTab === 'experimentation' && (
            <>
              <StatCard title="فرضیه این هفته" value={growth.squads.experimentation.hypothesesThisWeek} icon={FlaskConical} />
              <StatCard title="Shipped" value={growth.squads.experimentation.shipped} icon={TrendingUp} />
              <StatCard title="Killed" value={growth.squads.experimentation.killed} icon={Target} />
            </>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">محصولات (۹۰ روز)</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-lg border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">FastWeb</p>
            <p className="text-sm">بازدید: {growth.byProduct.fastweb.visitors.toLocaleString('fa-IR')}</p>
            <p className="text-sm">لید: {growth.byProduct.fastweb.leads}</p>
            <p className="text-sm">TTD: {growth.byProduct.fastweb.ttdHours ?? '—'} ساعت</p>
            <p className="text-sm">Activation: {growth.byProduct.fastweb.activationRate}٪</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Doctors</p>
            <p className="text-sm">بازدید: {growth.byProduct.doctors.visitors.toLocaleString('fa-IR')}</p>
            <p className="text-sm">لید: {growth.byProduct.doctors.leads}</p>
            <p className="text-sm">Conversion: {growth.byProduct.doctors.conversionRate}٪</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">SEO</p>
            <p className="text-sm">بازدید: {growth.byProduct.seo.visitors.toLocaleString('fa-IR')}</p>
            <p className="text-sm">لید: {growth.byProduct.seo.leads}</p>
            <p className="text-sm">generate_lead: {growth.byProduct.seo.generateLeadEvents}</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Araaye AI</p>
            <p className="text-sm">درآمد: {formatAmount(growth.byProduct.ai.revenue)}</p>
            <p className="text-sm">سفارش: {growth.byProduct.ai.orders}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Experiment Backlog (ICE)</h3>
            <p className="text-xs text-slate-500">اسپرینت هفته: {sprintWeek}</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            <Plus className="w-4 h-4" />
            فرضیه جدید
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreateExperiment} className="p-5 border-b border-slate-100 grid sm:grid-cols-2 gap-3 bg-slate-50/50">
            <select name="squad" required className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="acquisition">Acquisition</option>
              <option value="conversion">Conversion</option>
              <option value="product">Product</option>
              <option value="cs">Customer Success</option>
              <option value="experimentation">Experimentation</option>
            </select>
            <select name="bucket" className="border border-slate-200 rounded-lg px-3 py-2 text-sm">
              <option value="core">۷۰٪ Core</option>
              <option value="optimize">۲۰٪ Optimize</option>
              <option value="new">۱۰٪ New</option>
            </select>
            <input name="idea" required placeholder="ایده" className="border border-slate-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <input name="hypothesis" required placeholder="فرضیه" className="border border-slate-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <input name="kpi_target" required placeholder="هدف KPI (مثلاً +۲۰ لید)" className="border border-slate-200 rounded-lg px-3 py-2 text-sm sm:col-span-2" />
            <input name="impact" type="number" min={1} max={10} required placeholder="Impact 1-10" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <input name="confidence" type="number" min={1} max={10} required placeholder="Confidence 1-10" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <input name="effort" type="number" min={1} max={10} required placeholder="Effort 1-10" className="border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={saving} className="bg-teal-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
              {saving ? 'در حال ذخیره…' : 'افزودن به بک‌لاگ'}
            </button>
            {formError && <p className="text-sm text-red-600 sm:col-span-2">{formError}</p>}
          </form>
        )}

        {expLoading ? (
          <p className="p-5 text-sm text-slate-400">بارگذاری آزمایش‌ها…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                  {['امتیاز', 'ایده', 'KPI هدف', 'Squad', 'وضعیت', 'عملیات'].map((h) => (
                    <th key={h} className="text-right px-4 py-3 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(expData?.experiments ?? []).map((exp: GrowthExperiment) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-bold text-teal-700 tabular-nums">{Number(exp.score).toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{exp.idea}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{exp.hypothesis}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{exp.kpi_target}</td>
                    <td className="px-4 py-3">{SQUAD_LABELS[exp.squad] ?? exp.squad}</td>
                    <td className="px-4 py-3">{STATUS_LABELS[exp.status] ?? exp.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {exp.status === 'backlog' && (
                          <button type="button" onClick={() => updateExperimentStatus(exp.id, 'running')} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700">اجرا</button>
                        )}
                        {exp.status === 'running' && (
                          <button type="button" onClick={() => updateExperimentStatus(exp.id, 'measuring')} className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700">اندازه‌گیری</button>
                        )}
                        {exp.status === 'measuring' && (
                          <>
                            <button type="button" onClick={() => updateExperimentStatus(exp.id, 'shipped')} className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">Ship</button>
                            <button type="button" onClick={() => updateExperimentStatus(exp.id, 'killed')} className="text-xs px-2 py-1 rounded bg-red-50 text-red-700">Kill</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {(expData?.experiments ?? []).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">هنوز فرضیه‌ای برای این اسپرینت ثبت نشده</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
