'use client';

import { use } from 'react';
import { ClientDetailPage } from '@/components/admin/pages/ClientDetailPage';

export default function SalesClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ClientDetailPage
      clientId={id}
      backHref="/admin/sales/clients"
      panelLabel="فروش"
    />
  );
}
