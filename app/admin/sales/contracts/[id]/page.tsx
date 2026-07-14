import { ContractDetailPage } from '@/components/admin/pages/ContractDetailPage';

export default async function SalesContractDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ContractDetailPage
      id={id}
      backHref="/admin/sales/contracts"
      panelLabel="فروش"
      showAdminActions
      projectHandoffOnly
      paymentsHref="/admin/sales/proposals"
    />
  );
}
