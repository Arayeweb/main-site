'use client';

import { ClientsListPage } from '@/components/admin/pages/ClientsListPage';

export default function ManagerClientsPage() {
  return (
    <ClientsListPage
      panel="manager"
      detailBasePath="/admin/manager/clients"
    />
  );
}
