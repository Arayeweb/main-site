import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GrowthHubHome } from "@/components/growth-hub/GrowthHubHome";
import { getGrowthHubFixture } from "@/lib/growth-hub/fixtures/home";

export const metadata: Metadata = {
  title: "پیش‌نمایش مرکز رشد آرایه",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default function GrowthHubDevPreview({
  searchParams,
}: {
  searchParams: { scenario?: string };
}) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <GrowthHubHome fixture={getGrowthHubFixture(searchParams.scenario)} />;
}
