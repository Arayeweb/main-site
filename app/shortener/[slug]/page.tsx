import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ToolProgrammaticLanding from "@/components/tools/ToolProgrammaticLanding";
import { buildToolProgrammaticPage } from "@/lib/tools/toolPageContent";
import { getPublishedToolPages } from "@/lib/tools/toolRegistry";
import {
  buildToolProgrammaticJsonLd,
  toolProgrammaticMetadata,
} from "@/lib/tools/toolSeo";

type Props = { params: { slug: string } };

export const dynamic = "force-static";

export function generateStaticParams() {
  return getPublishedToolPages("shortener").map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = buildToolProgrammaticPage("shortener", params.slug);
  if (!page) return {};
  return toolProgrammaticMetadata(page);
}

export default function ShortenerSlugPage({ params }: Props) {
  const page = buildToolProgrammaticPage("shortener", params.slug);
  if (!page) notFound();
  const jsonLd = buildToolProgrammaticJsonLd(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolProgrammaticLanding page={page} />
    </>
  );
}
