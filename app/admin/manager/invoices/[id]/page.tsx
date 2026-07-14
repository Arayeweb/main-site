'use client';

import { use } from 'react';
import { InvoiceDetailPage } from '@/components/admin/pages/InvoicesPage';

export default function ManagerInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <InvoiceDetailPage id={id} backHref="/admin/manager/invoices" panelLabel="مدیریت" />;
}

