import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آرایه',
  description: 'سایت‌ساز تبدیل‌محور برای کسب‌وکارها',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
