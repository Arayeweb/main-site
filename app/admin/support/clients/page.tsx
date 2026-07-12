'use client';

import { ClientsListPage } from '@/components/admin/pages/ClientsListPage';

export default function SupportClientsPage() {
  return (
    <ClientsListPage
      panel="support"
      detailBasePath="/admin/support/clients"
      description="وضعیت پشتیبانی مشتریان فعال"
    />
  );
}
