'use client';

import { ProposalsListPage } from '@/components/admin/pages/ProposalsPage';

export default function ManagerProposalsPage() {
  return (
    <ProposalsListPage
      panelLabel="مدیریت"
      detailBasePath="/admin/manager/proposals"
    />
  );
}
