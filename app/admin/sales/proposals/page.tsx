'use client';

import { ProposalsListPage } from '@/components/admin/pages/ProposalsPage';

export default function SalesProposalsPage() {
  return (
    <ProposalsListPage
      panelLabel="فروش"
      detailBasePath="/admin/sales/proposals"
      newHref="/admin/sales/proposals/new"
    />
  );
}
