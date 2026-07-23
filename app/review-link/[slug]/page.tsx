import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolProgrammaticLanding from "@/components/tools/ToolProgrammaticLanding";
import { buildToolProgrammaticPage } from "@/lib/tools/toolPageContent";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";
import { buildToolProgrammaticJsonLd, toolProgrammaticMetadata } from "@/lib/tools/toolSeo";

type Props = { params: { slug: string } };
export const dynamic = "force-static";
export function generateStaticParams() {
  return getPublishedToolPages("review-link").map((page) => ({ slug: page.slug }));
}
export function generateMetadata({ params }: Props): Metadata {
  const page = buildToolProgrammaticPage("review-link", params.slug);
  return page ? toolProgrammaticMetadata(page) : {};
}
export default function ReviewLinkIndustryPage({ params }: Props) {
  const page = buildToolProgrammaticPage("review-link", params.slug);
  if (!page) notFound();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildToolProgrammaticJsonLd(page)) }} />
      <ToolProgrammaticLanding page={page} />
    </>
  );
}
