import type { Metadata } from "next";
import DemoSitePage from "@/components/demo/DemoSitePage";

export const metadata: Metadata = {
  title: "نمونه‌سایت روان‌شناسی | دموی آرایه",
  description: "نمونه‌ای از سایت اختصاصی که آرایه می‌تواند برای مرکز مشاوره شما بسازد.",
  robots: { index: false, follow: false },
};

export default function PsychologistDemoPage({
  searchParams,
}: {
  searchParams?: { package?: string };
}) {
  return <DemoSitePage specialty="psychologist" packageParam={searchParams?.package} />;
}
