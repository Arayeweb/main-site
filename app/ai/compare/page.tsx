import type { Metadata } from "next";
import CompareHub from "@/components/ai/CompareHub";
import { COMPARE_HUB } from "@/lib/aiComparePageData";
import { canonicalUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: { absolute: COMPARE_HUB.title },
  description: COMPARE_HUB.description,
  alternates: { canonical: canonicalUrl("/ai/compare") },
  openGraph: {
    title: COMPARE_HUB.title,
    description: COMPARE_HUB.description,
    url: canonicalUrl("/ai/compare"),
    siteName: "آرایه",
    locale: "fa_IR",
  },
};

export default function CompareHubPage() {
  return <CompareHub />;
}
