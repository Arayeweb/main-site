import type { Metadata } from "next";
import DemoSitePage from "@/components/demo/DemoSitePage";

export const metadata: Metadata = {
  title: "نمونه‌سایت کلینیک عمومی | دموی آرایه",
  description: "نمونه‌ای از سایت اختصاصی که آرایه می‌تواند برای کلینیک درمانی شما بسازد.",
  robots: { index: false, follow: false },
};

export default function ClinicDemoPage({
  searchParams,
}: {
  searchParams?: { package?: string };
}) {
  return <DemoSitePage specialty="clinic" packageParam={searchParams?.package} />;
}
