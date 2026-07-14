import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, canonicalUrl } from "@/lib/siteUrl";
import { getAllShowDemoSlugs, getShowDemoEntry } from "@/lib/showdemoto/registry";
import { sfJsonLd } from "@/lib/showdemoto/salamat-farda/config";
import { pedJsonLd } from "@/lib/showdemoto/pediatric/config";

export function generateStaticParams() {
  return getAllShowDemoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getShowDemoEntry(slug);
  if (!entry) return { title: "نمونه یافت نشد" };

  return {
    title: `${entry.title} | نمونه طراحی`,
    description: entry.description,
    alternates: { canonical: canonicalUrl(entry.page) },
    robots: { index: false, follow: false },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: `${SITE_URL}${entry.page}`,
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default async function ShowDemoToPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getShowDemoEntry(slug);
  if (!entry) notFound();

  const Component = entry.Component;

  return (
    <>
      {slug === "salamat-farda-eye" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(sfJsonLd) }}
        />
      ) : null}
      {slug === "dr-ahmadi-pediatric" ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(pedJsonLd) }}
        />
      ) : null}
      <Component />
    </>
  );
}
