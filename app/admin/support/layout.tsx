import { AdminLayout } from '@/components/admin/layout/AdminLayout';

export default function SupportPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout panel="support">{children}</AdminLayout>;
}
