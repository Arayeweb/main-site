import { AdminLayout } from '@/components/admin/layout/AdminLayout';

export default function SalesPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout panel="sales">{children}</AdminLayout>;
}
