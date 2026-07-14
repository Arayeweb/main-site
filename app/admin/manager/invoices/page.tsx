'use client';

import { InvoicesListPage } from '@/components/admin/pages/InvoicesPage';

export default function ManagerInvoicesPage() {
  return <InvoicesListPage panelLabel="مدیریت" detailBasePath="/admin/manager/invoices" />;
}

