'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  colorClass: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ label, colorClass, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full ring-1 font-medium',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        colorClass
      )}
    >
      {label}
    </span>
  );
}
