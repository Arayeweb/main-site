import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FastWebPublicSite from "@/components/fastweb/FastWebPublicSite";
import { hasPreviewContent } from "@/lib/fastwebContent";
import type { FastWebPreviewContent } from "@/lib/fastweb";
import { findPublishedBySlug } from "@/lib/fastwebServer";
import { canonicalUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { params: { slug: string } };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const order = await findPublishedBySlug(params.slug);
  if (!order) return { title: "سایت یافت نشد" };
  const content =
    (hasPreviewContent(order.publishedContent)
      ? order.publishedContent
      : order.previewContent) as Partial<FastWebPreviewContent>;
  return {
    title: content.seoTitle || order.businessName || "سایت کسب‌وکار",
    description: content.seoDescription || content.subheadline || undefined,
    alternates: { canonical: canonicalUrl(`/s/${params.slug}`) },
    robots:
      order.fulfillmentStatus === "published"
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}

export default async function PublicFastWebSitePage({ params }: PageProps) {
  const order = await findPublishedBySlug(params.slug);
  if (!order) notFound();

  const content = (
    hasPreviewContent(order.publishedContent)
      ? order.publishedContent
      : order.previewContent
  ) as FastWebPreviewContent;

  if (!hasPreviewContent(content)) notFound();

  return (
    <FastWebPublicSite slug={params.slug} content={content} brief={order.brief} />
  );
}
