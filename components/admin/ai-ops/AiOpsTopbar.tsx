'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { useAiOpsTheme } from './useAiOpsTheme';
import { AI_OPS_ROLE_LABELS } from '@/lib/aiAdminAuth';

interface AiOpsTopbarProps {
  onMenuClick: () => void;
  userName: string;
  role: string;
}

export function AiOpsTopbar({ onMenuClick, userName, role }: AiOpsTopbarProps) {
  const { theme, toggle } = useAiOpsTheme();

  return (
    <header
      className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 gap-4 shrink-0"
      dir="rtl"
    >
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        aria-label="منو"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="hidden lg:flex items-center gap-2 text-sm">
        <span className="text-slate-400 dark:text-slate-500">آرایه</span>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-slate-700 dark:text-slate-200 font-medium">عملیات Araaye AI</span>
      </div>

      <div className="flex items-center gap-3 mr-auto">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-300 transition-colors"
          aria-label="تغییر پوسته"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {userName.charAt(0) || '؟'}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{userName}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{AI_OPS_ROLE_LABELS[role] ?? role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
