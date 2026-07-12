'use client';

import { use } from 'react';
import { TicketDetailPage } from '@/components/admin/pages/TicketDetailPage';

export default function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <TicketDetailPage
      id={id}
      backHref="/admin/support/tickets"
      panelLabel="پشتیبانی"
    />
  );
}
