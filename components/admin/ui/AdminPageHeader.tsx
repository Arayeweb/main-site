'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
  breadcrumb,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span>/</span>}
              <span className={cn(i === breadcrumb.length - 1 ? 'text-slate-600 font-medium' : '')}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 bg-slate-100 rounded-xl">
              <Icon className="w-5 h-5 text-slate-600" strokeWidth={1.75} />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {description && (
              <p className="text-sm text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
