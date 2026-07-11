import { canonicalUrl } from "@/lib/siteUrl";
import { getIndexablePromptPaths } from "@/lib/prompts/indexable";

/** Paths included in /sitemap.xml — indexable marketing pages only. */
export const SITEMAP_PATHS = [
  "/",
  "/seo",
  "/seo/doctor",
  "/seo/clinic",
  "/website/doctor",
  "/website/clinic",
  "/free-seo-audit",
  "/doctors",
  "/bizcard",
  "/adready",
  "/website-design",
  "/googlesabt",
  "/ai",
  "/ai/pricing",
  "/ai/features",
  "/ai/personas",
  "/ai/learn/chatgpt",
  "/ai/learn/image",
  "/ai/learn/video",
  "/blog/doctor-website-seo-mistakes",
  "/blog/clinic-seo-checklist",
  "/blog/local-seo-for-doctors",
  "/blog/clinic-website-features",
  "/prompts",
] as const;

/** Paths that must never appear in the sitemap (internal / noindex). */
export const SITEMAP_EXCLUDED_PATTERNS = [
  /^\/admin(?:\/|$)/,
  /^\/demo(?:\/|$)/,
  /^\/showcase(?:\/|$)/,
  /^\/ai\/runs(?:\/|$)/,
  /^\/ai\/battle(?:\/|$)/,
  /^\/ai\/share(?:\/|$)/,
  /^\/b\/[^/]+$/,
  /^\/seo\/(?!doctor$|clinic$)/,
  /^\/website\/(?!doctor$|clinic$)/,
] as const;

export function isSitemapExcludedPath(path: string): boolean {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return SITEMAP_EXCLUDED_PATTERNS.some((re) => re.test(normalized));
}

export function buildSitemapEntries(): { url: string; lastModified: Date }[] {
  const promptPaths = getIndexablePromptPaths().filter((path) => path !== "/prompts");
  const paths = Array.from(new Set<string>([...SITEMAP_PATHS, ...promptPaths]));
  return paths.map((path) => ({
    url: canonicalUrl(path),
    lastModified: new Date(),
  }));
}
