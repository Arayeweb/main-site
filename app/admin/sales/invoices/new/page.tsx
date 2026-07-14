'use client';

import { NewInvoicePage } from '@/components/admin/invoices/NewInvoiceForm';

export default function SalesNewInvoicePage() {
  return <NewInvoicePage panelLabel="فروش" listHref="/admin/sales/invoices" />;
}
