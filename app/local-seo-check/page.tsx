import type { Metadata } from "next";
import GrowthToolHubPage, { getGrowthToolHubCopy } from "@/components/tools/GrowthToolHubPage";
import { buildToolHubJsonLd } from "@/lib/tools/toolSeo";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";

const hub = "local-seo-check" as const;
const copy = getGrowthToolHubCopy(hub);

export const metadata: Metadata = {
  title: { absolute: "تست رایگان سئو محلی و گوگل مپ | آرایه" },
  description: copy.lead,
  alternates: { canonical: "/local-seo-check" },
};

export default function LocalSeoCheckPage() {
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
