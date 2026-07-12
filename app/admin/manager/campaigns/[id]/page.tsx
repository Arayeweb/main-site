'use client';

import { use } from 'react';
import { CampaignDetailPage } from '@/components/admin/pages/CampaignDetailPage';

export default function ManagerCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <CampaignDetailPage
      id={id}
      backHref="/admin/manager/campaigns"
      panelLabel="مدیریت"
    />
  );
}
