'use client';

import { ContractsListPage } from '@/components/admin/pages/ContractsListPage';

export default function SalesContractsPage() {
  return (
    <ContractsListPage
      panelLabel="فروش"
      showCreate
      detailBasePath="/admin/sales/contracts"
      newHref="/admin/sales/contracts/new"
    />
  );
}
