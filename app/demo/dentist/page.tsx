import type { Metadata } from "next";
import DemoSitePage from "@/components/demo/DemoSitePage";

export const metadata: Metadata = {
  title: "نمونه‌سایت دندان‌پزشکی | دموی آرایه",
  description: "نمونه‌ای از سایت اختصاصی که آرایه می‌تواند برای مطب دندان‌پزشکی شما بسازد.",
  robots: { index: false, follow: false },
};

export default function DentistDemoPage({
  searchParams,
}: {
  searchParams?: { package?: string };
}) {
  return <DemoSitePage specialty="dentist" packageParam={searchParams?.package} />;
}
