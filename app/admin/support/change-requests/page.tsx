'use client';

import { ChangeRequestsListPage } from '@/components/admin/pages/ChangeRequestsPage';

export default function SupportChangeRequestsPage() {
  return <ChangeRequestsListPage panelLabel="پشتیبانی" detailBasePath="/admin/support/change-requests" />;
}
