import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import FastWebPublicSite from "@/components/fastweb/FastWebPublicSite";
import { hasPreviewContent } from "@/lib/fastwebContent";
import type { FastWebPreviewContent } from "@/lib/fastweb";
import { findPublishedBySlug } from "@/lib/fastwebServer";
import { canonicalUrl } from "@/lib/siteUrl";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = { params: { slug: string } };

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

async function findShortLinkTarget(slug: string): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("short_links")
      .select("id, target_url, is_active, clicks")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data || !data.is_active || !data.target_url) return null;

    void supabase
      .from("short_links")
      .update({ clicks: (data.clicks || 0) + 1 })
      .eq("id", data.id)
      .then(
        () => {},
        () => {}
      );

    return data.target_url;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = normalizeSlug(params.slug);
  const order = await findPublishedBySlug(slug);
  if (!order) return { title: "سایت یافت نشد" };
  const content =
    (hasPreviewContent(order.publishedContent)
      ? order.publishedContent
      : order.previewContent) as Partial<FastWebPreviewContent>;
  return {
    title: content.seoTitle || order.businessName || "سایت کسب‌وکار",
    description: content.seoDescription || content.subheadline || undefined,
    alternates: { canonical: canonicalUrl(`/s/${slug}`) },
    robots:
      order.fulfillmentStatus === "published"
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}

export default async function PublicFastWebSitePage({ params }: PageProps) {
  const slug = normalizeSlug(params.slug);
  const shortTarget = await findShortLinkTarget(slug);
  if (shortTarget) redirect(shortTarget);

  const order = await findPublishedBySlug(slug);
  if (!order) notFound();

  const content = (
    hasPreviewContent(order.publishedContent)
      ? order.publishedContent
      : order.previewContent
  ) as FastWebPreviewContent;

  if (!hasPreviewContent(content)) notFound();

  return (
    <FastWebPublicSite slug={slug} content={content} brief={order.brief} />
  );
}
