import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FastWebIndustryLanding from "@/components/fastweb/FastWebIndustryLanding";
import {
  FASTWEB_INDUSTRIES,
  getFastWebIndustry,
  getFastWebIndustryPath,
  isFastWebIndustrySlug,
  isIndexableFastWebIndustry,
  type FastWebIndustrySlug,
} from "@/lib/fastweb/industries";
import { canonicalUrl } from "@/lib/siteUrl";

export const dynamic = "force-static";

export function generateStaticParams() {
  return FASTWEB_INDUSTRIES.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Promise<Metadata> {
  const slug = params.industry.toLowerCase().trim();
  if (!isFastWebIndustrySlug(slug)) return { title: "صفحه" };

  const industry = getFastWebIndustry(slug)!;
  const indexable = isIndexableFastWebIndustry(slug);
  const canonicalPath = getFastWebIndustryPath(slug);

  return {
    title: { absolute: industry.title },
    description: industry.description,
    alternates: { canonical: canonicalPath },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
    openGraph: {
      title: industry.title,
      description: industry.description,
      url: canonicalUrl(canonicalPath),
      type: "website",
      locale: "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      title: industry.title,
      description: industry.description,
    },
  };
}

export default function FastWebIndustryPage({ params }: { params: { industry: string } }) {
  const slug = params.industry.toLowerCase().trim();
  if (!isFastWebIndustrySlug(slug)) notFound();

  const industry = getFastWebIndustry(slug as FastWebIndustrySlug);
  if (!industry) notFound();

  return <FastWebIndustryLanding industry={industry} />;
}
