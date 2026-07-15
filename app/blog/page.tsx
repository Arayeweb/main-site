import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogIndexContent from "@/components/blog/BlogIndexContent";
import { canonicalUrl } from "@/lib/siteUrl";
import { organizationProviderRef } from "@/lib/seo/siteIdentity";
import { blogPosts } from "@/lib/blog/posts";

const BLOG_TITLE = "بلاگ آرایه | آموزش سئو، طراحی سایت و رشد کسب‌وکار";
const BLOG_DESCRIPTION =
  "مقاله‌های کاربردی درباره سئو، طراحی سایت تبدیل‌محور، چت‌بات هوشمند و افزایش نرخ تبدیل برای کسب‌وکارها. بلاگ آرایه، راهنمای رشد آنلاین شما.";

export const metadata: Metadata = {
  title: { absolute: BLOG_TITLE },
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: canonicalUrl("/blog"),
  },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: canonicalUrl("/blog"),
    type: "website",
    locale: "fa_IR",
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Blog",
      "@id": `${canonicalUrl("/blog")}#blog`,
      url: canonicalUrl("/blog"),
      name: "بلاگ آرایه",
      description: BLOG_DESCRIPTION,
      inLanguage: "fa-IR",
      publisher: organizationProviderRef(),
      blogPost: blogPosts
        .filter((post) => post.href.startsWith("/blog/"))
        .map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          url: post.href.startsWith("http") ? post.href : canonicalUrl(post.href),
        })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "آرایه", item: canonicalUrl("/") },
        { "@type": "ListItem", position: 2, name: "بلاگ", item: canonicalUrl("/blog") },
      ],
    },
  ],
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar solid />
      <main className="overflow-x-clip">
        <BlogIndexContent />
      </main>
      <Footer />
    </>
  );
}
