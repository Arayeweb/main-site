'use client';

import { use } from 'react';
import { InvoicePrintView } from '@/components/admin/invoices/InvoicePrintView';

export default function SalesInvoicePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <InvoicePrintView
      id={id}
      backHref={`/admin/sales/invoices/${id}`}
      panelLabel="فروش"
    />
  );
}
