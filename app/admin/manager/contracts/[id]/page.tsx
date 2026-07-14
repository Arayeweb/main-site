import { ContractDetailPage } from '@/components/admin/pages/ContractDetailPage';

export default async function ManagerContractDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ContractDetailPage
      id={id}
      backHref="/admin/manager/contracts"
      panelLabel="مدیریت"
    />
  );
}
