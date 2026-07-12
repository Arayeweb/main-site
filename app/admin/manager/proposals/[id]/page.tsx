'use client';

import { use } from 'react';
import { ProposalDetailPage } from '@/components/admin/pages/ProposalsPage';

export default function ManagerProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProposalDetailPage
      id={id}
      backHref="/admin/manager/proposals"
      panelLabel="مدیریت"
    />
  );
}
