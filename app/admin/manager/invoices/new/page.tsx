'use client';

import { NewInvoicePage } from '@/components/admin/invoices/NewInvoiceForm';

export default function ManagerNewInvoicePage() {
  return <NewInvoicePage panelLabel="مدیریت" listHref="/admin/manager/invoices" />;
}
