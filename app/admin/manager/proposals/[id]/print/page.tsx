import { InvoicePrintView } from '@/components/admin/invoices/InvoicePrintView';

export default async function ManagerProposalPrintPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <InvoicePrintView
      id={id}
      backHref={`/admin/manager/proposals/${id}`}
      panelLabel="مدیریت"
    />
  );
}
