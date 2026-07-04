'use client';

import { ChangeRequestsListPage } from '@/components/admin/pages/ChangeRequestsPage';

export default function ManagerChangeRequestsPage() {
  return <ChangeRequestsListPage panelLabel="مدیریت" detailBasePath="/admin/support/change-requests" />;
}
