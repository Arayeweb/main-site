'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AI_OPS_SIDEBAR_GROUPS } from './sidebarConfig';
import { modulesForRole } from '@/lib/aiAdminAuth';
import {
  LayoutDashboard, Users, Layers, Coins, Cpu, Server, BookOpen,
  MessagesSquare, TrendingUp, CreditCard, Ticket, Headphones, Bell,
  FileText, ScrollText, Settings, ShieldCheck, Lock, LogOut, ChevronLeft, Bot,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Users, Layers, Coins, Cpu, Server, BookOpen,
  MessagesSquare, TrendingUp, CreditCard, Ticket, Headphones, Bell,
  FileText, ScrollText, Settings, ShieldCheck, Lock,
};

interface AiOpsSidebarProps {
  role: string;
  onClose?: () => void;
}

export function AiOpsSidebar({ role, onClose }: AiOpsSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const allowed = new Set(modulesForRole(role));

  async function handleLogout() {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800"
      dir="rtl"
    >
      <div className="px-4 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-600 text-white">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">پنل</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">عملیات Araaye AI</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="mr-auto p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 lg:hidden">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-4">
        {AI_OPS_SIDEBAR_GROUPS.map((group) => {
          const items = group.items.filter((it) => allowed.has(it.module));
          if (items.length === 0) return null;
          return (
            <div key={group.title}>
              <p className="px-3 mb-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500">{group.title}</p>
              <div className="flex flex-col gap-0.5">
                {items.map((item) => {
                  const Icon = ICON_MAP[item.iconName] || LayoutDashboard;
                  const isActive = pathname === item.href || (item.href !== '/admin/ai-ops' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-violet-600 text-white font-medium'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3 flex flex-col gap-1">
        <Link
          href="/admin/select-panel"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" strokeWidth={1.75} />
          <span>تغییر پنل</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 transition-colors w-full text-right"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
          <span>خروج</span>
        </button>
      </div>
    </aside>
  );
}
