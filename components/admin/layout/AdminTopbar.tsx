'use client';

import { Bell, Menu, ChevronDown } from 'lucide-react';
import { PanelType, PANEL_LABELS } from './sidebarConfig';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAdminMe, fetchAdminNotifications } from '@/lib/adminApi';
import { formatFaDateTime } from '@/lib/adminMappers';
import { useAdminFetch } from '@/hooks/useAdminFetch';

interface AdminTopbarProps {
  panel: PanelType;
  onMenuClick: () => void;
}

export function AdminTopbar({ panel, onMenuClick }: AdminTopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);

  const { data } = useAdminFetch(() => fetchAdminMe(), []);
  const { data: notifData, loading: notifLoading, error: notifError } = useAdminFetch(
    () => fetchAdminNotifications(),
    []
  );

  const userName = data?.user?.name ?? 'کاربر';
  const notifications = notifData?.notifications ?? [];
  const unreadCount = notifData?.unread_count ?? 0;

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  async function handleLogout() {
    setProfileOpen(false);
    setNotificationsOpen(false);
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <header
      className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0"
      dir="rtl"
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        aria-label="منو"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm">
        <span className="text-slate-400">آرایه</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-700 font-medium">پنل {PANEL_LABELS[panel]}</span>
      </div>

      <div ref={wrapRef} className="flex items-center gap-2 mr-auto">
        <div className="relative">
          <button
            type="button"
            aria-label="اعلان‌ها"
            aria-expanded={notificationsOpen}
            onClick={() => {
              setNotificationsOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-3.5 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '۹+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute left-0 top-full mt-1 w-80 max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden" dir="rtl">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900">اعلان‌ها</p>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} مورد</span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <p className="text-sm text-slate-400 text-center py-8">در حال بارگذاری...</p>
                ) : notifError ? (
                  <p className="text-sm text-red-500 text-center py-8">خطا در بارگذاری اعلان‌ها</p>
                ) : notifications.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">اعلان جدیدی نیست</p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{n.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{formatFaDateTime(n.created_at)}</p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center p-1.5">
              <img src="/assets/logo-icon.svg" alt="آرایه" className="w-full h-full invert" />
            </div>
            <span className="hidden sm:block text-sm text-slate-700 font-medium">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50" dir="rtl">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500">وارد شده به عنوان</p>
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
                {data?.user?.email && (
                  <p className="text-xs text-slate-400 mt-0.5" dir="ltr">{data.user.email}</p>
                )}
              </div>
              <Link
                href="/admin/select-panel"
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                onClick={() => setProfileOpen(false)}
              >
                تغییر پنل
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-right"
              >
                خروج از حساب
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
