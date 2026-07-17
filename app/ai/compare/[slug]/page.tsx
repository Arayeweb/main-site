import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CompareArticle from "@/components/ai/CompareArticle";
import {
  getAllCompareSlugs,
  getComparePage,
} from "@/lib/aiComparePageData";
import { canonicalUrl } from "@/lib/siteUrl";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return getAllCompareSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getComparePage(params.slug);
  if (!page) return {};
  return {
    title: { absolute: page.title },
    description: page.description,
    alternates: { canonical: canonicalUrl(`/ai/compare/${page.slug}`) },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonicalUrl(`/ai/compare/${page.slug}`),
      siteName: "آرایه",
      locale: "fa_IR",
    },
  };
}

export default function CompareSlugPage({ params }: Props) {
  const page = getComparePage(params.slug);
  if (!page) notFound();
  return (
    <div className="ar-compare-page">
      <CompareArticle page={page} />
    </div>
  );
}
