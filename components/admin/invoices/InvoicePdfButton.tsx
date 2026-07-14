'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoicePdfButtonProps {
  printHref: string;
  label?: string;
  className?: string;
  variant?: 'primary' | 'ghost';
}

export function InvoicePdfButton({
  printHref,
  label = 'مشاهده / چاپ',
  className,
  variant = 'ghost',
}: InvoicePdfButtonProps) {
  const base =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : 'border border-slate-200 text-slate-700 hover:bg-slate-50';

  return (
    <Link
      href={printHref}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors',
        base,
        className
      )}
    >
      <Download className="w-4 h-4" />
      {label}
    </Link>
  );
}
