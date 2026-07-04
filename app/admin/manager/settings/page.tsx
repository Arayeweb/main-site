'use client';

import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { Settings } from 'lucide-react';
import { fetchCompanySettings } from '@/lib/adminApi';
import { DEFAULT_COMPANY_SETTINGS } from '@/lib/adminTypes';
import { AdminErrorState, AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

type SettingsShape = typeof DEFAULT_COMPANY_SETTINGS;

export default function SettingsPage() {
  const { data, loading, error } = useAdminFetch(() => fetchCompanySettings(), []);

  if (loading) return <AdminLoadingState />;
  if (error) return <AdminErrorState error={error} />;

  const settings = (data?.settings ?? DEFAULT_COMPANY_SETTINGS) as SettingsShape;
  const { company, bank, invoice, defaults, roles } = settings;

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        title="تنظیمات شرکت"
        description="اطلاعات حقوقی، مالی و پیش‌فرض‌های سیستم"
        icon={Settings}
        breadcrumb={[{ label: 'مدیریت' }, { label: 'تنظیمات' }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SettingsSection title="اطلاعات شرکت">
          <SettingsGrid items={[
            ['نام برند', company.brandName],
            ['نام حقوقی', company.legalName],
            ['شماره ثبت', company.registrationNumber],
            ['شناسه ملی', company.nationalId],
            ['آدرس', company.address],
            ['تلفن', company.phone],
            ['ایمیل', company.email],
            ['وب‌سایت', company.website],
          ]} />
        </SettingsSection>

        <SettingsSection title="اطلاعات بانکی">
          <SettingsGrid items={[
            ['نام صاحب حساب', bank.accountHolder],
            ['شماره حساب', bank.accountNumber],
            ['شماره شبا', bank.iban],
            ['نام بانک', bank.bankName],
          ]} />
        </SettingsSection>

        <SettingsSection title="تنظیمات فاکتور">
          <SettingsGrid items={[
            ['پیشوند فاکتور', invoice.invoicePrefix],
            ['پیشوند پیش‌فاکتور', invoice.proformaPrefix],
            ['شرایط پرداخت پیش‌فرض', invoice.defaultPaymentTerms],
            ['توضیحات پیش‌فرض', invoice.defaultDescription],
            ['مالیات پیش‌فرض', `${invoice.defaultTax}٪`],
            ['اعتبار پیش‌فاکتور', `${invoice.proformaValidityDays} روز`],
          ]} />
        </SettingsSection>

        <SettingsSection title="پیش‌فرض‌های پروژه">
          <div className="space-y-3">
            <TagList label="وضعیت‌های پروژه" items={defaults.projectStatuses} />
            <TagList label="وضعیت‌های تسک" items={defaults.taskStatuses} />
            <TagList label="وضعیت‌های لید" items={defaults.leadStatuses} />
          </div>
        </SettingsSection>
      </div>

      <SettingsSection title="کاربران و نقش‌ها">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roles.map((role) => (
            <div key={role.role} className="border border-slate-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-800">{role.label}</h4>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{role.count} نفر</span>
              </div>
              <p className="text-xs text-slate-500">{role.description}</p>
            </div>
          ))}
        </div>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-bold text-slate-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SettingsGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="space-y-3">
      {items.map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 text-sm">
          <span className="text-slate-400 shrink-0">{label}</span>
          <span className="text-slate-800 text-left">{value || '—'}</span>
        </div>
      ))}
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md border border-slate-100">{item}</span>
        ))}
      </div>
    </div>
  );
}
