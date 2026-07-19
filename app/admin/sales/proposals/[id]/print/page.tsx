import { InvoicePrintView } from '@/components/admin/invoices/InvoicePrintView';

export default async function SalesProposalPrintPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <InvoicePrintView
      id={id}
      backHref={`/admin/sales/proposals/${id}`}
      panelLabel="فروش"
    />
  );
}
