import type { Metadata } from "next";
import { Suspense } from "react";
import ContentSalesLanding from "@/components/content-sales/ContentSalesLanding";

export const metadata: Metadata = {
  title: "Content & Sales Bundle | Araaye AI — محتوا و فروش در ۷ روز",
  description:
    "پکیج ۵۹۰ هزار تومانی: ۱ ماه اکانت Araaye AI + ۳۰ ریلز + ۳۰ کپشن + ۲۰ دایرکت + کمپین فروش اینستاگرام.",
  alternates: { canonical: "/ai/content-sales" },
  openGraph: {
    title: "Araaye AI Content & Sales Bundle",
    description: "خروجی آماده برای محتوا و فروش — نه فقط چت AI",
    url: "/ai/content-sales",
    locale: "fa_IR",
  },
};

export default function ContentSalesPage() {
  return (
    <Suspense fallback={<div className="ar-container" style={{ padding: 80, textAlign: "center" }}>...</div>}>
      <ContentSalesLanding />
    </Suspense>
  );
}
