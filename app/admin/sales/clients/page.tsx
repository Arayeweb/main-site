'use client';

import { ClientsListPage } from '@/components/admin/pages/ClientsListPage';

export default function SalesClientsPage() {
  return (
    <ClientsListPage
      panel="sales"
      detailBasePath="/admin/sales/clients"
      description="مشتریان فعال و تاریخچه همکاری"
    />
  );
}
