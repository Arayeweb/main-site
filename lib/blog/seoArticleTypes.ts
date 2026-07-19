import type { BlogClusterId } from "@/lib/blog/clusters";

export type SeoArticlePerson = {
  name: string;
  role?: string;
};

export type SeoArticleTocItem = {
  id: string;
  label: string;
};

export type SeoArticleFaq = {
  question: string;
  answer: string;
};

export type SeoArticleSource = {
  label: string;
  href?: string;
};

export type SeoArticleRelated = {
  href: string;
  label: string;
};

export type SeoArticleCta = {
  title: string;
  description: string;
  href: string;
  label: string;
};

/** Fields required for the professional SEO blog article template. */
export type SeoBlogArticle = {
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  description: string;
  h1: string;
  excerpt: string;
  category: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  searchIntent?: string;
  author: SeoArticlePerson;
  reviewer?: SeoArticlePerson;
  publishedAt: string;
  updatedAt: string;
  publishedLabel?: string;
  updatedLabel?: string;
  readTime: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  tableOfContents: SeoArticleTocItem[];
  contentHtml: string;
  faq?: SeoArticleFaq[];
  sources?: SeoArticleSource[];
  relatedPosts?: SeoArticleRelated[];
  primaryCTA: SeoArticleCta;
  primaryLandingPage?: string;
  clusterHub?: BlogClusterId;
  indexStatus?: "index" | "noindex";
};

export const DEFAULT_ARTICLE_AUTHOR: SeoArticlePerson = {
  name: "تیم محتوای آرایه",
  role: "نویسنده",
};

export const DEFAULT_ARTICLE_REVIEWER: SeoArticlePerson = {
  name: "تیم محصول آرایه",
  role: "بازبین",
};
