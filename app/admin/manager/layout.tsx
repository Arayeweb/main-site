import { AdminLayout } from '@/components/admin/layout/AdminLayout';

export default function ManagerPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout panel="manager">{children}</AdminLayout>;
}
