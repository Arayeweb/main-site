import { InvoicePrintView } from '@/components/admin/invoices/InvoicePrintView';

export default async function ManagerInvoicePrintPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <InvoicePrintView
      id={id}
      backHref={`/admin/manager/invoices/${id}`}
      panelLabel="مدیریت"
    />
  );
}
