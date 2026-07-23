import type { Metadata } from "next";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";

export const metadata: Metadata = {
  title: "مرکز رشد",
  robots: { index: false, follow: false },
};

// Staff Growth Hub reuses the existing admin chrome (D-017). Access is gated by
// the existing /admin middleware (ary_admin) plus assertGrowthHubStaffAccess in
// each page/action (araaye_admin only).
export default function AdminGrowthHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout panel="manager">{children}</AdminLayout>;
}
