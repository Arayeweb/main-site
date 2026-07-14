'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionItem {
  label: string;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'danger';
}

interface ActionMenuProps {
  actions: ActionItem[];
}

export function ActionMenu({ actions }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded hover:bg-slate-100 text-slate-400"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[160px]"
          dir="rtl"
        >
          {actions.map((action, i) =>
            action.href ? (
              <Link
                key={i}
                href={action.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block w-full text-right px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                  action.variant === 'danger' ? 'text-red-600' : 'text-slate-700'
                )}
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={() => {
                  action.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  'w-full text-right px-3 py-2 text-sm hover:bg-slate-50 transition-colors',
                  action.variant === 'danger' ? 'text-red-600' : 'text-slate-700'
                )}
              >
                {action.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
