import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogClusterHub from "@/components/blog/BlogClusterHub";
import { getBlogCluster, resolveClusterPosts } from "@/lib/blog/clusters";
import { canonicalUrl } from "@/lib/siteUrl";
import { organizationProviderRef } from "@/lib/seo/siteIdentity";

const cluster = getBlogCluster("ai");

export const metadata: Metadata = {
  title: { absolute: cluster.metaTitle },
  description: cluster.metaDescription,
  alternates: { canonical: canonicalUrl(cluster.path) },
  openGraph: {
    title: cluster.metaTitle,
    description: cluster.metaDescription,
    url: canonicalUrl(cluster.path),
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: cluster.metaTitle,
    description: cluster.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const articles = resolveClusterPosts(cluster.relatedSlugs);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${canonicalUrl(cluster.path)}#collection`,
      url: canonicalUrl(cluster.path),
      name: cluster.h1,
      description: cluster.metaDescription,
      inLanguage: "fa-IR",
      isPartOf: { "@type": "Blog", name: "بلاگ آرایه", url: canonicalUrl("/blog") },
      about: cluster.primaryKeyword,
      publisher: organizationProviderRef(),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: articles.map((post, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: canonicalUrl(post.href),
          name: post.title,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "بلاگ", item: canonicalUrl("/blog") },
        {
          "@type": "ListItem",
          position: 3,
          name: "هوش مصنوعی",
          item: canonicalUrl(cluster.path),
        },
      ],
    },
  ],
};

export default function BlogAiHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar solid />
      <main className="overflow-x-clip">
        <BlogClusterHub cluster={cluster} />
      </main>
      <Footer />
    </>
  );
}
