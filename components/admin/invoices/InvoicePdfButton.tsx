'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchInvoiceById, type ApiInvoice } from '@/lib/adminApi';
import { printInvoiceById } from '@/lib/invoicePrint';

interface InvoicePdfButtonProps {
  invoiceId: string;
  invoice?: ApiInvoice;
  label?: string;
  className?: string;
  variant?: 'primary' | 'ghost';
}

export function InvoicePdfButton({
  invoiceId,
  invoice,
  label = 'دانلود PDF',
  className,
  variant = 'ghost',
}: InvoicePdfButtonProps) {
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    setBusy(true);
    try {
      const ok = await printInvoiceById(invoiceId, invoice);
      if (!ok) alert('خطا در بارگذاری فاکتور');
    } finally {
      setBusy(false);
    }
  }

  const base =
    variant === 'primary'
      ? 'bg-slate-900 text-white hover:bg-slate-800'
      : 'border border-slate-200 text-slate-700 hover:bg-slate-50';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-60',
        base,
        className
      )}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {label}
    </button>
  );
}
