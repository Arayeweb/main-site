'use client';

import { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

export function EmptyState({
  title = 'موردی یافت نشد',
  description = 'نتیجه‌ای برای این جستجو وجود ندارد.',
  icon: Icon = Inbox,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 bg-slate-100 rounded-2xl mb-4">
        <Icon className="w-8 h-8 text-slate-400" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>
    </div>
  );
}
