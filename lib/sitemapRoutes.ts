import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/lib/siteUrl";
import { getPublishedIndustryPaths } from "@/lib/seo/programmaticPages";
import { getIndexablePromptPaths } from "@/lib/prompts/indexable";
import { getSitemapLastMod } from "@/lib/blog/postUpdatedAt";
import { LEGACY_MIGRATED_SLUGS } from "@/lib/blog/legacyArticleData";

/** Static marketing paths always in sitemap. */
const STATIC_SITEMAP_PATHS = [
  "/",
  "/about",
  "/contact",
  "/seo",
  "/free-seo-audit",
  "/doctors",
  "/doctors/audit",
  "/bizcard",
  "/adready",
  "/fastweb",
  "/website-design",
  "/googlesabt",
  "/modares",
  "/ai",
  "/ai/pricing",
  "/ai/features",
  "/ai/compare",
  "/ai/compare/chatgpt-vs-gemini",
  "/ai/compare/chatgpt-vs-claude",
  "/ai/compare/claude-vs-gemini",
  "/ai/compare/chatgpt-vs-deepseek",
  "/ai/compare/best-ai-for-coding",
  "/ai/compare/best-ai-for-persian",
  "/ai/compare/best-ai-for-content",
  "/ai/personas",
  "/ai/learn/chatgpt",
  "/ai/learn/image",
  "/ai/learn/video",
  "/blog",
  "/blog/doctor-website-seo-mistakes",
  "/blog/clinic-seo-checklist",
  "/blog/local-seo-for-doctors",
  "/blog/clinic-website-features",
  "/blog/jozb-shagerd-khososi",
  "/blog/jozb-shagerd-zaban",
  "/blog/matn-tablig-tadris-khososi",
  ...LEGACY_MIGRATED_SLUGS.map((slug) => `/blog/${slug}`),
  "/clinic",
  "/restaurant",
  "/software",
  "/portfolio",
  "/results",
  "/hamkari",
  "/qr",
  "/shortener",
  "/prompts",
] as const;

/** Paths that must never appear in the sitemap (internal / noindex). */
export const SITEMAP_EXCLUDED_PATTERNS = [
  /^\/admin(?:\/|$)/,
  /^\/demo(?:\/|$)/,
  /^\/showcase(?:\/|$)/,
  /^\/showdemoto(?:\/|$)/,
  /^\/ai\/runs(?:\/|$)/,
  /^\/ai\/battle(?:\/|$)/,
  /^\/ai\/share(?:\/|$)/,
  /^\/b\/[^/]+$/,
  /^\/s\/[^/]+$/,
] as const;

/** @deprecated Use buildSitemapEntries — kept for tests referencing path list. */
export const SITEMAP_PATHS = [
  ...STATIC_SITEMAP_PATHS,
  ...getPublishedIndustryPaths("seo"),
  ...getPublishedIndustryPaths("website"),
] as const;

export function isSitemapExcludedPath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return SITEMAP_EXCLUDED_PATTERNS.some((re) => re.test(normalized));
}

export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const promptPaths = getIndexablePromptPaths().filter((path) => path !== "/prompts");
  const industryPaths = [
    ...getPublishedIndustryPaths("seo"),
    ...getPublishedIndustryPaths("website"),
  ];
  const paths = Array.from(
    new Set<string>([...STATIC_SITEMAP_PATHS, ...industryPaths, ...promptPaths]),
  ).filter((path) => !isSitemapExcludedPath(path));

  return paths.map((path) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: canonicalUrl(path),
    };
    const lastMod = getSitemapLastMod(path);
    if (lastMod) {
      entry.lastModified = new Date(lastMod);
    }
    return entry;
  });
}
