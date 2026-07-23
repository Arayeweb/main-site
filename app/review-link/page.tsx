import type { Metadata } from "next";
import GrowthToolHubPage, { getGrowthToolHubCopy } from "@/components/tools/GrowthToolHubPage";
import { buildToolHubJsonLd } from "@/lib/tools/toolSeo";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";

const hub = "review-link" as const;
const copy = getGrowthToolHubCopy(hub);

export const metadata: Metadata = {
  title: { absolute: "ساخت لینک نظر گوگل و QR رایگان | آرایه" },
  description: copy.lead,
  alternates: { canonical: "/review-link" },
};

export default function ReviewLinkPage() {
  const jsonLd = buildToolHubJsonLd({
    hub,
    name: copy.title,
    description: copy.lead,
    faqs: copy.faq,
    children: getPublishedToolPages(hub),
  });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <GrowthToolHubPage hub={hub} />
    </>
  );
}
