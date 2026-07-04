'use client';

import { use } from 'react';
import { ChangeRequestDetailPage } from '@/components/admin/pages/ChangeRequestsPage';

export default function SupportChangeRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ChangeRequestDetailPage
      id={id}
      backHref="/admin/support/change-requests"
      panelLabel="پشتیبانی"
    />
  );
}
