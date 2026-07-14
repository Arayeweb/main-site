'use client';

import { InvoicesListPage } from '@/components/admin/pages/InvoicesPage';

export default function SalesInvoicesPage() {
  return <InvoicesListPage panelLabel="فروش" detailBasePath="/admin/sales/invoices" />;
}

