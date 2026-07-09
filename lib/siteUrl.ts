/** Canonical site origin — no trailing slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://araaye.com").replace(
  /\/$/,
  ""
);

/** Normalize a path: leading slash, no trailing slash (except root). */
export function normalizePath(path: string): string {
  if (!path || path === "/") return "/";
  const withLeading = path.startsWith("/") ? path : `/${path}`;
  const trimmed = withLeading.replace(/\/+$/, "");
  return trimmed || "/";
}

/** Absolute URL for a site path (no trailing slash on non-root paths). */
export function absoluteUrl(path: string = "/"): string {
  const normalized = normalizePath(path);
  return normalized === "/" ? SITE_URL : `${SITE_URL}${normalized}`;
}

/** Canonical URL for a page — same as absoluteUrl (site uses no trailing slashes). */
export function canonicalUrl(path: string = "/"): string {
  return absoluteUrl(path);
}
