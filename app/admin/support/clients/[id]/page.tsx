'use client';

import { use } from 'react';
import { ClientDetailPage } from '@/components/admin/pages/ClientDetailPage';

export default function SupportClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ClientDetailPage
      clientId={id}
      backHref="/admin/support/clients"
      panelLabel="پشتیبانی"
    />
  );
}
