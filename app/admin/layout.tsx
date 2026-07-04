import type { Metadata } from 'next';
import { AdminDebugProbe } from '@/components/admin/AdminDebugProbe';

export const metadata: Metadata = {
  title: {
    default: 'پنل مدیریت | آرایه',
    template: '%s | پنل آرایه',
  },
  robots: { index: false, follow: false },
};

// ChatWidget is suppressed for /admin/* via PublicOnlyChrome in root layout.
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminDebugProbe />
      {children}
    </>
  );
}
