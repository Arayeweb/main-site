'use client';

import { useRouter } from 'next/navigation';
import { BarChart2, Headphones, LayoutDashboard, LogOut, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchAdminMe } from '@/lib/adminApi';
import { AdminLoadingState, useAdminFetch } from '@/hooks/useAdminFetch';

const PANELS = [
  {
    id: 'manager',
    label: 'مدیریت',
    description: 'نمای کلی فروش، پروژه‌ها، پرداخت‌ها، اعضای تیم و وضعیت کلی شرکت.',
    href: '/admin/manager',
    icon: LayoutDashboard,
    accent: 'from-slate-800 to-slate-900',
    ring: 'ring-slate-300',
    iconBg: 'bg-slate-900',
  },
  {
    id: 'sales',
    label: 'فروش',
    description: 'مدیریت لیدها، تماس‌ها، پیگیری‌ها، پیشنهاد قیمت‌ها و قراردادها.',
    href: '/admin/sales',
    icon: BarChart2,
    accent: 'from-blue-600 to-blue-700',
    ring: 'ring-blue-300',
    iconBg: 'bg-blue-600',
  },
  {
    id: 'support',
    label: 'پشتیبانی',
    description: 'مدیریت تیکت‌ها، درخواست‌های مشتریان، وضعیت پشتیبانی و پیگیری مشکلات.',
    href: '/admin/support',
    icon: Headphones,
    accent: 'from-teal-600 to-teal-700',
    ring: 'ring-teal-300',
    iconBg: 'bg-teal-600',
  },
  {
    id: 'ai-ops',
    label: 'عملیات Araaye AI',
    description: 'داشبورد کسب‌وکار، کاربران، اشتراک‌ها، مدل‌ها، ارائه‌دهنده‌ها، هزینه‌ها و تیکت‌های محصول هوش مصنوعی.',
    href: '/admin/ai-ops',
    icon: Bot,
    accent: 'from-violet-600 to-violet-700',
    ring: 'ring-violet-300',
    iconBg: 'bg-violet-600',
  },
] as const;

export default function SelectPanelPage() {
  const router = useRouter();
  const { data, loading } = useAdminFetch(() => fetchAdminMe(), []);
  const displayName = data?.user?.name?.split(' ')[0] ?? 'کاربر';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir="rtl">
        <AdminLoadingState />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-2xl mb-4 p-2.5">
            <img src="/assets/logo-icon.svg" alt="آرایه" className="w-full h-full invert" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">خوش آمدید، {displayName}</h1>
          <p className="text-slate-500 mt-2">پنل مورد نظر خود را انتخاب کنید.</p>
        </div>

        {/* Panel cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PANELS.map((panel) => {
            const Icon = panel.icon;
            return (
              <button
                key={panel.id}
                onClick={() => router.push(panel.href)}
                className={cn(
                  'group text-right bg-white border border-slate-200 rounded-2xl p-6 shadow-sm',
                  'hover:shadow-md hover:border-slate-300 hover:ring-2 transition-all duration-200',
                  panel.ring
                )}
              >
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-white', panel.iconBg)}>
                  <Icon className="w-5 h-5" strokeWidth={2} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">{panel.label}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{panel.description}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-slate-900 group-hover:gap-2.5 transition-all">
                  <span>ورود به پنل</span>
                  <span className="text-slate-400">←</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              await fetch('/api/admin/auth/logout', { method: 'POST' });
              router.push('/admin/login');
            }}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            خروج از حساب
          </button>
        </div>
      </div>
    </div>
  );
}
