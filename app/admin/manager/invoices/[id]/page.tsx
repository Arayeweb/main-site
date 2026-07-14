import { InvoiceDetailPage } from '@/components/admin/pages/InvoicesPage';

export default async function ManagerInvoiceDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetailPage id={id} backHref="/admin/manager/invoices" panelLabel="مدیریت" />;
}

