import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FastWebExampleLanding from "@/components/fastweb/FastWebExampleLanding";
import {
  getFastWebExamplePath,
  getFastWebIndustry,
  getProofFastWebIndustries,
  isFastWebIndustrySlug,
  isIndexableFastWebIndustry,
} from "@/lib/fastweb/industries";
import { canonicalUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

export function generateStaticParams() {
  // Example pages only for proof industries in this phase
  return getProofFastWebIndustries().map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Promise<Metadata> {
  const slug = params.industry.toLowerCase().trim();
  if (!isFastWebIndustrySlug(slug)) return { title: "نمونه" };

  const industry = getFastWebIndustry(slug);
  if (!industry?.examples[0]) return { title: "نمونه" };

  const example = industry.examples[0];
  const indexable = isIndexableFastWebIndustry(slug);
  const title = `نمونه سایت ${industry.name} | ${example.conceptName} | FastWeb`;
  const description = `${example.whyStructure} ${example.disclaimer}`;
  const path = getFastWebExamplePath(slug);

  return {
    title: { absolute: title },
    description: description.slice(0, 160),
    alternates: { canonical: path },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: canonicalUrl(path),
      type: "website",
      locale: "fa_IR",
    },
  };
}

export default function FastWebExampleIndustryPage({
  params,
}: {
  params: { industry: string };
}) {
  const slug = params.industry.toLowerCase().trim();
  if (!isFastWebIndustrySlug(slug)) notFound();

  const industry = getFastWebIndustry(slug);
  // Only proof industries have example routes in this phase
  if (!industry || !getProofFastWebIndustries().some((i) => i.slug === slug)) {
    notFound();
  }

  return <FastWebExampleLanding industry={industry} />;
}
