'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PanelType, getSidebarItems, PANEL_LABELS } from './sidebarConfig';
import {
  LayoutDashboard, FolderOpen, Users, CreditCard, FileText, UserCheck,
  BookOpen, Settings, BarChart2, UserPlus, Bell, FileCheck,
  Link2, Headphones, Kanban, Ticket, CheckSquare, Megaphone,
  GitPullRequest, Wrench, LogOut, ChevronLeft, LineChart, Zap, ShoppingBag, Briefcase, Target,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, FolderOpen, Users, CreditCard, FileText, UserCheck,
  BookOpen, Settings, BarChart2, UserPlus, Bell, FileCheck,
  Link2, Kanban, Ticket, CheckSquare, Megaphone, GitPullRequest, Wrench, LineChart, Zap,
  ShoppingBag, Briefcase, Target,
  HeadphonesIcon: Headphones,
};

interface AdminSidebarProps {
  panel: PanelType;
  onClose?: () => void;
}

export function AdminSidebar({ panel, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }
  const items = getSidebarItems(panel);

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-white border-l border-slate-200" dir="rtl">
      {/* Logo + Panel label */}
      <div className="px-4 py-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center p-1.5 bg-slate-900">
          <img src="/assets/logo-icon.svg" alt="آرایه" className="w-full h-full invert" />
        </div>
        <div>
          <p className="text-xs text-slate-400">پنل</p>
          <p className="text-sm font-bold text-slate-900">{PANEL_LABELS[panel]}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mr-auto p-1 rounded hover:bg-slate-100 text-slate-400 lg:hidden">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
          const isActive = pathname === item.href || (item.href !== `/admin/${panel}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-3 py-3 flex flex-col gap-1">
        <Link
          href="/admin/select-panel"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
          <span>تغییر پنل</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-right"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          <span>خروج</span>
        </button>
      </div>
    </aside>
  );
}
