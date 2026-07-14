'use client';

import { use } from 'react';
import { InvoiceDetailPage } from '@/components/admin/pages/InvoicesPage';

export default function SalesInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InvoiceDetailPage id={id} backHref="/admin/sales/invoices" panelLabel="فروش" />;
}

