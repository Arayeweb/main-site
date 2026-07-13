'use client';

import { use } from 'react';
import { ContractDetailPage } from '@/components/admin/pages/ContractDetailPage';

export default function SalesContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
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
