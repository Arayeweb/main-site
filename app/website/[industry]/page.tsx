import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { IndustrySlug } from "@/lib/seo/industries";
import { industries } from "@/lib/seo/industries";
import { getIndustryLandingPageContent } from "@/lib/seo/pageContent";
import type { ServiceType } from "@/lib/seo/pageContent";
import { isIndexableMvp } from "@/lib/seo/indexable";
import IndustryLandingPage from "@/components/seo/IndustryLandingPage";

const normalizeSlug = (v: string): IndustrySlug | null => {
  const s = String(v || "").toLowerCase().trim();
  const ok = industries.some((i) => i.slug === s);
  return ok ? (s as IndustrySlug) : null;
};

export const dynamic = "force-static";

export function generateStaticParams() {
  return industries.map((i) => ({ industry: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { industry: string };
}): Promise<Metadata> {
  const slug = normalizeSlug(params.industry);
  if (!slug) return { title: "صفحه" };

  const serviceType: ServiceType = "website";
  const page = getIndustryLandingPageContent(serviceType, slug);
  const indexable = isIndexableMvp(serviceType, slug);

  // absolute: جلوگیری از دوباره‌شدن «| آرایه» به‌خاطر title.template در root layout
  return {
    title: { absolute: page.meta.title },
    description: page.meta.description,
    alternates: { canonical: page.meta.canonicalPath },
    robots: {
      index: indexable,
      follow: true,
      googleBot: { index: indexable, follow: true },
    },
    openGraph: {
      title: page.meta.title,
      description: page.meta.description,
      url: page.meta.canonicalPath,
      type: "website",
      locale: "fa_IR",
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta.title,
      description: page.meta.description,
    },
  };
}

export default function WebsiteIndustryPage({ params }: { params: { industry: string } }) {
  const slug = normalizeSlug(params.industry);
  if (!slug) notFound();

  const serviceType: ServiceType = "website";
  const page = getIndustryLandingPageContent(serviceType, slug);

  return <IndustryLandingPage page={page} />;
}

