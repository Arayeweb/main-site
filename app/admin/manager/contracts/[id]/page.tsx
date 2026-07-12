'use client';

import { use } from 'react';
import { ContractDetailPage } from '@/components/admin/pages/ContractDetailPage';

export default function ManagerContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ContractDetailPage
      id={id}
      backHref="/admin/manager/contracts"
      panelLabel="مدیریت"
    />
  );
}
